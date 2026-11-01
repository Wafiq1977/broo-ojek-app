"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { toast } from "sonner";

interface Msg {
  id: string;
  from: "user" | "driver";
  text: string;
  at: string;
  type?: "text" | "location" | "image";
  meta?: { lat?: number; lng?: number; label?: string; imageUrl?: string };
}

const QUICK_REPLIES = [
  { label: "Saya di mana?", text: "Driver, saya di mana ya?", icon: "MapPin" },
  { label: "Berapa lama?", text: "Berapa lama lagi sampai?", icon: "Clock" },
  { label: "Sudah dekat?", text: "Sudah dekat lokasi jemput?", icon: "Navigation" },
  { label: "Terima kasih", text: "Terima kasih ya kak", icon: "Heart" },
];

export default function ChatDetailOverlay() {
  const chatOpenLive = useBroo((s) => s.chatOpen);
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
  const [showAttach, setShowAttach] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      if (data.conversationId) {
        try {
          const res = await fetch(`/api/broo/chats?userId=${user.id}&conversationId=${data.conversationId}`);
          const d = await res.json();
          if (active && d.ok) setMessages(d.conversation.messages || []);
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
          const d = await res.json();
          if (active && d.ok) {
            setConvId(d.conversation.id);
            setMessages(d.conversation.messages || []);
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

  const send = async (msgText?: string, msgType?: Msg["type"], msgMeta?: Msg["meta"]) => {
    const content = (msgText ?? text).trim();
    if (!content && msgType !== "location" && msgType !== "image") return;
    if (!convId) return;

    const msg: Msg = {
      id: crypto.randomUUID(),
      from: "user",
      text: content || (msgType === "location" ? "Lokasi saya" : "Gambar"),
      at: new Date().toISOString(),
      type: msgType || "text",
      meta: msgMeta,
    };
    setMessages((m) => [...m, msg]);
    setSentIds((s) => new Set(s).add(msg.id));
    setText("");
    setShowAttach(false);
    setDriverTyping(true);

    try {
      const res = await fetch("/api/broo/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          action: "send",
          conversationId: convId,
          text: content || (msgType === "location" ? "[Lokasi]" : "[Gambar]"),
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setTimeout(() => {
          setDriverTyping(false);
          setMessages((m) => {
            const reply = (d.conversation.messages as Msg[]).slice(-1)[0];
            return reply ? [...m, reply] : m;
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

  const sendLocation = () => {
    // Bojonegoro center as demo location
    const lat = -7.15 + (Math.random() - 0.5) * 0.01;
    const lng = 111.8817 + (Math.random() - 0.5) * 0.01;
    send("Lokasi saya", "location", { lat, lng, label: "Lokasi saat ini" });
    toast.success("Lokasi terkirim");
  };

  const sendImage = () => {
    // demo: send a placeholder image message
    send("", "image", { imageUrl: "/promo/promo-1.png" });
    toast.success("Gambar terkirim");
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
      {/* header */}
      <header className="flex items-center gap-3 border-b border-border bg-broo-header-gradient px-4 pb-3 pt-5 text-white safe-top">
        <button onClick={handleClose} aria-label="Kembali" className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur tap-scale">
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
        <button onClick={() => toast.info("Menghubungkan panggilan…")} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur text-white tap-scale" aria-label="Telepon">
          <BrooIcon name="Phone" className="h-4 w-4" />
        </button>
      </header>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto broo-scrollbar px-4 py-4">
        <div className="mx-auto mb-4 w-fit rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-muted-foreground">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
        </div>

        <div className="mx-auto mb-4 flex max-w-[90%] items-center gap-2 rounded-2xl bg-primary/8 p-2.5 text-[11px] text-primary">
          <BrooIcon name="ShieldCheck" className="h-3.5 w-3.5 shrink-0 text-primary" /> Obrolan diamankan oleh Broo. Mohon jaga sopan santun.
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
                    {m.type === "location" && m.meta ? (
                      <div>
                        <p className="font-bold flex items-center gap-1">
                          <BrooIcon name="MapPin" className="h-3.5 w-3.5" />
                          {m.meta.label || "Lokasi"}
                        </p>
                        <div className="mt-1.5 h-20 overflow-hidden rounded-lg bg-secondary">
                          <BrooMapMini lat={m.meta.lat || 0} lng={m.meta.lng || 0} />
                        </div>
                        <p className="mt-1 text-[10px] opacity-70">
                          {m.meta.lat?.toFixed(4)}, {m.meta.lng?.toFixed(4)}
                        </p>
                      </div>
                    ) : m.type === "image" && m.meta?.imageUrl ? (
                      <div>
                        <img src={m.meta.imageUrl} alt="gambar" className="max-h-32 rounded-lg" />
                        <p className="mt-1 text-[10px] opacity-70">Gambar</p>
                      </div>
                    ) : (
                      <p className="leading-snug whitespace-pre-wrap">{m.text}</p>
                    )}
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
      {messages.length > 0 && !driverTyping && !showAttach && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-1">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q.label}
              onClick={() => send(q.text)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-broo tap-scale"
            >
              <BrooIcon name={q.icon} className="h-3.5 w-3.5 text-primary" />
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* attachment menu */}
      <AnimatePresence>
        {showAttach && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card"
          >
            <div className="grid grid-cols-3 gap-2 p-3">
              <button onClick={sendLocation} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-secondary/50 p-3 tap-scale">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BrooIcon name="MapPin" className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-foreground">Lokasi</span>
              </button>
              <button onClick={sendImage} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-secondary/50 p-3 tap-scale">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BrooIcon name="Image" className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-foreground">Gambar</span>
              </button>
              <button onClick={() => { toast.info("Kamera segera hadir"); setShowAttach(false); }} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-secondary/50 p-3 tap-scale">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BrooIcon name="Camera" className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-foreground">Kamera</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* input */}
      <div className="border-t border-border bg-card px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttach((v) => !v)}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full tap-scale ${showAttach ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}
            aria-label="Lampiran"
          >
            <BrooIcon name={showAttach ? "X" : "Plus"} className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ketik pesan…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {text.trim() && (
              <button onClick={() => setText("")} className="text-muted-foreground tap-scale" aria-label="Hapus">
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

// mini map preview for location messages
function BrooMapMini({ lat, lng }: { lat: number; lng: number }) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.003}%2C${lat - 0.003}%2C${lng + 0.003}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;
  return <iframe src={src} className="h-full w-full" style={{ border: 0 }} loading="lazy" title="Lokasi" />;
}
