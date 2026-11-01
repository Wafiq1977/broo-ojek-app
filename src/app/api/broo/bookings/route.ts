import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { priceOf, type ServiceId } from "@/lib/broo-data";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ ok: false, error: "userId wajib" }, { status: 400 });

  const bookings = await db.booking.findMany({
    where: { userId },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ ok: true, bookings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, service, pickup, destination, detail, km, scheduledAt } = body ?? {};

    if (!userId || !service || !pickup || !destination || !scheduledAt) {
      return NextResponse.json(
        { ok: false, error: "Data booking tidak lengkap" },
        { status: 400 }
      );
    }

    const price = priceOf(service as ServiceId, Number(km) || 1);

    const booking = await db.booking.create({
      data: {
        userId,
        service,
        pickup,
        destination,
        detail: detail || null,
        price,
        scheduledAt: new Date(scheduledAt),
        status: "scheduled",
      },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// cancel a booking
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body ?? {};
    if (!id) return NextResponse.json({ ok: false, error: "id wajib" }, { status: 400 });
    const booking = await db.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
