"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ActivitiesTab from "@/components/ActivitiesTab";
import BookingsTab from "@/components/BookingsTab";
import { API_ROUTES } from "@/lib/routes";

type Activity = {
  id: string;
  name: string;
  notes: string | null;
  isDone: boolean;
  position: number;
};

type BookingType = "FLIGHT" | "HOTEL" | "TRAIN" | "CAR" | "OTHER";

type Booking = {
  id: string;
  type: BookingType;
  startDatetime: string;
  endDatetime: string | null;
  notes: string | null;
};

type Destination = {
  id: string;
  name: string;
  nights: number;
};

type Props = {
  destination: Destination;
  startDate: Date;
  onUpdateNights: (id: string, nights: number) => void;
  onRemove: (id: string) => void;
  highlighted?: boolean;
};

type Tab = "todo" | "bookings";

function formatDateRange(start: Date, nights: number): string {
  const end = new Date(start);
  end.setDate(end.getDate() + nights);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${fmt(start)} — ${fmt(end)}`;
}

export default function DestinationCard({
  destination,
  startDate,
  onUpdateNights,
  onRemove,
  highlighted = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("todo");
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: destination.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  async function loadActivities() {
    if (activities !== null) return;
    setLoadingActivities(true);
    const res = await fetch(API_ROUTES.DESTINATION_ACTIVITIES(destination.id));
    if (res.ok) {
      const data: Activity[] = await res.json();
      setActivities(data);
    }
    setLoadingActivities(false);
  }

  async function loadBookings() {
    if (bookings !== null) return;
    setLoadingBookings(true);
    const res = await fetch(API_ROUTES.DESTINATION_BOOKINGS(destination.id));
    if (res.ok) {
      const data: Booking[] = await res.json();
      setBookings(data);
    }
    setLoadingBookings(false);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "todo") loadActivities();
    if (tab === "bookings") loadBookings();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white shadow-sm dark:bg-zinc-900 transition-colors duration-300 ${
        highlighted
          ? "border-indigo-400 ring-2 ring-indigo-400/30 dark:border-indigo-400"
          : "border-gray-200 dark:border-zinc-700"
      }`}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-gray-400 hover:text-gray-600 touch-none select-none text-lg leading-none"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{destination.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatDateRange(startDate, destination.nights)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="number"
              min={1}
              value={destination.nights}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (n >= 1) onUpdateNights(destination.id, n);
              }}
              className="w-14 rounded border border-gray-300 px-2 py-1 text-sm text-center dark:border-zinc-600 dark:bg-zinc-800"
            />
            <span>nights</span>
          </label>

          <button
            onClick={() => onRemove(destination.id)}
            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-zinc-800"
            aria-label={`Remove ${destination.name}`}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-t border-gray-100 dark:border-zinc-800">
        {(["todo", "bookings"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
            }`}
          >
            {tab === "todo" ? "Things to Do" : "Bookings"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "todo" && (
          <>
            {loadingActivities && (
              <p className="text-sm text-gray-400 text-center py-4">
                Loading…
              </p>
            )}
            {!loadingActivities && activities === null && (
              <button
                onClick={loadActivities}
                className="w-full text-sm text-gray-400 py-4 hover:text-gray-600"
              >
                Click to load activities
              </button>
            )}
            {activities !== null && (
              <ActivitiesTab
                destId={destination.id}
                initialActivities={activities}
              />
            )}
          </>
        )}
        {activeTab === "bookings" && (
          <>
            {loadingBookings && (
              <p className="text-sm text-gray-400 text-center py-4">
                Loading…
              </p>
            )}
            {!loadingBookings && bookings === null && (
              <button
                onClick={loadBookings}
                className="w-full text-sm text-gray-400 py-4 hover:text-gray-600"
              >
                Click to load bookings
              </button>
            )}
            {bookings !== null && (
              <BookingsTab
                destId={destination.id}
                initialBookings={bookings}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
