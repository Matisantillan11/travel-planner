"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type GeoFeature = {
  id: string;
  place_name: string;
  center: [number, number];
};

type SelectedPlace = {
  name: string;
  mapboxPlaceId: string;
  lat: number;
  lng: number;
};

export default function DestinationSearch({
  onSelect,
}: {
  onSelect: (place: SelectedPlace) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const features: GeoFeature[] = data.features ?? [];
      setResults(features);
      setOpen(features.length > 0);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 280);
  }

  function handleSelect(feature: GeoFeature) {
    onSelect({
      name: feature.place_name,
      mapboxPlaceId: feature.id,
      lat: feature.center[1],
      lng: feature.center[0],
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search for a destination…"
        aria-label="Search destinations"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-600 dark:bg-zinc-800"
      />
      {loading && (
        <span className="absolute right-3 top-2.5 text-xs text-gray-400">
          Searching…
        </span>
      )}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {results.map((feature) => (
            <li key={feature.id} role="option" aria-selected={false}>
              <button
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800"
                onClick={() => handleSelect(feature)}
              >
                {feature.place_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
