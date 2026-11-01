"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroo, type Tab } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Beranda", icon: "Home" },
  { id: "booking", label: "Booking", icon: "CalendarClock" },
  { id: "history", label: "Riwayat", icon: "ReceiptText" },
  { id: "chat", label: "Obrolan", icon: "MessageCircle" },
];

interface Ripple {
  id: number;
  x: number;
}

export default function BottomNav() {
  const activeTab = useBroo((s) => s.activeTab);
  const setTab = useBroo((s) => s.setTab);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (id: Tab, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const rid = Date.now();
    setRipples((r) => [...r, { id: rid, x }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== rid)), 650);
    setTab(id);
  };

  return (
    <nav className="relative z-30 shrink-0 border-t border-border glass safe-bottom">
      <div className="grid grid-cols-4 px-2 pt-2 pb-1.5">
        {ITEMS.map((it) => {
          const active = activeTab === it.id;
          return (
            <button
              key={it.id}
              onClick={(e) => handleClick(it.id, e)}
              className="relative flex flex-col items-center gap-1 overflow-visible py-1 tap-scale"
              aria-label={it.label}
            >
              {/* active glow background blob */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="nav-glow"
                    className="pointer-events-none absolute -top-1 left-1/2 h-9 w-12 -translate-x-1/2 rounded-full bg-primary/20 blur-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* ripple on click */}
              {ripples
                .filter((r) => true)
                .map((r) => (
                  <span
                    key={r.id}
                    className="pointer-events-none absolute top-1 h-8 w-8 -translate-x-1/2 rounded-full bg-primary/25 broo-ripple"
                    style={{ left: r.x }}
                  />
                ))}

              <BrooIcon
                name={it.icon}
                className={`relative h-[22px] w-[22px] transition-all duration-200 ${
                  active
                    ? "text-primary broo-nav-active scale-110"
                    : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.5 : 2}
                fill={active ? "oklch(0.68 0.19 45 / 0.15)" : "none"}
              />
              <span
                className={`relative text-[10.5px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {it.label}
              </span>

              {/* active wave underline */}
              {active && (
                <motion.span
                  layoutId="nav-wave-line"
                  className="absolute -bottom-0.5 h-[3px] w-7 rounded-full bg-broo-gradient broo-wave-line"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
