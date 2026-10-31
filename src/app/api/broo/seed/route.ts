import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Seed promos + demo data (idempotent)
export async function POST() {
  const promoCount = await db.promo.count();
  if (promoCount === 0) {
    await db.promo.createMany({
      data: [
        {
          title: "Tanpa Biaya Admin Selamanya",
          subtitle: "Broo tidak memotong tarif driver. Kamu bayar lebih murah.",
          image: "/promo/promo-1.png",
          cta: "Pesan Sekarang",
          order: 0,
        },
        {
          title: "MakanBro — Antar Makanan Favorit",
          subtitle: "Pesan dari resto mana saja, tanpa markup harga.",
          image: "/promo/promo-2.png",
          cta: "Pesan Makanan",
          order: 1,
        },
        {
          title: "TitipBro — Jasa Titip Belanja",
          subtitle: "Titip belanja dari minimarket, apotek, atau toko langgananmu.",
          image: "/promo/promo-3.png",
          cta: "Titip Belanja",
          order: 2,
        },
        {
          title: "Jadi Driver Broo — Dari Rakyat untuk Rakyat",
          subtitle: "100% tarif untukmu. Daftar sekali, berpenghasilan selamanya.",
          image: "/promo/promo-driver.png",
          cta: "Daftar Driver",
          order: 3,
        },
      ],
    });
  }

  const driverCount = await db.driver.count();
  if (driverCount === 0) {
    await db.driver.createMany({
      data: [
        {
          name: "Budi Santoso",
          phone: "0812xxxxxx01",
          vehicleType: "motor",
          vehicleName: "Honda Beat",
          plate: "B 4521 KXP",
          rating: 4.9,
          totalOrders: 1284,
          status: "available",
        },
        {
          name: "Siti Aminah",
          phone: "0812xxxxxx02",
          vehicleType: "mobil",
          vehicleName: "Toyota Avanza",
          plate: "B 9987 PQL",
          rating: 5.0,
          totalOrders: 932,
          status: "available",
        },
        {
          name: "Agus Pratama",
          phone: "0812xxxxxx03",
          vehicleType: "motor",
          vehicleName: "Yamaha NMAX",
          plate: "B 2210 MNZ",
          rating: 4.8,
          totalOrders: 2011,
          status: "busy",
        },
        {
          name: "Dewi Lestari",
          phone: "0812xxxxxx04",
          vehicleType: "motor",
          vehicleName: "Honda Vario",
          plate: "B 7788 RST",
          rating: 4.95,
          totalOrders: 765,
          status: "available",
        },
        {
          name: "Rizki Ramadhan",
          phone: "0812xxxxxx05",
          vehicleType: "mobil",
          vehicleName: "Honda Brio",
          plate: "B 6644 TUV",
          rating: 4.85,
          totalOrders: 421,
          status: "available",
        },
      ],
    });
  }

  return NextResponse.json({
    ok: true,
    promos: await db.promo.count(),
    drivers: await db.driver.count(),
  });
}

export async function GET() {
  const promos = await db.promo.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const drivers = await db.driver.findMany({ orderBy: { rating: "desc" } });
  return NextResponse.json({ promos, drivers });
}
