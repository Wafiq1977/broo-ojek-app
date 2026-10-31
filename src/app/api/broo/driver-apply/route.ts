import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      ktp,
      vehicleType,
      vehicleBrand,
      plate,
      stnk,
      sim,
      city,
      experience,
      channel,
    } = body ?? {};

    if (!name || !phone || !ktp || !vehicleType || !plate) {
      return NextResponse.json(
        { ok: false, error: "Data pendaftaran driver belum lengkap" },
        { status: 400 }
      );
    }

    const application = await db.driverApplication.create({
      data: {
        name,
        phone,
        email: email || null,
        ktp,
        vehicleType,
        vehicleBrand: vehicleBrand || "—",
        plate,
        stnk: stnk || "—",
        sim: sim || "—",
        city: city || "—",
        experience: experience || "—",
        channel: channel || "admin",
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, application });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
