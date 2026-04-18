import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTripSchema = z
  .object({
    name: z.string().min(1).optional(),
    startDate: z.iso.date().optional(),
  })
  .refine((d) => d.name !== undefined || d.startDate !== undefined, {
    message: "At least one field must be provided",
  });

async function assertOwnerOrCollaborator(
  tripId: string,
  userId: string,
  ownerOnly = false
) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { trip: null, error: "Not found", status: 404 } as const;

  if (trip.ownerId === userId) return { trip, error: null, status: 200 } as const;
  if (ownerOnly) return { trip: null, error: "Forbidden", status: 403 } as const;

  const collab = await prisma.tripCollaborator.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (!collab) return { trip: null, error: "Forbidden", status: 403 } as const;

  return { trip, error: null, status: 200 } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      destinations: {
        orderBy: { position: "asc" },
        include: {
          activities: { orderBy: { position: "asc" } },
          bookings: { orderBy: { startDatetime: "asc" } },
        },
      },
    },
  });

  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  const isOwner = trip.ownerId === session.user.id;
  if (!isOwner) {
    const collab = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId: id, userId: session.user.id } },
    });
    if (!collab) return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(trip);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { trip, error, status } = await assertOwnerOrCollaborator(
    id,
    session.user.id,
    true
  );
  if (error) return Response.json({ error }, { status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = updateTripSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { name, startDate } = result.data;
  const updated = await prisma.trip.update({
    where: { id: trip!.id },
    data: {
      ...(name !== undefined && { name }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error, status } = await assertOwnerOrCollaborator(
    id,
    session.user.id,
    true
  );
  if (error) return Response.json({ error }, { status });

  await prisma.trip.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
