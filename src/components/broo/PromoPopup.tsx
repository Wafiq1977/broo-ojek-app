"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";

const ADS = [
  {
    image: "/promo/promo-1.png",
    badge: "Selamat Datang di Broo",
    title: "Bayar Lebih Murah, Tanpa Biaya Admin",
    desc: "Broo tidak memotong tarif driver. Kamu dapat harga lebih murah, driver dapat 100% — dari rakyat untuk rakyat.",
    cta: "Mulai Sekarang",
  },
  {
    image: "/promo/promo-2.png",
    badge: "Promo Spesial",
    title: "MakanBro — Antar Makanan Tanpa Markup",
    desc: "Pesan makanan dari resto mana saja. Harga sama seperti di tempat, ongkir jujur, tanpa biaya tersembunyi.",
    cta: "Pesan Makanan",
  },
  {
    image: "/promo/promo-driver.png",
    badge: "Peluang Penghasilan",
    title: "Jadi Driver Broo, 100% Tarif untukmu",
    desc: "Daftar sekali, berpenghasilan selamanya. Broo hanya memungut biaya administrasi sekali daftar — bukan komisi per order.",
    cta: "Lihat Cara Daftar",
  },
];

export default function PromoPopup() {
  const markHomePromoSeen = useBroo((s) => s.markHomePromoSeen);
  const openModal = useBroo((s) => s.openModal);

  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const goNext = () => setIdx((i) => Math.min(i + 1, ADS.length - 1));
  const finish = () => {
    setLeaving(true);
    setTimeout(() => {
      markHomePromoSeen();
    }, 220);
  };

  const ad = ADS[idx];

  const handleCta = () => {
    if (idx === ADS.length - 1) {
      // "Lihat Cara Daftar" -> close promo then open driver info
      finish();
      setTimeout(() => openModal("driver-info"), 600);
    } else if (idx === 1) {
      finish();
    } else {
      goNext();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <AnimatePresence onExitComplete={() => {}}>
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: leaving ? 0 : 1,
            scale: leaving ? 0.95 : 1,
            y: leaving ? 20 : 0,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative w-full max-w-[380px] overflow-hidden rounded-3xl bg-card shadow-2xl"
        >
          {/* close */}
          <button
            onClick={finish}
            aria-label="Tutup iklan"
            className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur tap-scale"
          >
            <BrooIcon name="X" className="h-4 w-4" />
          </button>

          {/* image */}
          <div className="relative h-44 w-full overflow-hidden sm:h-52">
            <Image src={ad.image} alt={ad.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-broo-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                {ad.badge}
              </span>
            </div>
          </div>

          {/* content */}
          <div className="space-y-3 p-5">
            <h2 className="text-xl font-black leading-tight text-foreground">
              {ad.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{ad.desc}</p>

            {/* dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {ADS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {idx < ADS.length - 1 && (
                <button
                  onClick={finish}
                  className="flex-1 rounded-2xl border border-border bg-secondary py-3 text-sm font-semibold text-secondary-foreground tap-scale"
                >
                  Lewati
                </button>
              )}
              <button
                onClick={handleCta}
                className="flex-[2] rounded-2xl bg-broo-gradient py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
              >
                {ad.cta}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
