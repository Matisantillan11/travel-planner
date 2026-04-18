export function buildLineString(destinations: { lat: number; lng: number }[]) {
  return {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      // GeoJSON coordinates are [longitude, latitude]
      coordinates: destinations.map((d) => [d.lng, d.lat]),
    },
    properties: {},
  };
}
