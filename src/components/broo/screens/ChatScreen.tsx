"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";

interface Conv {
  id: string;
  driverName: string;
  driverPhoto: string | null;
  service: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

const SERVICE_ICON: Record<string, string> = {
  MotorBro: "Bike",
  MobilBro: "Car",
  MakanBro: "UtensilsCrossed",
  TitipBro: "ShoppingBag",
  TolongBro: "LifeBuoy",
};

export default function ChatScreen() {
  const user = useBroo((s) => s.user);
  const chatNonce = useBroo((s) => s.chatNonce);

  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/broo/chats?userId=${user.id}`);
      const data = await res.json();
      if (data.ok) setConvs(data.conversations);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, chatNonce]);

  const filtered = convs.filter((c) =>
    q.trim() ? (c.driverName + c.lastMessage).toLowerCase().includes(q.toLowerCase()) : true
  );
  const totalUnread = convs.reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft-warm">
      {/* header */}
      <header className="sticky top-0 z-10 bg-broo-header-gradient px-5 pb-4 pt-6 text-white safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Obrolan</h1>
            <p className="text-xs text-white/75">
              {totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : "Chat dengan driver Broo"}
            </p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur ring-1 ring-white/30">
            <BrooIcon name="MessageCircle" className="h-5 w-5" />
          </div>
        </div>

        {/* search */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-black/10">
          <BrooIcon name="Search" className="h-4 w-4 text-primary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari obrolan…"
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="flex-1 px-5 pt-4 pb-8">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl broo-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/10">
              <BrooIcon name="MessageCircle" className="h-9 w-9 text-primary" />
            </div>
            <p className="mt-3 text-sm font-black text-foreground">
              {q ? "Tidak ditemukan" : "Belum ada obrolan"}
            </p>
            <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
              {q
                ? "Coba kata kunci lain."
                : "Saat memesan layanan, kamu bisa menghubungi driver langsung dari sini."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <motion.button
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() =>
                  useBroo.getState().openChat({
                    conversationId: c.id,
                    driverName: c.driverName,
                    driverPhoto: c.driverPhoto || undefined,
                    service: c.service,
                  })
                }
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left tap-scale ${
                  c.unread > 0
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-broo-card-gradient"
                } shadow-broo`}
              >
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-broo-gradient text-sm font-black text-white shadow-broo-primary ring-2 ring-card">
                    {c.driverName[0]}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[8px] ring-2 ring-card">
                    ●
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`truncate text-sm ${c.unread > 0 ? "font-black text-foreground" : "font-bold text-foreground"}`}>
                      {c.driverName}
                    </p>
                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                      {new Date(c.lastAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      <BrooIcon name={SERVICE_ICON[c.service] || "Bike"} className="h-2.5 w-2.5" />
                      {c.service}
                    </span>
                    <span className={`truncate text-xs ${c.unread > 0 ? "font-semibold text-foreground/80" : "text-muted-foreground"}`}>
                      {c.lastMessage}
                    </span>
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground shadow-broo-primary">
                    {c.unread}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
