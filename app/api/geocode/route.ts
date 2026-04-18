export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return Response.json({ features: [] });

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return Response.json({ features: [] });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&types=place,poi,address&limit=5`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return Response.json({ features: [] });

  const data = await res.json();
  return Response.json({ features: data.features ?? [] });
}
