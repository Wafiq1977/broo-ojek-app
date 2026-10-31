"use client";

import { motion } from "framer-motion";
import { useBroo, type Tab } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Beranda", icon: "Home" },
  { id: "food", label: "MakanBro", icon: "UtensilsCrossed" },
  { id: "booking", label: "Booking", icon: "CalendarClock" },
  { id: "history", label: "Riwayat", icon: "ReceiptText" },
  { id: "chat", label: "Obrolan", icon: "MessageCircle" },
];

export default function BottomNav() {
  const activeTab = useBroo((s) => s.activeTab);
  const setTab = useBroo((s) => s.setTab);

  return (
    <nav className="relative z-30 shrink-0 border-t border-border bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="grid grid-cols-5 px-1.5 pt-1.5 pb-1.5">
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
                  className="absolute -top-1.5 h-1 w-7 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <BrooIcon
                name={it.icon}
                className={`h-[21px] w-[21px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={`text-[10px] font-semibold transition-colors ${
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
