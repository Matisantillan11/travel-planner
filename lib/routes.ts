export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  TRIP: (id: string) => `/trips/${id}`,
} as const;

export const API_ROUTES = {
  TRIPS: "/api/trips",
  TRIP: (id: string) => `/api/trips/${id}`,
  TRIP_DESTINATIONS: (tripId: string) => `/api/trips/${tripId}/destinations`,
  TRIP_DESTINATION: (tripId: string, destId: string) =>
    `/api/trips/${tripId}/destinations/${destId}`,
  TRIP_DESTINATIONS_REORDER: (tripId: string) =>
    `/api/trips/${tripId}/destinations/reorder`,
  DESTINATION_ACTIVITIES: (destId: string) =>
    `/api/destinations/${destId}/activities`,
  DESTINATION_ACTIVITY: (destId: string, actId: string) =>
    `/api/destinations/${destId}/activities/${actId}`,
  DESTINATION_BOOKINGS: (destId: string) =>
    `/api/destinations/${destId}/bookings`,
  DESTINATION_BOOKING: (destId: string, bookId: string) =>
    `/api/destinations/${destId}/bookings/${bookId}`,
  GEOCODE: (q: string) => `/api/geocode?q=${encodeURIComponent(q)}`,
};
