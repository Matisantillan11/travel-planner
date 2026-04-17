import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canWrite } from "@/lib/permissions";
import { z } from "zod";

const updateDestinationSchema = z
  .object({
    name: z.string().min(1).optional(),
    nights: z.number().int().min(1).optional(),
  })
  .refine((d) => d.name !== undefined || d.nights !== undefined, {
    message: "At least one field must be provided",
  });

async function resolveDestination(destId: string, userId: string) {
  const dest = await prisma.destination.findUnique({
    where: { id: destId },
    select: { id: true, tripId: true },
  });
  if (!dest) return { dest: null, error: "Not found", status: 404 } as const;
  if (!(await canWrite(dest.tripId, userId))) {
    return { dest: null, error: "Forbidden", status: 403 } as const;
  }
  return { dest, error: null, status: 200 } as const;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; destId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { destId } = await params;
  const { dest, error, status } = await resolveDestination(destId, session.user.id);
  if (error) return Response.json({ error }, { status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = updateDestinationSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { name, nights } = result.data;
  const updated = await prisma.destination.update({
    where: { id: dest!.id },
    data: {
      ...(name !== undefined && { name }),
      ...(nights !== undefined && { nights }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; destId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId, destId } = await params;
  const { dest, error, status } = await resolveDestination(destId, session.user.id);
  if (error) return Response.json({ error }, { status });

  await prisma.destination.delete({ where: { id: dest!.id } });

  const remaining = await prisma.destination.findMany({
    where: { tripId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  if (remaining.length > 0) {
    await prisma.$transaction(
      remaining.map((d, idx) =>
        prisma.destination.update({ where: { id: d.id }, data: { position: idx } })
      )
    );
  }

  return new Response(null, { status: 204 });
}
