import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canWrite } from "@/lib/permissions";
import { z } from "zod";

const updateBookingSchema = z
  .object({
    type: z.enum(["FLIGHT", "HOTEL", "TRAIN", "CAR", "OTHER"]).optional(),
    startDatetime: z.iso.datetime().optional(),
    endDatetime: z.iso.datetime().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (d) =>
      d.type !== undefined ||
      d.startDatetime !== undefined ||
      d.endDatetime !== undefined ||
      d.notes !== undefined,
    { message: "At least one field must be provided" }
  );

async function resolveBooking(bookId: string) {
  return prisma.booking.findUnique({
    where: { id: bookId },
    select: { id: true, destination: { select: { tripId: true } } },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ destId: string; bookId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId } = await params;
  const booking = await resolveBooking(bookId);
  if (!booking) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canWrite(booking.destination.tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = updateBookingSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { type, startDatetime, endDatetime, notes } = result.data;
  const updated = await prisma.booking.update({
    where: { id: bookId },
    data: {
      ...(type !== undefined && { type }),
      ...(startDatetime !== undefined && { startDatetime: new Date(startDatetime) }),
      ...(endDatetime !== undefined && { endDatetime: endDatetime ? new Date(endDatetime) : null }),
      ...(notes !== undefined && { notes }),
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ destId: string; bookId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId } = await params;
  const booking = await resolveBooking(bookId);
  if (!booking) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canWrite(booking.destination.tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.booking.delete({ where: { id: bookId } });

  return new Response(null, { status: 204 });
}
