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

      // auto driver reply
      const replies = [
        "Baik, siap diterima. Driver menuju lokasi.",
        "Oke kak, ditunggu ya.",
        "Sudah dekat lokasi penjemputan, mohon tunggu sebentar.",
        "Terima kasih kak, semoga pelayanan saya memuaskan!",
        "Bisa kak, silakan diteruskan instruksinya.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
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
