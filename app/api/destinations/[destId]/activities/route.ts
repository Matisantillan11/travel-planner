import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canRead, canWrite } from "@/lib/permissions";
import { z } from "zod";

const createActivitySchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
});

async function resolveTripId(destId: string): Promise<string | null> {
  const dest = await prisma.destination.findUnique({
    where: { id: destId },
    select: { tripId: true },
  });
  return dest?.tripId ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ destId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { destId } = await params;
  const tripId = await resolveTripId(destId);
  if (!tripId) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canRead(tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const activities = await prisma.activity.findMany({
    where: { destinationId: destId },
    orderBy: { position: "asc" },
  });

  return Response.json(activities);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ destId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { destId } = await params;
  const tripId = await resolveTripId(destId);
  if (!tripId) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canWrite(tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createActivitySchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const last = await prisma.activity.findFirst({
    where: { destinationId: destId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const activity = await prisma.activity.create({
    data: {
      destinationId: destId,
      name: result.data.name,
      notes: result.data.notes ?? null,
      position: last !== null ? last.position + 1 : 0,
    },
  });

  return Response.json(activity, { status: 201 });
}
