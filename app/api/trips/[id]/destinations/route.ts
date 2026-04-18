import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canWrite } from "@/lib/permissions";
import { z } from "zod";

const createDestinationSchema = z.object({
  name: z.string().min(1),
  mapboxPlaceId: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  nights: z.number().int().min(1).default(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;

  if (!(await canWrite(tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = createDestinationSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  const { name, mapboxPlaceId, lat, lng, nights } = result.data;

  const last = await prisma.destination.findFirst({
    where: { tripId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const destination = await prisma.destination.create({
    data: {
      tripId,
      name,
      mapboxPlaceId: mapboxPlaceId ?? null,
      lat,
      lng,
      nights,
      position: last !== null ? last.position + 1 : 0,
    },
  });

  return Response.json(destination, { status: 201 });
}
