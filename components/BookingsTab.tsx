"use client";

import { useState } from "react";
import BookingCard from "@/components/BookingCard";

type BookingType = "FLIGHT" | "HOTEL" | "TRAIN" | "CAR" | "OTHER";

type Booking = {
  id: string;
  type: BookingType;
  startDatetime: string;
  endDatetime: string | null;
  notes: string | null;
};

const TYPE_LABELS: Record<BookingType, string> = {
  FLIGHT: "Flight",
  HOTEL: "Hotel",
  TRAIN: "Train",
  CAR: "Car",
  OTHER: "Other",
};

function nowLocalInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingsTab({
  destId,
  initialBookings,
}: {
  destId: string;
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formType, setFormType] = useState<BookingType>("FLIGHT");
  const [formStart, setFormStart] = useState(nowLocalInputValue);
  const [formEnd, setFormEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");

  function resetForm() {
    setFormType("FLIGHT");
    setFormStart(nowLocalInputValue());
    setFormEnd("");
    setFormNotes("");
    setShowForm(false);
  }

  async function handleAdd() {
    if (!formStart) return;
    setAdding(true);
    const res = await fetch(`/api/destinations/${destId}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formType,
        startDatetime: new Date(formStart).toISOString(),
        endDatetime: formEnd ? new Date(formEnd).toISOString() : undefined,
        notes: formNotes.trim() || undefined,
      }),
    });
    if (res.ok) {
      const booking: Booking = await res.json();
      setBookings((prev) =>
        [...prev, booking].sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        )
      );
      resetForm();
    }
    setAdding(false);
  }

  async function handleUpdate(
    id: string,
    data: Partial<Omit<Booking, "id">>
  ) {
    setBookings((prev) =>
      prev
        .map((b) => (b.id === id ? { ...b, ...data } : b))
        .sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        )
    );
    await fetch(`/api/destinations/${destId}/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/destinations/${destId}/bookings/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No bookings yet — add a flight, hotel, or other reservation.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex gap-2">
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as BookingType)}
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
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              className="text-sm rounded-md border border-gray-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">End (optional)</label>
            <input
              type="datetime-local"
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
              className="text-sm rounded-md border border-gray-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Notes (optional)</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              placeholder="Confirmation number, details…"
              className="text-sm rounded-md border border-gray-300 px-2 py-1.5 resize-none dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={adding || !formStart}
              className="text-sm px-3 py-1.5 rounded-md bg-black text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
            >
              {adding ? "Adding…" : "Add Booking"}
            </button>
            <button
              onClick={resetForm}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-gray-400 hover:text-gray-600 py-1 text-left"
        >
          + Add booking
        </button>
      )}
    </div>
  );
}
