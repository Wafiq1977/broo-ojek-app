"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import SplashScreen from "@/components/broo/SplashScreen";
import Onboarding from "@/components/broo/Onboarding";
import AppShell from "@/components/broo/AppShell";

export default function Home() {
  const phase = useBroo((s) => s.phase);
  const setPhase = useBroo((s) => s.setPhase);
  const isRegistered = useBroo((s) => s.isRegistered);
  const homePromoSeen = useBroo((s) => s.homePromoSeen);

  // ensure seed runs on first mount
  useEffect(() => {
    fetch("/api/broo/seed", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900">
      {/* phone frame (desktop) / full (mobile) — smooth rounded corners */}
      <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-background shadow-2xl shadow-black/30 sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[2.8rem] sm:ring-[12px] sm:ring-neutral-800/90 sm:border-0">
        <AnimatePresence mode="wait">
          {phase === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <SplashScreen />
            </motion.div>
          )}
          {phase === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Onboarding />
            </motion.div>
          )}
          {phase === "app" && (
            <motion.div
              key="app"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <AppShell />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* tiny desktop hint */}
      <DesktopHint
        onGoSplash={() => setPhase("splash")}
        onGoOnboarding={() => setPhase("onboarding")}
        onGoApp={() => setPhase(isRegistered ? "app" : "onboarding")}
        onResetPromo={() => useBroo.setState({ homePromoSeen: false })}
        homePromoSeen={homePromoSeen}
      />
    </main>
  );
}

function DesktopHint({
  onGoSplash,
  onGoOnboarding,
  onGoApp,
  onResetPromo,
  homePromoSeen,
}: {
  onGoSplash: () => void;
  onGoOnboarding: () => void;
  onGoApp: () => void;
  onResetPromo: () => void;
  homePromoSeen: boolean;
}) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 hidden flex-col gap-1.5 lg:flex">
      <div className="rounded-xl bg-white/90 px-3 py-2 text-[11px] font-bold text-neutral-700 shadow dark:bg-neutral-800 dark:text-neutral-200">
        Broo — Ojek Online dari Rakyat untuk Rakyat
      </div>
      <div className="pointer-events-auto flex flex-col gap-1 rounded-xl bg-white/80 p-1.5 text-[10px] dark:bg-neutral-800/80">
        <button onClick={onGoSplash} className="rounded-lg px-2 py-1 text-left font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700">
          ↺ Splash
        </button>
        <button onClick={onGoOnboarding} className="rounded-lg px-2 py-1 text-left font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700">
          ↺ Onboarding
        </button>
        <button onClick={onGoApp} className="rounded-lg px-2 py-1 text-left font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700">
          ↺ Aplikasi
        </button>
        {homePromoSeen && (
          <button onClick={onResetPromo} className="rounded-lg px-2 py-1 text-left font-semibold text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30">
            ↺ Iklan
          </button>
        )}
      </div>
    </div>
  );
}
