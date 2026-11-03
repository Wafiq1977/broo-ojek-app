"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";

export default function SplashScreen() {
  const setPhase = useBroo((s) => s.setPhase);
  const isRegistered = useBroo((s) => s.isRegistered);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(isRegistered ? "app" : "onboarding");
    }, 2600);
    return () => clearTimeout(t);
  }, [setPhase, isRegistered]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-broo-header-gradient">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 translate-y-1/3 rounded-full bg-orange-500/30 blur-3xl" />
      </div>

      {/* subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(120% 80% at 50% 40%, #000 30%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8">
        {/* Logo only */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
          className="relative"
        >
          {/* pulse rings behind logo */}
          <span className="absolute inset-0 rounded-full bg-white/40 broo-pulse-ring" />
          <span
            className="absolute inset-0 rounded-full bg-white/30 broo-pulse-ring"
            style={{ animationDelay: "0.8s" }}
          />
          <div className="relative grid place-items-center">
            <Image
              src="/broo-logo.png"
              alt="Broo"
              width={124}
              height={124}
              className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              priority
            />
          </div>
        </motion.div>

        {/* Wordmark image below logo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <Image
            src="/broo-wordmark.png"
            alt="Broo by OJEK"
            width={180}
            height={60}
            className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            priority
          />
        </motion.div>
      </div>

      {/* loader */}
      <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "44%" }}
          transition={{ delay: 0.4, duration: 1.9, ease: "easeInOut" }}
          className="h-1 rounded-full bg-white/85"
        />
      </div>
    </div>
  );
}
