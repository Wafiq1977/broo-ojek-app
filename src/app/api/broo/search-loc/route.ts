import { NextRequest, NextResponse } from "next/server";

// Search locations using Nominatim OpenStreetMap (free, realtime)
// Biases results to Bojonegoro area via viewbox
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ ok: true, results: [] });
  }

  try {
    // Bojonegoro bbox: roughly lng 111.7-112.0, lat -7.3 to -7.0
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      q + " Bojonegoro Jawa Timur"
    )}&limit=8&countrycodes=id&addressdetails=1&viewbox=111.6,-6.95,112.1,-7.35&bounded=0`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "BrooApp/1.0 (admin@broo.id)",
        "Accept-Language": "id-ID",
      },
      // @ts-expect-error nextjs fetch cache
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Gagal mencari lokasi" }, { status: 502 });
    }

    const data = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
      address?: Record<string, string>;
    }>;

    const results = data.map((d) => {
      const a = d.address || {};
      const name =
        a.road ||
        a.neighbourhood ||
        a.suburb ||
        a.village ||
        a.town ||
        a.amenity ||
        d.display_name.split(",")[0];
      const city = a.city || a.town || a.village || a.county || "Bojonegoro";
      return {
        id: String(d.place_id),
        name,
        address: d.display_name,
        short: `${name}, ${city}`,
        lat: Number(d.lat),
        lng: Number(d.lon),
      };
    });

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
