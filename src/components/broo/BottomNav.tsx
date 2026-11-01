"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBroo, type Tab } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Beranda", icon: "Home" },
  { id: "booking", label: "Booking", icon: "CalendarClock" },
  { id: "history", label: "Riwayat", icon: "ReceiptText" },
  { id: "chat", label: "Obrolan", icon: "MessageCircle" },
];

export default function BottomNav() {
  const activeTab = useBroo((s) => s.activeTab);
  const setTab = useBroo((s) => s.setTab);

  return (
    <nav className="relative z-30 shrink-0 border-t border-border bg-card safe-bottom">
      <div className="grid grid-cols-4 px-2 pt-2.5 pb-2">
        {ITEMS.map((it) => {
          const active = activeTab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="relative flex flex-col items-center gap-1 py-1 tap-scale"
              aria-label={it.label}
            >
              {/* Floating island circle — only on active, slides between tabs */}
              {active && (
                <motion.span
                  layoutId="nav-island"
                  className="pointer-events-none absolute -top-5 grid h-12 w-12 place-items-center rounded-full bg-card shadow-broo-lg ring-1 ring-border/50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {/* Icon: filled brand color when active, outline gray when not */}
              <BrooIcon
                name={it.icon}
                className={`relative h-[22px] w-[22px] transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.4 : 2}
                fill={active ? "oklch(0.68 0.19 45 / 0.18)" : "none"}
              />
              <span
                className={`relative text-[10px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
