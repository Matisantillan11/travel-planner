"use client";

import { useState } from "react";
import ActivityItem from "@/components/ActivityItem";
import { API_ROUTES } from "@/lib/routes";

type Activity = {
  id: string;
  name: string;
  notes: string | null;
  isDone: boolean;
  position: number;
};

export default function ActivitiesTab({
  destId,
  initialActivities,
}: {
  destId: string;
  initialActivities: Activity[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    const res = await fetch(API_ROUTES.DESTINATION_ACTIVITIES(destId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const act: Activity = await res.json();
      setActivities((prev) => [...prev, act]);
      setNewName("");
    }
    setAdding(false);
  }

  async function handleToggle(id: string, isDone: boolean) {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDone } : a))
    );
    await fetch(API_ROUTES.DESTINATION_ACTIVITY(destId, id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone }),
    });
  }

  async function handleEdit(id: string, name: string) {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
    await fetch(API_ROUTES.DESTINATION_ACTIVITY(destId, id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  }

  async function handleDelete(id: string) {
    const res = await fetch(API_ROUTES.DESTINATION_ACTIVITY(destId, id), {
      method: "DELETE",
    });
    if (res.ok) {
      setActivities((prev) =>
        prev.filter((a) => a.id !== id).map((a, i) => ({ ...a, position: i }))
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          Nothing planned yet — add a place or activity.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
          {activities.map((act) => (
            <ActivityItem
              key={act.id}
              activity={act}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add an activity…"
          className="flex-1 text-sm rounded-md border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-600 dark:bg-zinc-800"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="text-sm px-3 py-1.5 rounded-md bg-black text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          Add
        </button>
      </div>
    </div>
  );
}
