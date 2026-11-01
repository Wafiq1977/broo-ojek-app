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
  const setTab = useBroo((s) => s.setTab);

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
      {/* header — rounded bottom corners */}
      <header className="sticky top-0 z-10 rounded-b-[2rem] bg-broo-header-gradient px-5 pb-5 pt-6 text-white safe-top shadow-broo-lg">
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

      <div className="flex-1 px-5 pt-6 pb-8">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl broo-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyChatState hasQuery={!!q} onOrder={() => setTab("home")} />
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

/** Unique animated empty chat state — floating chat bubbles with typing dots */
function EmptyChatState({ hasQuery, onOrder }: { hasQuery: boolean; onOrder: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* animated floating chat bubbles cluster */}
      <div className="relative mb-6 h-32 w-40">
        {/* big bubble center */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
          className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-broo-gradient text-white shadow-broo-primary"
        >
          <BrooIcon name="MessageCircle" className="h-9 w-9" fill="rgba(255,255,255,0.25)" />
          {/* typing dots inside bubble */}
          <div className="absolute bottom-2.5 flex gap-1">
            <span className="broo-chat-typing-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: "0ms" }} />
            <span className="broo-chat-typing-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: "200ms" }} />
            <span className="broo-chat-typing-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: "400ms" }} />
          </div>
        </motion.div>

        {/* small floating bubble 1 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.3 }}
          className="broo-chat-float-1 absolute left-1 top-2 grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-broo ring-1 ring-primary/20"
        >
          <BrooIcon name="Send" className="h-4 w-4 text-primary" />
        </motion.div>

        {/* small floating bubble 2 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.45 }}
          className="broo-chat-float-2 absolute right-1 top-6 grid h-9 w-9 place-items-center rounded-2xl bg-card shadow-broo ring-1 ring-primary/20"
        >
          <BrooIcon name="MapPin" className="h-4 w-4 text-rose-500" />
        </motion.div>

        {/* small floating bubble 3 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.6 }}
          className="broo-chat-float-3 absolute bottom-1 right-4 grid h-8 w-8 place-items-center rounded-xl bg-card shadow-broo ring-1 ring-primary/20"
        >
          <BrooIcon name="Phone" className="h-3.5 w-3.5 text-emerald-500" />
        </motion.div>

        {/* pulse dot accents */}
        <span className="broo-chat-pulse-dot absolute -left-1 bottom-4 h-2.5 w-2.5 rounded-full bg-primary" />
        <span className="broo-chat-pulse-dot absolute right-0 -top-1 h-2 w-2 rounded-full bg-amber-400" style={{ animationDelay: "0.5s" }} />
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-base font-black text-foreground"
      >
        {hasQuery ? "Tidak ditemukan" : "Belum ada obrolan"}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted-foreground"
      >
        {hasQuery
          ? "Coba kata kunci lain atau mulai obrolan baru."
          : "Saat memesan layanan, kamu bisa menghubungi driver langsung dari sini."}
      </motion.p>

      {!hasQuery && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={onOrder}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-broo-gradient px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 tap-scale"
        >
          <BrooIcon name="Plus" className="h-4 w-4" />
          Pesan Layanan
        </motion.button>
      )}
    </div>
  );
}
