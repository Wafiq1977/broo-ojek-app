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

const QUICK_REPLIES = [
  { label: "Saya di mana?", text: "Driver, saya di mana ya?", emoji: "📍" },
  { label: "Berapa lama?", text: "Berapa lama lagi sampai?", emoji: "⏱️" },
  { label: "Sudah dekat?", text: "Sudah dekat lokasi jemput?", emoji: "🛵" },
  { label: "Terima kasih", text: "Terima kasih ya kak 🙏", emoji: "😊" },
];

export default function ChatDetailOverlay() {
  const chatOpenLive = useBroo((s) => s.chatOpen);
  // capture chatOpen at mount so exit animation keeps rendering after closeChat()
  const [chatOpen] = useState(chatOpenLive);
  const closeChat = useBroo((s) => s.closeChat);
  const bumpChat = useBroo((s) => s.bumpChat);
  const user = useBroo((s) => s.user);

  const data = chatOpen!;

  const [convId, setConvId] = useState(data.conversationId);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [driverTyping, setDriverTyping] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      if (data.conversationId) {
        try {
          const res = await fetch(`/api/broo/chats?userId=${user.id}&conversationId=${data.conversationId}`);
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
              driverName: data.driverName,
              service: data.service,
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
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, driverTyping]);

  const send = async (msgText?: string) => {
    const content = (msgText ?? text).trim();
    if (!content || !convId) return;
    const msg: Msg = {
      id: crypto.randomUUID(),
      from: "user",
      text: content,
      at: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
    setSentIds((s) => new Set(s).add(msg.id));
    setText("");
    setDriverTyping(true);
    try {
      const res = await fetch("/api/broo/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          action: "send",
          conversationId: convId,
          text: content,
        }),
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
        }, 1100);
      } else {
        setDriverTyping(false);
        toast.error("Gagal mengirim pesan");
      }
    } catch {
      setDriverTyping(false);
      toast.error("Gagal mengirim pesan");
    }
  };

  const handleClose = () => {
    bumpChat();
    closeChat();
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0.6 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.6 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="absolute inset-0 z-[85] flex h-full flex-col bg-broo-soft-warm"
    >
      {/* header with gradient */}
      <header className="flex items-center gap-3 border-b border-border bg-broo-header-gradient px-4 pb-3 pt-5 text-white safe-top">
        <button
          onClick={handleClose}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur tap-scale"
        >
          <BrooIcon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <div className="relative">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-sm font-black backdrop-blur ring-1 ring-white/30">
            {data.driverName[0]}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-400 ring-2 ring-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{data.driverName}</p>
          <p className="text-[11px] text-emerald-200">● Online • {data.service}</p>
        </div>
        <button
          onClick={() => toast.info("Menghubungkan panggilan…")}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur text-white tap-scale"
          aria-label="Telepon"
        >
          <BrooIcon name="Phone" className="h-4 w-4" />
        </button>
      </header>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto broo-scrollbar px-4 py-4">
        {/* date divider */}
        <div className="mx-auto mb-4 w-fit rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-muted-foreground">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>

        {/* info card */}
        <div className="mx-auto mb-4 flex max-w-[90%] items-center gap-2 rounded-2xl bg-primary/8 p-2.5 text-[11px] text-primary">
          <span>🔒</span> Obrolan diamankan oleh Broo. Mohon jaga sopan santun.
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-48 rounded-2xl broo-shimmer" />
              <div className="ml-auto h-10 w-40 rounded-2xl broo-shimmer" />
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.from === "user";
              const showCheck = isUser && sentIds.has(m.id);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`flex items-end gap-1.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-broo-gradient text-[10px] font-black text-white">
                      {data.driverName[0]}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2 text-sm ${
                      isUser
                        ? "rounded-2xl rounded-br-md bg-broo-gradient text-white shadow-broo-primary"
                        : "rounded-2xl rounded-bl-md border border-border bg-broo-card-gradient text-foreground shadow-broo"
                    }`}
                  >
                    <p className="leading-snug whitespace-pre-wrap">{m.text}</p>
                    <div className={`mt-1 flex items-center gap-1 text-[9px] ${isUser ? "justify-end text-white/70" : "text-muted-foreground"}`}>
                      <span>{fmtTime(m.at)}</span>
                      {showCheck && <span>✓✓</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          {driverTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-1.5 justify-start">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-broo-gradient text-[10px] font-black text-white">
                {data.driverName[0]}
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-broo-card-gradient px-4 py-3 shadow-broo">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* quick replies */}
      {messages.length > 0 && !driverTyping && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q.label}
              onClick={() => send(q.text)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-broo tap-scale"
            >
              <span>{q.emoji}</span>
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="border-t border-border bg-card px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Kirim lokasi saat order aktif")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary tap-scale"
            aria-label="Lampiran"
          >
            <BrooIcon name="Plus" className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ketik pesan…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {text.trim() && (
              <button
                onClick={() => setText("")}
                className="text-muted-foreground tap-scale"
                aria-label="Hapus"
              >
                <BrooIcon name="X" className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => send()}
            disabled={!text.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-broo-gradient text-white shadow-broo-primary disabled:opacity-40 tap-scale"
            aria-label="Kirim"
          >
            <BrooIcon name="Send" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
