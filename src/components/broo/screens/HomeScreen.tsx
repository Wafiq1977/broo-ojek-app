"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";
import { ServiceIcon } from "../ServiceIcon";
import {
  SERVICES,
  SAVED_PLACES,
  MERCHANTS,
  formatIDR,
  priceOf,
  type ServiceId,
} from "@/lib/broo-data";
import { toast } from "sonner";

const DEST_ICONS = ["Plane", "TrainFront", "Landmark", "Palmtree"];

const GALLERY = [
  { image: "/gallery/pengemudi.jpg", title: "Pengemudi Broo", desc: "Driver siap menjemput" },
  { image: "/gallery/mobil.jpg", title: "MobilBro", desc: "Nyaman ber-AC" },
  { image: "/gallery/serah-terima.jpg", title: "TitipBro", desc: "Antar belanjaan" },
  { image: "/gallery/bantuan.jpg", title: "TolongBro", desc: "Bantuan kapan saja" },
];

export default function HomeScreen() {
  const user = useBroo((s) => s.user);
  const openModal = useBroo((s) => s.openModal);
  const startDraft = useBroo((s) => s.startDraft);
  const openMerchant = useBroo((s) => s.openMerchant);
  const cart = useBroo((s) => s.cart);

  const pickService = (id: ServiceId) => {
    if (id === "MakanBro") {
      openModal("merchant-list");
      return;
    }
    startDraft({
      service: id,
      orderType: "now",
      pickup: "Lokasi kamu sekarang",
      destination: "",
      km: 0,
      paymentMethod: "cash",
    });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft-warm">
      {/* header */}
      <header className="sticky top-0 z-20 rounded-b-[2rem] bg-broo-header-gradient px-5 pb-5 pt-5 text-white safe-top shadow-broo-lg">
        <div className="flex items-center justify-between">
          <button onClick={() => openModal("profile")} className="flex items-center gap-2.5 tap-scale">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-sm font-black backdrop-blur ring-1 ring-white/30">
              {(user?.name || "B")[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-medium text-white/75">Halo, selamat datang</p>
              <p className="text-sm font-bold leading-tight">
                {user?.name?.split(" ")[0] || "Brooer"}
              </p>
            </div>
          </button>
          <button
            onClick={() => openModal("notifications")}
            aria-label="Notifikasi"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/25 backdrop-blur ring-1 ring-white/30 tap-scale"
          >
            <BrooIcon name="Bell" className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-300 ring-2 ring-primary" />
          </button>
        </div>

        {/* search */}
        <button
          onClick={() => toast.info("Cari tujuanmu saat memesan layanan ya")}
          className="mt-4 flex w-full items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-left text-sm text-muted-foreground shadow-lg shadow-black/10 tap-scale"
        >
          <BrooIcon name="Search" className="h-4 w-4 text-primary" />
          Mau ke mana hari ini?
        </button>
      </header>

      {/* services — 4 di atas, TolongBro + Lainnya di bawah */}
      <section className="px-5 pt-5">
        {/* row 1: MotorBro, MobilBro, MakanBro, TitipBro */}
        <div className="grid grid-cols-4 gap-2.5">
          {SERVICES.filter((s) => ["MotorBro", "MobilBro", "MakanBro", "TitipBro"].includes(s.id)).map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => pickService(s.id)}
              className="flex flex-col items-center gap-1.5"
            >
              <ServiceIcon icon={s.icon} gradient={s.color} size={56} serviceId={s.id} />
              <span className="text-[11px] font-bold leading-tight text-foreground text-center">
                {s.name}
              </span>
            </motion.button>
          ))}
        </div>
        {/* row 2: TolongBro + Lainnya */}
        <div className="mt-3.5 grid grid-cols-4 gap-2.5">
          {SERVICES.filter((s) => s.id === "TolongBro").map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => pickService(s.id)}
              className="flex flex-col items-center gap-1.5"
            >
              <ServiceIcon icon={s.icon} gradient={s.color} size={56} serviceId={s.id} />
              <span className="text-[11px] font-bold leading-tight text-foreground text-center">
                {s.name}
              </span>
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => openModal("more-services")}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary">
              <BrooIcon name="MoreHorizontal" className="h-7 w-7" strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-bold leading-tight text-primary text-center">
              Lainnya
            </span>
          </motion.button>
        </div>
      </section>

      {/* gallery — aesthetic auto-sliding carousel */}
      <section className="pt-6">
        <GallerySlider />
      </section>

      {/* promo carousel */}
      <section className="pt-5">
        <PromoCarousel
          onPick={(cta) => {
            if (cta.includes("Driver")) openModal("driver-info");
            else if (cta.includes("Makanan")) openModal("merchant-list");
            else if (cta.includes("Belanja")) pickService("TitipBro");
            else pickService("MotorBro");
          }}
        />
      </section>

      {/* UMKM kedai — Kedai Favorit vertical list (one per row) */}
      <section className="pt-5">
        <div className="mb-2.5 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <BrooIcon name="UtensilsCrossed" className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black text-foreground">Kedai Favorit</h3>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              UMKM
            </span>
          </div>
          <button
            onClick={() => openModal("merchant-list")}
            className="text-xs font-semibold text-primary"
          >
            Lihat semua
          </button>
        </div>
        <div className="space-y-2.5 px-5">
          {MERCHANTS.slice(0, 5).map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openMerchant(m)}
              className="flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border bg-broo-card-gradient p-2.5 text-left shadow-broo tap-scale"
            >
              {/* cover image — larger, clearer */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={m.cover} alt={m.name} fill className="object-cover" sizes="64px" />
              </div>
              {/* info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-black text-foreground">{m.name}</p>
                  {m.promo && (
                    <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-white">
                      {m.promo}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{m.category}</p>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5 font-bold text-foreground">
                    <BrooIcon name="Star" className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {m.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <BrooIcon name="Clock" className="h-3 w-3" />
                    {m.eta}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <BrooIcon name="Navigation" className="h-3 w-3" />
                    {m.distanceKm}km
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-600">
                    <BrooIcon name="BadgeCheck" className="h-3 w-3" />
                    Halal
                  </span>
                </div>
              </div>
              {/* chevron */}
              <BrooIcon name="ChevronRight" className="h-4 w-4 shrink-0 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* value banner */}
      <section className="px-5 pt-4">
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 p-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-broo">
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
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <BrooIcon name="MapPinned" className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black text-foreground">Tujuan Populer</h3>
          </div>
          <button className="text-xs font-semibold text-primary">Lihat semua</button>
        </div>
        <div className="space-y-2">
          {SAVED_PLACES.slice(0, 4).map((p, i) => (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                startDraft({
                  service: "MotorBro",
                  orderType: "now",
                  pickup: "Lokasi kamu sekarang",
                  destination: `${p.name} — ${p.address}`,
                  km: p.km,
                  paymentMethod: "cash",
                });
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-broo-card-gradient p-3 text-left shadow-broo tap-scale"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BrooIcon name={DEST_ICONS[i] || "MapPin"} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{p.address}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">{p.km} km</p>
                <p className="text-sm font-black text-primary">
                  {formatIDR(priceOf("MotorBro", p.km))}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* driver recruit banner — moved to onboarding/daftar driver only */}

      {/* floating cart bar (if cart has items) */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="sticky bottom-0 z-20 px-4 pb-3"
          >
            <button
              onClick={() => openModal("merchant-list")}
              className="flex w-full items-center gap-3 rounded-2xl bg-broo-gradient p-3 text-white shadow-broo-primary tap-scale"
            >
              <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                <BrooIcon name="ShoppingBag" className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] text-white/80">Keranjang MakanBro</p>
                <p className="text-sm font-black">
                  {formatIDR(cart.reduce((a, c) => a + c.qty * c.item.price, 0))}
                </p>
              </div>
              <span className="text-xs font-bold">Lihat</span>
              <BrooIcon name="ChevronRight" className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromoCarousel({ onPick }: { onPick: (cta: string) => void }) {
  const [i, setI] = useState(0);
  const promos = [
    { image: "/promo/promo-1.png", title: "Tanpa Biaya Admin Selamanya", sub: "Harga lebih murah untukmu", cta: "Pesan Sekarang", icon: "Percent" },
    { image: "/promo/promo-2.png", title: "MakanBro — Antar Makanan", sub: "Tanpa markup harga resto", cta: "Pesan Makanan", icon: "UtensilsCrossed" },
    { image: "/promo/promo-3.png", title: "TitipBro — Jasa Titip Belanja", sub: "Antar dari toko mana saja", cta: "Titip Belanja", icon: "ShoppingBag" },
    { image: "/promo/promo-driver.png", title: "Jadi Driver, 100% Tarifmu", sub: "Daftar sekali, untung selamanya", cta: "Lihat Cara Daftar", icon: "Bike" },
  ];
  return (
    <div className="px-5">
      <div className="relative overflow-hidden rounded-3xl shadow-broo-lg">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="relative h-36 w-full overflow-hidden"
          >
            <Image src={promos[i].image} alt={promos[i].title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-orange-300">
                <BrooIcon name={promos[i].icon} className="h-3.5 w-3.5" />
                Promo
              </p>
              <h4 className="mt-1 max-w-[70%] text-base font-black leading-tight text-white">
                {promos[i].title}
              </h4>
              <p className="mt-0.5 text-xs text-white/80">{promos[i].sub}</p>
              <button
                onClick={() => onPick(promos[i].cta)}
                className="mt-2.5 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-foreground shadow tap-scale"
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

/** Aesthetic auto-sliding gallery carousel with parallax zoom + Ken Burns effect */
function GallerySlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setI((v) => (v + 1) % GALLERY.length);
    }, 4000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="px-5">
      <div
        className="relative overflow-hidden rounded-[2rem] shadow-broo-lg"
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* slides */}
        <div className="relative h-56 w-full">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1.08, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -30 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={GALLERY[i].image}
                alt={GALLERY[i].title}
                fill
                className="object-cover"
                sizes="(max-width: 440px) 90vw, 400px"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* top: index badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur">
            <BrooIcon name="Sparkles" className="h-3 w-3 text-orange-300" />
            <span className="text-[10px] font-bold text-white">Broo Gallery</span>
          </div>

          {/* content */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p className="text-lg font-black leading-tight text-white drop-shadow">
                  {GALLERY[i].title}
                </p>
                <p className="mt-0.5 text-xs text-white/85">{GALLERY[i].desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* indicators */}
            <div className="mt-3 flex items-center gap-1.5">
              {GALLERY.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: idx === i ? 24 : 6,
                    backgroundColor: idx === i ? "#F97316" : "rgba(255,255,255,0.4)",
                  }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* prev/next arrows */}
        <button
          onClick={() => setI((v) => (v - 1 + GALLERY.length) % GALLERY.length)}
          className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur tap-scale transition hover:bg-black/55"
          aria-label="Sebelumnya"
        >
          <BrooIcon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <button
          onClick={() => setI((v) => (v + 1) % GALLERY.length)}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur tap-scale transition hover:bg-black/55"
          aria-label="Berikutnya"
        >
          <BrooIcon name="ChevronRight" className="h-5 w-5" />
        </button>

        {/* progress bar at very top */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-white/15">
          <motion.div
            key={i + (paused ? "p" : "")}
            initial={{ width: "0%" }}
            animate={{ width: paused ? "0%" : "100%" }}
            transition={{ duration: paused ? 0 : 4, ease: "linear" }}
            className="h-full bg-orange-400"
          />
        </div>
      </div>
    </div>
  );
}
