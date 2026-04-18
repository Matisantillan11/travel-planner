"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { buildLineString } from "@/lib/mapbox";

type Destination = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  position: number;
};

type Props = {
  destinations: Destination[];
  onMarkerClick: (id: string) => void;
  highlightedId?: string | null;
};

export default function MapView({ destinations, onMarkerClick, highlightedId }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  const geojson = useMemo(() => buildLineString(destinations), [destinations]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || destinations.length === 0) return;

    if (destinations.length === 1) {
      mapRef.current.flyTo({
        center: [destinations[0].lng, destinations[0].lat],
        zoom: 10,
      });
      return;
    }

    const lngs = destinations.map((d) => d.lng);
    const lats = destinations.map((d) => d.lat);
    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, duration: 500 }
    );
  }, [destinations, mapLoaded]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-zinc-700">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={() => setMapLoaded(true)}
      >
        {destinations.length > 1 && (
          <Source id="route" type="geojson" data={geojson}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#6366f1",
                "line-width": 2,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {destinations.map((dest, idx) => (
          <Marker
            key={dest.id}
            longitude={dest.lng}
            latitude={dest.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onMarkerClick(dest.id);
            }}
          >
            <button
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform ${
                highlightedId === dest.id
                  ? "bg-indigo-400 scale-125"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
              aria-label={`Destination ${idx + 1}: ${dest.name}`}
            >
              {idx + 1}
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
