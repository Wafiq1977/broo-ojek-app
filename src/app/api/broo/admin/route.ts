import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Admin dashboard stats
export async function GET() {
  const [users, drivers, merchants, orders, foodOrders, driverApps, bookings] = await Promise.all([
    db.user.count(),
    db.driver.count(),
    db.merchant.count(),
    db.order.count(),
    db.foodOrder.count(),
    db.driverApplication.count(),
    db.booking.count(),
  ]);

  const pendingApps = await db.driverApplication.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const recentFoodOrders = await db.foodOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const allMerchants = await db.merchant.findMany({ orderBy: { rating: "desc" } });

  const allDrivers = await db.driver.findMany({ orderBy: { totalOrders: "desc" } });

  // revenue = sum of order.price + foodOrder.total (Broo takes 0, this is GMV)
  const orderAgg = await db.order.aggregate({ _sum: { price: true } });
  const foodAgg = await db.foodOrder.aggregate({ _sum: { total: true } });
  const gmv = (orderAgg._sum.price || 0) + (foodAgg._sum.total || 0);

  return NextResponse.json({
    ok: true,
    stats: { users, drivers, merchants, orders, foodOrders, driverApps, bookings, pendingApps: pendingApps.length, gmv },
    pendingApps,
    recentOrders,
    recentFoodOrders,
    allMerchants,
    allDrivers,
  });
}

// Approve / reject driver application
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body ?? {};
  if (!id || !status) {
    return Response.json({ ok: false, error: "id & status wajib" }, { status: 400 });
  }
  const app = await db.driverApplication.update({
    where: { id },
    data: { status },
  });
  // if approved, create a driver entry
  if (status === "approved") {
    const exists = await db.driver.findFirst({ where: { phone: app.phone } });
    if (!exists) {
      await db.driver.create({
        data: {
          name: app.name,
          phone: app.phone,
          vehicleType: app.vehicleType,
          vehicleName: app.vehicleBrand,
          plate: app.plate,
          rating: 5.0,
          totalOrders: 0,
          status: "available",
        },
      });
    }
  }
  return NextResponse.json({ ok: true, application: app });
}
