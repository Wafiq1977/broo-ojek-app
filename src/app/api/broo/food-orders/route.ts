import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// List food orders for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ ok: false, error: "userId wajib" }, { status: 400 });

  const orders = await db.foodOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, orders });
}

// Create a food order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, merchantId, merchantName, items, total, deliveryFee, paymentMethod } = body ?? {};

    if (!userId || !merchantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "Data pesanan makanan tidak lengkap" }, { status: 400 });
    }

    const driver = await db.driver.findFirst({
      where: { vehicleType: "motor", status: "available" },
      orderBy: { rating: "desc" },
    });

    const order = await db.foodOrder.create({
      data: {
        userId,
        merchantId,
        merchantName,
        items,
        total: Number(total) || 0,
        deliveryFee: Number(deliveryFee) || 8000,
        fee: 0,
        paymentMethod: paymentMethod || "cash",
        status: driver ? "completed" : "searching",
        driverName: driver?.name ?? null,
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
