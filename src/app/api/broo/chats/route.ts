import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Message = { id: string; from: "user" | "driver"; text: string; at: string };

// GET conversations for a user (optionally one by id)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const conversationId = req.nextUrl.searchParams.get("conversationId");

  if (!userId) return NextResponse.json({ ok: false, error: "userId wajib" }, { status: 400 });

  if (conversationId) {
    const conv = await db.chatConversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Obrolan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, conversation: conv });
  }

  const conversations = await db.chatConversation.findMany({
    where: { userId },
    orderBy: { lastAt: "desc" },
  });
  return NextResponse.json({ ok: true, conversations });
}

// POST: either start a new conversation, or send a message to existing one
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action } = body ?? {};

    if (action === "start") {
      const { driverName, driverPhoto, service, orderId, lastMessage } = body ?? {};
      const now = new Date();
      const messages: Message[] = lastMessage
        ? [
            {
              id: crypto.randomUUID(),
              from: "user",
              text: lastMessage,
              at: now.toISOString(),
            },
          ]
        : [
            {
              id: crypto.randomUUID(),
              from: "driver",
              text: `Halo, saya ${driverName}, driver ${service} Broo. Ada yang bisa saya bantu?`,
              at: now.toISOString(),
            },
          ];

      const conv = await db.chatConversation.create({
        data: {
          userId,
          driverName,
          driverPhoto: driverPhoto || null,
          service,
          orderId: orderId || null,
          lastMessage: lastMessage || "Halo, saya driver Broo, ada yang bisa dibantu?",
          lastAt: now,
          unread: lastMessage ? 0 : 1,
          messages,
        },
      });
      return NextResponse.json({ ok: true, conversation: conv });
    }

    if (action === "send") {
      const { conversationId, text } = body ?? {};
      const conv = await db.chatConversation.findUnique({ where: { id: conversationId } });
      if (!conv) return NextResponse.json({ ok: false, error: "Obrolan tidak ditemukan" }, { status: 404 });

      const messages = (conv.messages as Message[]) || [];
      const now = new Date().toISOString();
      messages.push({ id: crypto.randomUUID(), from: "user", text, at: now });

      // context-aware driver reply
      const lower = (text || "").toLowerCase();
      let reply: string;
      if (/(halo|hai|hi|pagi|siang|sore|malam)/.test(lower)) {
        reply = "Halo kak! 👋 Saya driver Broo, ada yang bisa saya bantu?";
      } else if (/(di mana|dimana|lokasi|alamat|jemput)/.test(lower)) {
        reply = "Saya sudah di lokasi penjemputan, mohon tunggu sebentar ya kak 🙏";
      } else if (/(berapa|berapa lama|lama|eta|sampai)/.test(lower)) {
        reply = "Estimasi tiba 3-5 menit lagi kak, sudah dekat kok ⏱️";
      } else if (/(makasih|terima kasih|thanks|thx)/.test(lower)) {
        reply = "Sama-sama kak! 😊 Terima kasih sudah pakai Broo. Jangan lupa beri rating ya ⭐";
      } else if (/(batal|cancel|gagal)/.test(lower)) {
        reply = "Baik kak, saya bantu proses. Mohon tunggu sebentar.";
      } else if (/(cod|tunai|bayar|uang)/.test(lower)) {
        reply = "Bisa bayar tunai langsung ke saya kak, atau via QRIS 😊";
      } else if (/(aman|selamat|hati-hati|hati hati)/.test(lower)) {
        reply = "Tentu kak, saya selalu berkendara dengan aman dan patuh rambu 🛡️";
      } else {
        const fallback = [
          "Baik kak, siap diterima. Driver menuju lokasi 🛵",
          "Oke kak, ditunggu ya 🙏",
          "Bisa kak, silakan diteruskan instruksinya 👍",
          "Noted kak, saya proses sekarang.",
        ];
        reply = fallback[Math.floor(Math.random() * fallback.length)];
      }
      messages.push({
        id: crypto.randomUUID(),
        from: "driver",
        text: reply,
        at: new Date(Date.now() + 1200).toISOString(),
      });

      const updated = await db.chatConversation.update({
        where: { id: conversationId },
        data: {
          messages,
          lastMessage: reply,
          lastAt: new Date(),
          unread: 0,
        },
      });
      return NextResponse.json({ ok: true, conversation: updated });
    }

    return NextResponse.json({ ok: false, error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// DELETE — remove a conversation (when order completes)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, driverName, conversationId } = body ?? {};

    if (conversationId) {
      await db.chatConversation.delete({ where: { id: conversationId } }).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    if (orderId) {
      const conv = await db.chatConversation.findFirst({ where: { orderId } }).catch(() => null);
      if (conv) {
        await db.chatConversation.delete({ where: { id: conv.id } });
      }
      return NextResponse.json({ ok: true });
    }

    if (driverName) {
      const convs = await db.chatConversation.findMany({ where: { driverName } });
      for (const c of convs) {
        await db.chatConversation.delete({ where: { id: c.id } }).catch(() => {});
      }
      return NextResponse.json({ ok: true, deleted: convs.length });
    }

    return NextResponse.json({ ok: false, error: "orderId/driverName/conversationId wajib" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
