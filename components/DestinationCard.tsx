"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
};

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
}: Props) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-zinc-900 dark:border-zinc-700"
    >
      <div className="flex items-start gap-3">
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
    </div>
  );
}
