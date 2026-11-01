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

export default function BottomNav() {
  const activeTab = useBroo((s) => s.activeTab);
  const setTab = useBroo((s) => s.setTab);

  return (
    <nav className="relative z-30 shrink-0 border-t border-border glass safe-bottom">
      <div className="grid grid-cols-4 px-2 pt-1.5 pb-1.5">
        {ITEMS.map((it) => {
          const active = activeTab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="relative flex flex-col items-center gap-1 py-1 tap-scale"
              aria-label={it.label}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute -top-1.5 h-1 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <BrooIcon
                name={it.icon}
                className={`h-[22px] w-[22px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10.5px] font-semibold transition-colors ${
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
