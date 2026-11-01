"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { ServiceIcon } from "./ServiceIcon";
import BrooMap from "./BrooMap";
import {
  SERVICE_MAP,
  SAVED_PLACES,
  PAYMENT_METHODS,
  formatIDR,
  priceOf,
  type OrderType,
} from "@/lib/broo-data";
import { toast } from "sonner";

type Stage =
  | "form"
  | "confirming"
  | "searching"
  | "assigned"
  | "arrived"
  | "done";

export default function OrderFlow() {
  const draft = useBroo((s) => s.draft);
  const clearDraft = useBroo((s) => s.clearDraft);
  const user = useBroo((s) => s.user);
  const bumpHistory = useBroo((s) => s.bumpHistory);
  const openChat = useBroo((s) => s.openChat);
  const openModal = useBroo((s) => s.openModal);

  const [stage, setStage] = useState<Stage>("form");
  const [pickup, setPickup] = useState(draft?.pickup || "Lokasi kamu sekarang");
  const [destination, setDestination] = useState(draft?.destination || "");
  const [km, setKm] = useState(draft?.km || 0);
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<string>(draft?.paymentMethod || "cash");
  const [orderType, setOrderType] = useState<OrderType>(draft?.orderType || "now");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [assigned, setAssigned] = useState<{
    name: string;
    plate: string;
    vehicle: string;
    vehicleType: string;
    rating: number;
    orderId?: string;
  } | null>(null);

  const selectedService = draft?.service || "MotorBro";
  const service = SERVICE_MAP[selectedService];

  useEffect(() => {
    if (destination && destination.includes("—")) {
      const found = SAVED_PLACES.find((p) => destination.startsWith(p.name));
      if (found) setKm(found.km);
    }
  }, [destination]);

  if (!draft) return null;

  const effectiveKm = km || 1;
  const total = priceOf(selectedService, effectiveKm);

  const canConfirm =
    destination.trim().length > 2 &&
    (orderType === "now" || (bookingDate && bookingTime));

  const confirm = async () => {
    if (!user) return;
    setStage("confirming");
    try {
      if (orderType === "now") {
        const res = await fetch("/api/broo/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            service: selectedService,
            orderType: "now",
            pickup,
            destination,
            km: effectiveKm,
            paymentMethod: payment,
            note,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Gagal membuat pesanan");
        const o = data.order;
        if (o.driverName) {
          setAssigned({
            name: o.driverName,
            plate: "B 4521 KXP",
            vehicle: o.vehicleType === "mobil" ? "Toyota Avanza" : "Honda Beat",
            vehicleType: o.vehicleType,
            rating: 4.9,
            orderId: o.id,
          });
          setStage("searching");
          setTimeout(() => setStage("assigned"), 2200);
        } else {
          setStage("searching");
          setTimeout(() => setStage("assigned"), 2600);
          setAssigned({
            name: "Driver Broo",
            plate: "—",
            vehicle: service.id === "MobilBro" ? "Mobil" : "Motor",
            vehicleType: service.id === "MobilBro" ? "mobil" : "motor",
            rating: 4.9,
            orderId: o.id,
          });
        }
      } else {
        const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
        const res = await fetch("/api/broo/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            service: selectedService,
            pickup,
            destination,
            km: effectiveKm,
            scheduledAt,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Gagal membuat booking");
        toast.success("Booking berhasil! Lihat di tab Booking");
        bumpHistory();
        close_();
      }
    } catch (e) {
      toast.error((e as Error).message);
      setStage("form");
    }
  };

  const finishOrder = () => {
    bumpHistory();
    toast.success("Perjalanan selesai! Beri rating ya");
    clearDraft();
    setStage("form");
    setAssigned(null);
  };

  function close_() {
    clearDraft();
    setStage("form");
    setAssigned(null);
  }

  // ===== TRACKING STAGE — FULLSCREEN MAP LIKE GRAB =====
  const isTracking = stage === "assigned" || stage === "arrived" || stage === "done";

  return (
    <AnimatePresence>
      {draft && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[80] flex flex-col bg-background"
        >
          {/* ============ TRACKING: FULLSCREEN MAP (Grab style) ============ */}
          {isTracking && assigned ? (
            <>
              {/* Big full map fills the screen */}
              <div className="absolute inset-0">
                <BrooMap
                  stage={stage}
                  vehicleType={assigned.vehicleType as "motor" | "mobil"}
                  className="h-full w-full"
                />
              </div>

              {/* top back button + status */}
              <div className="absolute left-4 right-4 top-4 z-10 flex items-center gap-3 safe-top">
                <button
                  onClick={() => { toast.info("Pesanan aktif"); }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card shadow-broo tap-scale"
                  aria-label="Kembali"
                >
                  <BrooIcon name="ChevronLeft" className="h-5 w-5" />
                </button>
                <div className="flex-1 rounded-2xl bg-card/95 px-3.5 py-2 shadow-broo backdrop-blur">
                  <p className="text-xs font-bold text-foreground">
                    {stage === "assigned" ? "Driver menuju lokasi jemput" : stage === "arrived" ? "Driver telah tiba" : "Perjalanan selesai"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ETA {Math.max(1, Math.round(effectiveKm * 2))} menit • {service.name}
                  </p>
                </div>
              </div>

              {/* bottom sheet with driver info + actions (Grab style) */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.2 }}
                className="absolute inset-x-0 bottom-0 z-10 rounded-t-[2rem] bg-background shadow-broo-lg safe-bottom"
              >
                <div className="mx-auto mt-3 mb-2 h-1.5 w-10 rounded-full bg-border" />
                <div className="px-5 pb-5 pt-1">
                  {/* driver card */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-broo-gradient text-lg font-black text-white">
                        {assigned.name[0]}
                      </div>
                      <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-background">
                        <BrooIcon name="CheckCircle2" className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-foreground">{assigned.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {assigned.vehicle} • {assigned.plate}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-foreground">
                        <BrooIcon name="Star" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {assigned.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          openChat({
                            conversationId: "",
                            driverName: assigned.name,
                            service: service.name,
                          });
                        }}
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary tap-scale"
                        aria-label="Chat"
                      >
                        <BrooIcon name="MessageCircle" className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => toast.info("Menghubungkan panggilan…")}
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-emerald-600 tap-scale"
                        aria-label="Telepon"
                      >
                        <BrooIcon name="Phone" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* route */}
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                    <div className="flex flex-col items-center pt-1">
                      <span className="h-2.5 w-2.5 rounded-full border-2 border-primary" />
                      <span className="my-1 h-6 w-0.5 border-l border-dashed border-border" />
                      <BrooIcon name="MapPin" className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                      <p className="truncate font-semibold text-foreground">{pickup}</p>
                      <p className="truncate font-semibold text-foreground">{destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">{effectiveKm} km</p>
                      <p className="text-base font-black text-primary">{formatIDR(total)}</p>
                    </div>
                  </div>

                  {/* actions */}
                  {stage === "assigned" ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStage("arrived")}
                        className="rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground tap-scale"
                      >
                        Simulasi: Driver Tiba
                      </button>
                      <button
                        onClick={() => { toast.success("Pesanan dibatalkan"); close_(); }}
                        className="rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive tap-scale"
                      >
                        Batalkan
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={finishOrder}
                      className="mt-3 w-full rounded-2xl bg-broo-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
                    >
                      Selesaikan & Beri Rating
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            /* ============ FORM STAGE — SINGLE STEP (location + payment + confirm) ============ */
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={stage === "form" ? "max-h-[94%] overflow-y-auto broo-scrollbar rounded-t-[2rem] bg-background shadow-2xl" : ""}
            >
              <AnimatePresence mode="wait">
                {/* ===== FORM ===== */}
                {stage === "form" && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* header */}
                    <div className="relative bg-broo-header-gradient px-5 pb-5 pt-3 text-white">
                      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/40" />
                      <div className="flex items-center gap-3">
                        <ServiceIcon icon={service.icon} gradient={service.color} size={44} serviceId={selectedService} />
                        <div className="flex-1">
                          <h3 className="text-lg font-black">{service.name}</h3>
                          <p className="text-xs text-white/85">{service.tagline}</p>
                        </div>
                        <button
                          onClick={close_}
                          className="grid h-9 w-9 place-items-center rounded-full bg-white/20 tap-scale"
                          aria-label="Tutup"
                        >
                          <BrooIcon name="X" className="h-4 w-4" />
                        </button>
                      </div>

                      {/* order type toggle */}
                      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-white/15 p-1 backdrop-blur">
                        {(["now", "booking"] as OrderType[]).map((t) => {
                          const active = orderType === t;
                          return (
                            <button
                              key={t}
                              onClick={() => setOrderType(t)}
                              className="relative overflow-hidden rounded-xl py-2 text-sm font-bold tap-scale"
                            >
                              {active && (
                                <motion.span
                                  layoutId="loc-otype-wave"
                                  className="pointer-events-none absolute inset-0 rounded-xl bg-white shadow"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                              <span className={`relative z-10 inline-flex items-center gap-1.5 ${active ? "text-primary" : "text-white"}`}>
                                <BrooIcon name={t === "now" ? "Zap" : "CalendarClock"} className="h-4 w-4" />
                                {t === "now" ? "Sekarang" : "Booking"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      {/* locations */}
                      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-broo">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center pt-2">
                            <span className="h-2.5 w-2.5 rounded-full border-2 border-primary" />
                            <span className="my-1 h-8 w-0.5 border-l border-dashed border-border" />
                            <BrooIcon name="MapPin" className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                                Lokasi Jemput
                              </label>
                              <input
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                                placeholder="Lokasi kamu sekarang"
                              />
                            </div>
                            <div className="h-px bg-border" />
                            <div>
                              <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                                Tujuan
                              </label>
                              <input
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                                placeholder="Mau ke mana?"
                                autoFocus
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => { setPickup(destination); setDestination(pickup); }}
                            className="grid h-8 w-8 place-items-center self-center rounded-full bg-secondary text-foreground/70 tap-scale"
                            aria-label="Tukar lokasi"
                          >
                            <BrooIcon name="ChevronDown" className="h-4 w-4 rotate-180" />
                          </button>
                        </div>
                      </div>

                      {/* booking schedule */}
                      {orderType === "booking" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground/70">Tanggal</label>
                            <input
                              type="date"
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground/70">Jam</label>
                            <input
                              type="time"
                              value={bookingTime}
                              onChange={(e) => setBookingTime(e.target.value)}
                              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* quick pick destinations */}
                      {!destination && (
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                            <BrooIcon name="MapPin" className="h-3.5 w-3.5 text-primary" />
                            Pilih cepat
                          </p>
                          {SAVED_PLACES.slice(0, 4).map((p) => (
                            <button
                              key={p.name}
                              onClick={() => { setDestination(`${p.name} — ${p.address}`); setKm(p.km); }}
                              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left tap-scale"
                            >
                              <BrooIcon name="MapPin" className="h-4 w-4 text-primary" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{p.name}</p>
                                <p className="truncate text-[11px] text-muted-foreground">{p.address}</p>
                              </div>
                              <span className="text-[11px] font-bold text-foreground">{p.km} km</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* detail depending on service */}
                      {service.category === "food" && (
                        <div className="rounded-2xl border border-border bg-card p-3.5">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70">
                            <BrooIcon name="UtensilsCrossed" className="h-3.5 w-3.5 text-primary" />
                            Detail Makanan / Resto
                          </label>
                          <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: 2x nasi goreng dari Warteg Bu Tini"
                            className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                          />
                        </div>
                      )}
                      {service.category === "errand" && (
                        <div className="rounded-2xl border border-border bg-card p-3.5">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70">
                            <BrooIcon name="ShoppingBag" className="h-3.5 w-3.5 text-primary" />
                            Detail Pesanan / Barang
                          </label>
                          <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: Beli obat dari apotek K24"
                            className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                          />
                        </div>
                      )}

                      {/* payment */}
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                          <BrooIcon name="Wallet" className="h-3.5 w-3.5 text-primary" />
                          Metode Pembayaran
                        </p>
                        <div className="space-y-1.5">
                          {PAYMENT_METHODS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setPayment(m.id)}
                              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left tap-scale ${
                                payment === m.id ? "border-primary bg-primary/5" : "border-border bg-card"
                              }`}
                            >
                              <div className={`grid h-9 w-9 place-items-center rounded-xl ${payment === m.id ? "bg-broo-gradient text-white" : "bg-secondary text-foreground/70"}`}>
                                <BrooIcon name={m.icon} className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">{m.label}</p>
                                <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                              </div>
                              <span className={`grid h-5 w-5 place-items-center rounded-full border ${payment === m.id ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                                {payment === m.id && <BrooIcon name="Check" className="h-3 w-3" />}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* price */}
                      {destination && (
                        <div className="rounded-2xl bg-secondary/60 p-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Estimasi jarak</span>
                            <span className="text-sm font-bold text-foreground">{effectiveKm} km</span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Tarif (tanpa potongan)</span>
                            <span className="text-lg font-black text-primary">{formatIDR(total)}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Komisi Broo</span>
                            <span className="text-sm font-bold text-emerald-600">Rp 0</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={confirm}
                        disabled={!canConfirm}
                        className="w-full rounded-2xl bg-broo-gradient py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-50 tap-scale"
                      >
                        {orderType === "now"
                          ? `Pesan ${service.name} • ${destination ? formatIDR(total) : "Pilih tujuan"}`
                          : `Jadwalkan Booking • ${destination ? formatIDR(total) : "Pilih tujuan"}`}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ===== SEARCHING ===== */}
                {(stage === "confirming" || stage === "searching") && (
                  <motion.div
                    key="searching"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center px-8 py-20 text-center"
                  >
                    <div className="relative grid h-24 w-24 place-items-center">
                      <span className="absolute inset-0 rounded-full bg-primary/15 broo-pulse-ring" />
                      <span className="absolute inset-3 rounded-full bg-primary/25 broo-pulse-ring" style={{ animationDelay: "0.6s" }} />
                      <ServiceIcon icon={service.icon} gradient={service.color} size={56} serviceId={selectedService} />
                    </div>
                    <h3 className="mt-6 text-lg font-black">
                      {stage === "confirming" ? "Memproses pesanan…" : "Mencari driver terdekat…"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Broo menghubungkanmu dengan driver terbaik tanpa potongan biaya.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
