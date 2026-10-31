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

export default function ChatScreen() {
  const user = useBroo((s) => s.user);
  const chatNonce = useBroo((s) => s.chatNonce);
  const openChat = useBroo((s) => s.openChat);

  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft">
      <header className="sticky top-0 z-10 bg-card/95 px-5 pb-3 pt-6 backdrop-blur safe-top">
        <h1 className="text-xl font-black text-foreground">Obrolan</h1>
        <p className="text-xs text-muted-foreground">Chat dengan driver Broo</p>
      </header>

      <div className="flex-1 px-5 pt-3 pb-8">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl broo-shimmer" />
            ))}
          </div>
        ) : convs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <BrooIcon name="MessageCircle" className="h-8 w-8" />
            </div>
            <p className="mt-3 text-sm font-black text-foreground">Belum ada obrolan</p>
            <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
              Saat memesan layanan, kamu bisa menghubungi driver langsung dari sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {convs.map((c) => (
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
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left tap-scale"
              >
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-broo-gradient text-sm font-black text-white">
                    {c.driverName[0]}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-bold text-foreground">{c.driverName}</p>
                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                      {new Date(c.lastAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      {c.service}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{c.lastMessage}</span>
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground">
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
