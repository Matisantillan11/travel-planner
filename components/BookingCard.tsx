"use client";

import { useState } from "react";

type BookingType = "FLIGHT" | "HOTEL" | "TRAIN" | "CAR" | "OTHER";

type Booking = {
  id: string;
  type: BookingType;
  startDatetime: string;
  endDatetime: string | null;
  notes: string | null;
};

type Props = {
  booking: Booking;
  onUpdate: (id: string, data: Partial<Omit<Booking, "id">>) => void;
  onDelete: (id: string) => void;
};

const TYPE_LABELS: Record<BookingType, string> = {
  FLIGHT: "Flight",
  HOTEL: "Hotel",
  TRAIN: "Train",
  CAR: "Car",
  OTHER: "Other",
};

function toLocalInputValue(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDatetime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingCard({ booking, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<BookingType>(booking.type);
  const [startDatetime, setStartDatetime] = useState(
    toLocalInputValue(booking.startDatetime)
  );
  const [endDatetime, setEndDatetime] = useState(
    booking.endDatetime ? toLocalInputValue(booking.endDatetime) : ""
  );
  const [notes, setNotes] = useState(booking.notes ?? "");

  function handleSave() {
    const startIso = new Date(startDatetime).toISOString();
    const endIso = endDatetime ? new Date(endDatetime).toISOString() : null;
    onUpdate(booking.id, {
      type,
      startDatetime: startIso,
      endDatetime: endIso,
      notes: notes.trim() || null,
    });
    setEditing(false);
  }

  function handleCancel() {
    setType(booking.type);
    setStartDatetime(toLocalInputValue(booking.startDatetime));
    setEndDatetime(booking.endDatetime ? toLocalInputValue(booking.endDatetime) : "");
    setNotes(booking.notes ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="py-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as BookingType)}
            className="text-sm rounded-md border border-gray-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
          >
            {(Object.keys(TYPE_LABELS) as BookingType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Start</label>
          <input
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
            className="text-sm rounded-md border border-gray-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">End (optional)</label>
          <input
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            className="text-sm rounded-md border border-gray-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="text-sm rounded-md border border-gray-300 px-2 py-1.5 resize-none dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!startDatetime}
            className="text-xs px-3 py-1.5 rounded-md bg-black text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="py-2 group flex items-start gap-3">
      <span className="mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
        {TYPE_LABELS[booking.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm">{formatDatetime(booking.startDatetime)}</p>
        {booking.endDatetime && (
          <p className="text-xs text-gray-500">
            Until {formatDatetime(booking.endDatetime)}
          </p>
        )}
        {booking.notes && (
          <div className="mt-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {expanded ? "Hide notes ▲" : "Show notes ▼"}
            </button>
            {expanded && (
              <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">
                {booking.notes}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded text-xs"
          aria-label="Edit booking"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(booking.id)}
          className="text-red-400 hover:text-red-600 p-1 rounded text-xs"
          aria-label="Delete booking"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
