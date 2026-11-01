import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { priceOf, type ServiceId } from "@/lib/broo-data";

// List orders for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ ok: false, error: "userId wajib" }, { status: 400 });

  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, orders });
}

// Create an order (auto-assign a driver)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      service,
      orderType,
      pickup,
      destination,
      detail,
      km,
      paymentMethod,
      note,
      scheduledAt,
    } = body ?? {};

    if (!userId || !service || !pickup || !destination) {
      return NextResponse.json({ ok: false, error: "Data pesanan tidak lengkap" }, { status: 400 });
    }

    const price = priceOf(service as ServiceId, Number(km) || 1);

    // pick a driver matching vehicle type for ride services
    const vehicleType = service === "MobilBro" ? "mobil" : "motor";
    const driver = await db.driver.findFirst({
      where: {
        vehicleType,
        status: "available",
      },
      orderBy: { rating: "desc" },
    });

    const order = await db.order.create({
      data: {
        userId,
        service,
        orderType,
        pickup,
        destination,
        detail: detail || null,
        distanceKm: Number(km) || 1,
        price,
        fee: 0, // Broo takes no commission
        paymentMethod: paymentMethod || "cash",
        status: driver ? "completed" : "searching",
        note: note || null,
        driverId: driver?.id ?? null,
        driverName: driver?.name ?? null,
        driverPhoto: driver?.photo ?? null,
        vehicleType: driver?.vehicleType ?? vehicleType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    if (driver) {
      await db.driver.update({
        where: { id: driver.id },
        data: { totalOrders: { increment: 1 } },
      });
    }

    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// PATCH — set rating for a completed order
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, rating } = body ?? {};
    if (!id) return NextResponse.json({ ok: false, error: "id wajib" }, { status: 400 });
    const r = Number(rating) || 5;
    const order = await db.order.update({
      where: { id },
      data: { rating: Math.min(5, Math.max(1, r)) },
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
