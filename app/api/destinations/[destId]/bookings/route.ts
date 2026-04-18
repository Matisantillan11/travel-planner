import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canRead, canWrite } from "@/lib/permissions";
import { z } from "zod";

const createBookingSchema = z.object({
  type: z.enum(["FLIGHT", "HOTEL", "TRAIN", "CAR", "OTHER"]),
  startDatetime: z.iso.datetime(),
  endDatetime: z.iso.datetime().optional(),
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

  const bookings = await prisma.booking.findMany({
    where: { destinationId: destId },
    orderBy: { startDatetime: "asc" },
  });

  return Response.json(bookings);
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

  const result = createBookingSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { type, startDatetime, endDatetime, notes } = result.data;
  const booking = await prisma.booking.create({
    data: {
      destinationId: destId,
      type,
      startDatetime: new Date(startDatetime),
      endDatetime: endDatetime ? new Date(endDatetime) : null,
      notes: notes ?? null,
    },
  });

  return Response.json(booking, { status: 201 });
}
