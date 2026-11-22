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
    <div className="px-4 pb-3 safe-bottom">
      <nav
        className="relative z-30 rounded-[1.75rem] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.04]"
      >
        <div className="grid grid-cols-4 px-2 py-2.5">
          {ITEMS.map((it) => {
            const active = activeTab === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setTab(it.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-1.5"
                aria-label={it.label}
              >
                {/* Active pill background — smooth slide */}
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="pointer-events-none absolute inset-x-2 inset-y-0 rounded-[1.25rem]"
                    style={{ backgroundColor: "#FFF0E5" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {/* Icon with subtle scale */}
                <motion.span
                  animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="relative"
                >
                  <BrooIcon
                    name={it.icon}
                    className="h-[22px] w-[22px] transition-colors duration-200"
                    style={{ color: active ? "#FF6A00" : "#858585" }}
                    strokeWidth={active ? 2.4 : 2}
                  />
                </motion.span>
                <span
                  className="relative text-[10px] font-semibold transition-colors duration-200"
                  style={{ color: active ? "#FF6A00" : "#858585" }}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
