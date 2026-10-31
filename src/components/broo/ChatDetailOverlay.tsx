"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { toast } from "sonner";

interface Msg {
  id: string;
  from: "user" | "driver";
  text: string;
  at: string;
}

export default function ChatDetailOverlay() {
  const chatOpen = useBroo((s) => s.chatOpen)!;
  const closeChat = useBroo((s) => s.closeChat);
  const bumpChat = useBroo((s) => s.bumpChat);
  const user = useBroo((s) => s.user);

  const [convId, setConvId] = useState(chatOpen.conversationId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [driverTyping, setDriverTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      if (chatOpen.conversationId) {
        try {
          const res = await fetch(`/api/broo/chats?userId=${user.id}&conversationId=${chatOpen.conversationId}`);
          const data = await res.json();
          if (active && data.ok) setMessages(data.conversation.messages || []);
        } catch {
          /* ignore */
        } finally {
          if (active) setLoading(false);
        }
      } else {
        try {
          const res = await fetch("/api/broo/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              action: "start",
              driverName: chatOpen.driverName,
              service: chatOpen.service,
            }),
          });
          const data = await res.json();
          if (active && data.ok) {
            setConvId(data.conversation.id);
            setMessages(data.conversation.messages || []);
          }
        } catch {
          toast.error("Gagal memulai obrolan");
        } finally {
          if (active) setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, driverTyping]);

  const send = async () => {
    if (!text.trim() || !convId) return;
    const msg: Msg = {
      id: crypto.randomUUID(),
      from: "user",
      text: text.trim(),
      at: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
    const sent = text.trim();
    setText("");
    setDriverTyping(true);
    try {
      const res = await fetch("/api/broo/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, action: "send", conversationId: convId, text: sent }),
      });
      const data = await res.json();
      if (data.ok) {
        setTimeout(() => {
          setDriverTyping(false);
          setMessages((m) => {
            const existing = m.filter((x) => x.id !== "__driver");
            const reply = (data.conversation.messages as Msg[]).slice(-1)[0];
            return reply ? [...existing, reply] : existing;
          });
        }, 900);
      } else {
        setDriverTyping(false);
      }
    } catch {
      setDriverTyping(false);
    }
  };

  const handleClose = () => {
    bumpChat();
    closeChat();
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0.6 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.6 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="absolute inset-0 z-[85] flex h-full flex-col bg-background"
    >
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 pb-3 pt-5 safe-top">
        <button
          onClick={handleClose}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center rounded-full border border-border tap-scale"
        >
          <BrooIcon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <div className="relative">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-broo-gradient text-sm font-black text-white">
            {chatOpen.driverName[0]}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{chatOpen.driverName}</p>
          <p className="text-[11px] text-emerald-600">● Online • {chatOpen.service}</p>
        </div>
        <button
          onClick={() => toast.info("Menghubungkan panggilan…")}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-emerald-600 tap-scale"
          aria-label="Telepon"
        >
          <BrooIcon name="Phone" className="h-4 w-4" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto broo-scrollbar bg-broo-soft px-4 py-4">
        <div className="mx-auto mb-4 w-fit rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-muted-foreground">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-48 rounded-2xl broo-shimmer" />
              <div className="ml-auto h-10 w-40 rounded-2xl broo-shimmer" />
            </div>
          ) : (
            messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.from === "user"
                      ? "rounded-br-md bg-broo-gradient text-white shadow-md shadow-primary/20"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                  }`}
                >
                  <p className="leading-snug">{m.text}</p>
                  <p className={`mt-1 text-[9px] ${m.from === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                    {new Date(m.at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          {driverTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 tap-scale"
            aria-label="Lampiran"
          >
            <BrooIcon name="Plus" className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ketik pesan…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={send}
            disabled={!text.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-broo-gradient text-white shadow-md shadow-primary/30 disabled:opacity-50 tap-scale"
            aria-label="Kirim"
          >
            <BrooIcon name="Send" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
