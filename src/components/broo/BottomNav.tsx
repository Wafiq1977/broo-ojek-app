"use client";

import { motion } from "framer-motion";
import { useBroo, type Tab } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Beranda", icon: "Home" },
  { id: "booking", label: "Booking", icon: "CalendarClock" },
  { id: "history", label: "Riwayat", icon: "ReceiptText" },
  { id: "chat", label: "Obrolan", icon: "MessageCircle" },
];

export default function BottomNav({ disabled = false }: { disabled?: boolean }) {
  const activeTab = useBroo((s) => s.activeTab);
  const setTab = useBroo((s) => s.setTab);

  return (
    <nav
      className={`relative z-30 shrink-0 bg-card/90 backdrop-blur-xl safe-bottom transition-all duration-300 ${disabled ? "opacity-40 pointer-events-none" : ""}`}
      style={{
        boxShadow: disabled ? "none" : "0 -1px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* thin top divider line, very subtle */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      <div className="grid grid-cols-4 px-3 pt-2.5 pb-2">
        {ITEMS.map((it) => {
          const active = activeTab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => !disabled && setTab(it.id)}
              disabled={disabled}
              className="relative flex flex-col items-center justify-center gap-1 py-1.5 transition-opacity"
              aria-label={it.label}
            >
              {/* Active pill background — smooth slide */}
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="pointer-events-none absolute inset-x-3 inset-y-0 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {/* Icon */}
              <motion.span
                animate={{ scale: active ? 1.1 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className="relative"
              >
                <BrooIcon
                  name={it.icon}
                  className={`h-[22px] w-[22px] transition-colors duration-200 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.4 : 1.9}
                />
              </motion.span>
              <span
                className={`relative text-[10px] font-medium transition-colors duration-200 ${
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
