"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";
import { SERVICES, SAVED_PLACES, formatIDR, priceOf, type OrderType, type ServiceId } from "@/lib/broo-data";
import { toast } from "sonner";

export default function HomeScreen() {
  const user = useBroo((s) => s.user);
  const openModal = useBroo((s) => s.openModal);
  const startDraft = useBroo((s) => s.startDraft);

  const [orderType, setOrderType] = useState<OrderType>("now");

  const pickService = (id: ServiceId) => {
    const dest = SAVED_PLACES[0];
    startDraft({
      service: id,
      orderType,
      pickup: "Lokasi kamu sekarang",
      destination: "",
      km: 0,
      paymentMethod: "cash",
    });
    void dest;
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft">
      {/* header */}
      <header className="sticky top-0 z-20 bg-broo-gradient px-5 pb-5 pt-5 text-white safe-top">
        <div className="flex items-center justify-between">
          <button
            onClick={() => openModal("profile")}
            className="flex items-center gap-2.5 tap-scale"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-sm font-black backdrop-blur">
              {(user?.name || "B")[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-medium text-white/75">Halo, selamat datang</p>
              <p className="text-sm font-bold leading-tight">
                {user?.name?.split(" ")[0] || "Brooer"} 👋
              </p>
            </div>
          </button>
          <button
            onClick={() => openModal("notifications")}
            aria-label="Notifikasi"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur tap-scale"
          >
            <BrooIcon name="Bell" className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-300 ring-2 ring-primary" />
          </button>
        </div>

        {/* search */}
        <button
          onClick={() => toast.info("Cari tujuanmu saat memesan layanan ya 🙂")}
          className="mt-4 flex w-full items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-left text-sm text-muted-foreground shadow-lg shadow-black/10 tap-scale"
        >
          <BrooIcon name="Search" className="h-4 w-4 text-primary" />
          Mau ke mana hari ini?
        </button>
      </header>

      {/* now / booking toggle */}
      <div className="px-5 pt-4">
        <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
          {(["now", "booking"] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className="relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold tap-scale"
            >
              {orderType === t && (
                <motion.span
                  layoutId="order-type-pill"
                  className="absolute inset-0 rounded-xl bg-broo-gradient shadow-md shadow-primary/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 inline-flex items-center gap-1.5 ${
                  orderType === t ? "text-white" : "text-muted-foreground"
                }`}
              >
                <BrooIcon name={t === "now" ? "Zap" : "CalendarClock"} className="h-4 w-4" />
                {t === "now" ? "Pesan Sekarang" : "Booking"}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {orderType === "now"
            ? "Driver akan menjemputmu dalam beberapa menit"
            : "Jadwalkan perjalanan untuk nanti sesukamu"}
        </p>
      </div>

      {/* services */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-4 gap-2.5">
          {SERVICES.map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => pickService(s.id)}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`grid h-[60px] w-[60px] place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}
              >
                <BrooIcon name={s.icon} className="h-7 w-7" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold leading-tight text-foreground">
                {s.name}
              </span>
            </motion.button>
          ))}
          <button
            onClick={() => openModal("driver-info")}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="grid h-[60px] w-[60px] place-items-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary">
              <BrooIcon name="UserPlus" className="h-7 w-7" />
            </div>
            <span className="text-[11px] font-bold leading-tight text-primary">
              Jadi Driver
            </span>
          </button>
        </div>
      </section>

      {/* promo carousel */}
      <section className="pt-5">
        <PromoCarousel onPick={(cta) => {
          if (cta.includes("Driver")) openModal("driver-info");
          else if (cta.includes("Makanan")) pickService("MakanBro");
          else if (cta.includes("Belanja")) pickService("TitipBro");
          else pickService("MotorBro");
        }} />
      </section>

      {/* value banner */}
      <section className="px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
            <BrooIcon name="Percent" className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-foreground">0% Komisi Driver</p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Kamu bayar lebih murah, driver dapat 100% — dari rakyat untuk rakyat.
            </p>
          </div>
        </div>
      </section>

      {/* popular destinations */}
      <section className="px-5 pt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-base font-black text-foreground">Tujuan Populer</h3>
          <button className="text-xs font-semibold text-primary">Lihat semua</button>
        </div>
        <div className="space-y-2">
          {SAVED_PLACES.slice(0, 4).map((p) => (
            <button
              key={p.name}
              onClick={() => {
                startDraft({
                  service: "MotorBro",
                  orderType,
                  pickup: "Lokasi kamu sekarang",
                  destination: `${p.name} — ${p.address}`,
                  km: p.km,
                  paymentMethod: "cash",
                });
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left tap-scale"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BrooIcon name="MapPin" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{p.address}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">{p.km} km</p>
                <p className="text-sm font-black text-foreground">
                  {formatIDR(priceOf("MotorBro", p.km))}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* driver recruit banner */}
      <section className="px-5 pt-5 pb-8">
        <button
          onClick={() => openModal("driver-info")}
          className="relative block w-full overflow-hidden rounded-3xl bg-broo-dark-gradient p-4 text-left text-white tap-scale"
        >
          <Image
            src="/promo/promo-driver.png"
            alt="Jadi Driver"
            fill
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="relative">
            <span className="rounded-full bg-emerald-400 px-2.5 py-0.5 text-[10px] font-bold text-emerald-950">
              PENGHASILAN
            </span>
            <h3 className="mt-2 text-lg font-black leading-tight">
              Punya Kendaraan?
              <br />
              Berpenghasilan Bersama Broo
            </h3>
            <p className="mt-1 text-xs text-white/75">
              Bayar admin sekali daftar, 100% tarif untukmu selamanya.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-foreground">
              Cara Daftar
              <BrooIcon name="ChevronRight" className="h-4 w-4" />
            </span>
          </div>
        </button>
      </section>
    </div>
  );
}

function PromoCarousel({ onPick }: { onPick: (cta: string) => void }) {
  const [i, setI] = useState(0);
  const promos = [
    { image: "/promo/promo-1.png", title: "Tanpa Biaya Admin Selamanya", sub: "Harga lebih murah untukmu", cta: "Pesan Sekarang" },
    { image: "/promo/promo-2.png", title: "MakanBro — Antar Makanan", sub: "Tanpa markup harga resto", cta: "Pesan Makanan" },
    { image: "/promo/promo-3.png", title: "TitipBro — Jasa Titip Belanja", sub: "Antar dari toko mana saja", cta: "Titip Belanja" },
    { image: "/promo/promo-driver.png", title: "Jadi Driver, 100% Tarifmu", sub: "Daftar sekali, untung selamanya", cta: "Lihat Cara Daftar" },
  ];
  return (
    <div className="px-5">
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="relative h-36 w-full overflow-hidden"
          >
            <Image src={promos[i].image} alt={promos[i].title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-orange-300">
                Promo
              </p>
              <h4 className="mt-1 max-w-[70%] text-base font-black leading-tight text-white">
                {promos[i].title}
              </h4>
              <p className="mt-0.5 text-xs text-white/80">{promos[i].sub}</p>
              <button
                onClick={() => onPick(promos[i].cta)}
                className="mt-2.5 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-foreground tap-scale"
              >
                {promos[i].cta}
                <BrooIcon name="ChevronRight" className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-2 right-3 flex gap-1">
          {promos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Promo ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
