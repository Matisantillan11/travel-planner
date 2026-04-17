"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TripCardProps = {
  id: string;
  name: string;
  startDate: Date | string;
  updatedAt: Date | string;
  _count: { destinations: number };
};

export default function TripCard({ id, name, startDate, updatedAt, _count }: TripCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setConfirming(false);
        setDeleting(false);
        return;
      }
      router.refresh();
    } catch {
      setConfirming(false);
      setDeleting(false);
    }
  }

  const formattedStart = new Date(startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedUpdated = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const destCount = _count.destinations;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-700">
      <Link href={`/trips/${id}`} className="block mb-3">
        <h2 className="font-semibold text-lg leading-tight mb-1 hover:underline">
          {name}
        </h2>
        <p className="text-sm text-gray-500">Starts {formattedStart}</p>
        <p className="text-sm text-gray-400 mt-1">
          {destCount} destination{destCount !== 1 ? "s" : ""}
        </p>
      </Link>

      <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
        <span>Updated {formattedUpdated}</span>

        {confirming ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Confirm"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="px-2 py-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
