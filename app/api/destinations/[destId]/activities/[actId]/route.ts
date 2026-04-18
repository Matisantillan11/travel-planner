import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canWrite } from "@/lib/permissions";
import { z } from "zod";

const updateActivitySchema = z
  .object({
    name: z.string().min(1).optional(),
    notes: z.string().nullable().optional(),
    isDone: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.name !== undefined || d.notes !== undefined || d.isDone !== undefined,
    { message: "At least one field must be provided" }
  );

async function resolveActivity(actId: string) {
  return prisma.activity.findUnique({
    where: { id: actId },
    select: { id: true, destination: { select: { tripId: true } } },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ destId: string; actId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { actId } = await params;
  const activity = await resolveActivity(actId);
  if (!activity) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canWrite(activity.destination.tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = updateActivitySchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { name, notes, isDone } = result.data;
  const updated = await prisma.activity.update({
    where: { id: actId },
    data: {
      ...(name !== undefined && { name }),
      ...(notes !== undefined && { notes }),
      ...(isDone !== undefined && { isDone }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ destId: string; actId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { actId } = await params;
  const activity = await resolveActivity(actId);
  if (!activity) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canWrite(activity.destination.tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.activity.delete({ where: { id: actId } });

  return new Response(null, { status: 204 });
}
