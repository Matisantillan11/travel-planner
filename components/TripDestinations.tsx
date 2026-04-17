"use client";

import { useState } from "react";
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

    await fetch(`/api/trips/${trip.id}/destinations/reorder`, {
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
    const res = await fetch(`/api/trips/${trip.id}/destinations`, {
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
    await fetch(`/api/trips/${trip.id}/destinations/${destId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nights }),
    });
  }

  async function handleRemove(destId: string) {
    const res = await fetch(`/api/trips/${trip.id}/destinations/${destId}`, {
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
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  startDate={computeArrivalDate(trip.startDate, destinations, idx)}
                  onUpdateNights={handleUpdateNights}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
