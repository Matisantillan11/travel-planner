"use client";

import { useState } from "react";

type Activity = {
  id: string;
  name: string;
  notes: string | null;
  isDone: boolean;
};

type Props = {
  activity: Activity;
  onToggle: (id: string, isDone: boolean) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export default function ActivityItem({ activity, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(activity.name);
  const [expanded, setExpanded] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== activity.name) onEdit(activity.id, trimmed);
      setEditing(false);
    }
    if (e.key === "Escape") {
      setEditValue(activity.name);
      setEditing(false);
    }
  }

  return (
    <li className="flex items-start gap-3 py-2 group">
      <input
        type="checkbox"
        checked={activity.isDone}
        onChange={() => onToggle(activity.id, !activity.isDone)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 cursor-pointer"
        aria-label={`Mark "${activity.name}" as ${activity.isDone ? "not done" : "done"}`}
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              const trimmed = editValue.trim();
              if (trimmed && trimmed !== activity.name) onEdit(activity.id, trimmed);
              setEditing(false);
            }}
            className="w-full text-sm border-b border-gray-300 focus:outline-none dark:border-zinc-600 dark:bg-transparent"
          />
        ) : (
          <button
            onClick={() => {
              setEditValue(activity.name);
              setEditing(true);
            }}
            className={`text-sm text-left w-full truncate ${
              activity.isDone ? "line-through text-gray-400" : ""
            }`}
          >
            {activity.name}
          </button>
        )}

        {activity.notes && (
          <div className="mt-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {expanded ? "Hide notes ▲" : "Show notes ▼"}
            </button>
            {expanded && (
              <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">
                {activity.notes}
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(activity.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 rounded text-xs shrink-0"
        aria-label={`Delete "${activity.name}"`}
      >
        ✕
      </button>
    </li>
  );
}
