import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Login by phone or google (demo: creates account if not exists)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, phone, name, email } = body ?? {};

    if (mode === "phone") {
      if (!phone) {
        return NextResponse.json({ ok: false, error: "Nomor telepon wajib diisi" }, { status: 400 });
      }
      let user = await db.user.findUnique({ where: { phone } });
      if (!user) {
        user = await db.user.create({
          data: { name: name || "Pengguna Broo", phone, provider: "phone" },
        });
      }
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
    }

    if (mode === "google") {
      if (!email) {
        return NextResponse.json({ ok: false, error: "Email google wajib" }, { status: 400 });
      }
      let user = await db.user.findUnique({ where: { phone: email } });
      if (!user) {
        user = await db.user.create({
          data: {
            name: name || "Pengguna Broo",
            phone: email, // use email as unique handle for google accounts
            email,
            provider: "google",
          },
        });
      }
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
    }

    return NextResponse.json({ ok: false, error: "Mode login tidak dikenal" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
