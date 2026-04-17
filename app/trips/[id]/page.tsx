import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canRead } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import TripDestinations from "@/components/TripDestinations";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { destinations: { orderBy: { position: "asc" } } },
  });

  if (!trip) notFound();

  if (!(await canRead(id, session.user.id))) redirect("/dashboard");

  const formattedStart = trip.startDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:underline"
          >
            ← My Trips
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{trip.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Starting {formattedStart}
          </p>
        </div>

        <TripDestinations
          trip={{ id: trip.id, startDate: trip.startDate.toISOString() }}
          initialDestinations={trip.destinations.map((d) => ({
            id: d.id,
            name: d.name,
            nights: d.nights,
            lat: d.lat,
            lng: d.lng,
            position: d.position,
          }))}
        />
      </div>
    </div>
  );
}
