import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Full first-time registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password, address } = body ?? {};

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Nama dan nomor telepon wajib diisi" },
        { status: 400 }
      );
    }

    const exists = await db.user.findUnique({ where: { phone } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Nomor telepon sudah terdaftar. Silakan masuk." },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        name,
        phone,
        email: email || null,
        password: password || null,
        address: address || null,
        provider: "phone",
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email ?? undefined,
        address: user.address ?? undefined,
        provider: user.provider,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
