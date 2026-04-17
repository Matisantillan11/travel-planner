import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTripSchema = z.object({
  name: z.string().min(1),
  startDate: z.iso.date(),
});

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      _count: { select: { destinations: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(trips);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createTripSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { name, startDate } = result.data;
  const trip = await prisma.trip.create({
    data: {
      name,
      startDate: new Date(startDate),
      ownerId: session.user.id,
    },
  });

  return Response.json(trip, { status: 201 });
}
