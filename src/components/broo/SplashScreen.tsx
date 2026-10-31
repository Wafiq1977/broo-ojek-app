"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";

export default function SplashScreen() {
  const setPhase = useBroo((s) => s.setPhase);
  const promoSeen = useBroo((s) => s.promoSeen);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(promoSeen ? (useBroo.getState().isRegistered ? "app" : "onboarding") : "promo");
    }, 2600);
    return () => clearTimeout(t);
  }, [setPhase, promoSeen]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-broo-gradient">
      {/* decorative glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 -left-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
          className="relative"
        >
          {/* pulse ring */}
          <span className="absolute inset-0 rounded-[2rem] bg-white/30 broo-pulse-ring" />
          <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] bg-white shadow-2xl shadow-black/20">
            <Image
              src="/broo-logo.png"
              alt="Broo"
              width={84}
              height={84}
              className="drop-shadow-sm"
              priority
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <h1 className="text-4xl font-black tracking-tight text-white">Broo</h1>
          <p className="mt-1.5 text-sm font-medium text-white/80">
            Ojek online dari rakyat untuk rakyat
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="mt-3 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="text-xs font-semibold text-white">
            Tanpa potongan biaya
          </span>
        </motion.div>
      </div>

      {/* loader */}
      <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "44%" }}
          transition={{ delay: 0.4, duration: 1.9, ease: "easeInOut" }}
          className="h-1 rounded-full bg-white/80"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs font-medium text-white/70"
        >
          Menyiapkan perjalananmu…
        </motion.p>
      </div>
    </div>
  );
}
