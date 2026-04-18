import { prisma } from "@/lib/db";

export async function canRead(tripId: string, userId: string): Promise<boolean> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      ownerId: true,
      collaborators: { where: { userId }, select: { id: true } },
    },
  });
  if (!trip) return false;
  return trip.ownerId === userId || trip.collaborators.length > 0;
}

export async function canWrite(tripId: string, userId: string): Promise<boolean> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      ownerId: true,
      collaborators: {
        where: { userId, role: "EDITOR" },
        select: { id: true },
      },
    },
  });
  if (!trip) return false;
  return trip.ownerId === userId || trip.collaborators.length > 0;
}
