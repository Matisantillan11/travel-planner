import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import TripCard from "@/components/TripCard";
import NewTripModal from "@/components/NewTripModal";

export const metadata = { title: "My Trips" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect(ROUTES.LOGIN);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">My Trips</h1>
          <NewTripModal />
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-lg text-gray-500">No trips yet.</p>
            <p className="text-sm text-gray-400">
              Create your first trip to start planning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                name={trip.name}
                startDate={trip.startDate}
                updatedAt={trip.updatedAt}
                _count={trip._count}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
