"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import DestinationCard from "@/components/DestinationCard";
import DestinationSearch from "@/components/DestinationSearch";
import { API_ROUTES } from "@/lib/routes";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg bg-zinc-800 animate-pulse border border-zinc-700" />
  ),
});

type Destination = {
  id: string;
  name: string;
  nights: number;
  lat: number;
  lng: number;
  position: number;
};

type Trip = {
  id: string;
  startDate: string;
};

type View = "list" | "map";

function computeArrivalDate(tripStart: string, destinations: Destination[], index: number): Date {
  const d = new Date(tripStart);
  for (let i = 0; i < index; i++) {
    d.setDate(d.getDate() + destinations[i].nights);
  }
  return d;
}

export default function TripDestinations({
  trip,
  initialDestinations,
}: {
  trip: Trip;
  initialDestinations: Destination[];
}) {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [view, setView] = useState<View>("list");
  const [highlightedDestId, setHighlightedDestId] = useState<string | null>(null);
  const pendingScrollRef = useRef<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Scroll to card after marker click (fires when highlightedDestId or view changes)
  useEffect(() => {
    const id = pendingScrollRef.current;
    if (!id) return;
    pendingScrollRef.current = null;
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedDestId, view]);

  // Clear highlight after 2 s
  useEffect(() => {
    if (!highlightedDestId) return;
    const timer = setTimeout(() => setHighlightedDestId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedDestId]);

  function handleMarkerClick(id: string) {
    pendingScrollRef.current = id;
    setHighlightedDestId(id);
    setView("list");
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = destinations.findIndex((d) => d.id === active.id);
    const newIndex = destinations.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(destinations, oldIndex, newIndex).map((d, i) => ({
      ...d,
      position: i,
    }));

    setDestinations(reordered);

    await fetch(API_ROUTES.TRIP_DESTINATIONS_REORDER(trip.id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((d) => d.id) }),
    });
  }

  async function handleAdd(place: {
    name: string;
    mapboxPlaceId: string;
    lat: number;
    lng: number;
  }) {
    const res = await fetch(API_ROUTES.TRIP_DESTINATIONS(trip.id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...place, nights: 1 }),
    });
    if (!res.ok) return;
    const dest: Destination = await res.json();
    setDestinations((prev) => [...prev, dest]);
  }

  async function handleUpdateNights(destId: string, nights: number) {
    setDestinations((prev) =>
      prev.map((d) => (d.id === destId ? { ...d, nights } : d))
    );
    await fetch(API_ROUTES.TRIP_DESTINATION(trip.id, destId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nights }),
    });
  }

  async function handleRemove(destId: string) {
    const res = await fetch(API_ROUTES.TRIP_DESTINATION(trip.id, destId), {
      method: "DELETE",
    });
    if (!res.ok) return;
    setDestinations((prev) =>
      prev
        .filter((d) => d.id !== destId)
        .map((d, i) => ({ ...d, position: i }))
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DestinationSearch onSelect={handleAdd} />

      {destinations.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-base">No destinations yet.</p>
          <p className="text-sm mt-1">Search above to add your first stop.</p>
        </div>
      ) : (
        <>
          {/* View toggle — mobile only */}
          <div className="flex gap-1 lg:hidden">
            {(["list", "map"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  view === v
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
                }`}
              >
                {v === "list" ? "List" : "Map"}
              </button>
            ))}
          </div>

          {/* Content: side-by-side on lg+, toggled on mobile */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
            {/* List panel */}
            <div className={view === "map" ? "hidden lg:block" : ""}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={destinations.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3">
                    {destinations.map((dest, idx) => (
                      <div
                        key={dest.id}
                        ref={(el) => {
                          cardRefs.current[dest.id] = el;
                        }}
                      >
                        <DestinationCard
                          destination={dest}
                          startDate={computeArrivalDate(trip.startDate, destinations, idx)}
                          onUpdateNights={handleUpdateNights}
                          onRemove={handleRemove}
                          highlighted={highlightedDestId === dest.id}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Map panel */}
            <div className={`lg:sticky lg:top-4 ${view === "list" ? "hidden lg:block" : ""}`}>
              <MapView
                destinations={destinations}
                onMarkerClick={handleMarkerClick}
                highlightedId={highlightedDestId}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
