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
    <nav className="relative z-30 shrink-0 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="grid grid-cols-4 px-2 pt-2 pb-2">
        {ITEMS.map((it) => {
          const active = activeTab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="relative flex flex-col items-center justify-center gap-1 py-1"
              aria-label={it.label}
            >
              {/* Active pill background — smooth slide */}
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="pointer-events-none absolute inset-x-2 inset-y-0 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {/* Icon with smooth scale + color morph */}
              <motion.span
                animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative"
              >
                <BrooIcon
                  name={it.icon}
                  className={`h-[22px] w-[22px] transition-colors duration-200 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active ? "oklch(0.68 0.19 45 / 0.12)" : "none"}
                />
              </motion.span>
              <span
                className={`relative text-[10px] font-semibold transition-colors duration-200 ${
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
