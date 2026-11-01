"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { ServiceIcon } from "./ServiceIcon";
import BrooMap from "./BrooMap";
import {
  SERVICE_MAP,
  SAVED_PLACES,
  QUICK_LOCATIONS,
  PAYMENT_METHODS,
  formatIDR,
  priceOf,
  type OrderType,
} from "@/lib/broo-data";
import { toast } from "sonner";

type Stage = "form" | "search-pickup" | "search-dest" | "confirming" | "searching" | "assigned" | "arrived" | "done";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  short: string;
  lat: number;
  lng: number;
}

// TitipBro options
const TITIP_OPTIONS = [
  "Belanja Minimarket", "Belanja Apotek", "Belanja Kelontong",
  "Antar Dokumen", "Antar Paket", "Jemput Barang",
  "Beli Pulsa/Token", "Beli Tiket", "Cuci Motor", "Lainnya",
];

const TOLONG_OPTIONS = [
  "Antar Dokumen", "Jemput Anak/Sekolah", "Bantu Pindah Barang",
  "Beli Obat/Apotek", "Perbaikan Ringan", "Cek Rumah/Kantor",
  "Kirim Lamaran", "Antri Loket", "Lainnya",
];

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
    name: string; plate: string; vehicle: string; vehicleType: string; rating: number; orderId?: string;
  } | null>(null);

  // search state
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedService = draft?.service || "MotorBro";
  const service = SERVICE_MAP[selectedService];

  // dynamic labels per service
  const isRide = selectedService === "MotorBro" || selectedService === "MobilBro";
  const pickupLabel =
    selectedService === "TitipBro" ? "Lokasi Pengantaran"
    : selectedService === "TolongBro" ? "Lokasi Pertolongan"
    : selectedService === "MakanBro" ? "Lokasi Kamu"
    : "Lokasi Jemput";
  const destLabel =
    selectedService === "TitipBro" ? "Titip Apa?"
    : selectedService === "TolongBro" ? "Untuk Apa?"
    : selectedService === "MakanBro" ? "Lokasi Antar"
    : "Tujuan";

  // search function (debounced)
  const doSearch = (q: string) => {
    setSearchQ(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/broo/search-loc?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.ok) setSearchResults(data.results);
      } catch {
        /* ignore */
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  // compute km from 2 latlng (haversine)
  const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(x));
  };

  // default pickup: Bojonegoro center
  const PICKUP_COORD = { lat: -7.15, lng: 111.8817 };

  const pickSearchResult = (r: SearchResult) => {
    const km_ = haversine(PICKUP_COORD, { lat: r.lat, lng: r.lng });
    if (stage === "search-pickup") {
      setPickup(r.short);
      setStage("form");
    } else {
      setDestination(r.short);
      setKm(Math.max(0.5, Math.round(km_ * 10) / 10));
      setStage("form");
    }
    setSearchQ("");
    setSearchResults([]);
  };

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
            name: o.driverName, plate: "B 4521 KXP",
            vehicle: o.vehicleType === "mobil" ? "Toyota Avanza" : "Honda Beat",
            vehicleType: o.vehicleType, rating: 4.9, orderId: o.id,
          });
          setStage("searching");
          setTimeout(() => setStage("assigned"), 2200);
        } else {
          setStage("searching");
          setTimeout(() => setStage("assigned"), 2600);
          setAssigned({
            name: "Driver Broo", plate: "—",
            vehicle: service.id === "MobilBro" ? "Mobil" : "Motor",
            vehicleType: service.id === "MobilBro" ? "mobil" : "motor",
            rating: 4.9, orderId: o.id,
          });
        }
      } else {
        const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
        const res = await fetch("/api/broo/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id, service: selectedService, pickup, destination,
            km: effectiveKm, scheduledAt,
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
    // delete associated chat conversation when order completes
    if (assigned?.orderId) {
      // best-effort delete — fire and forget
      fetch("/api/broo/chats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: assigned.orderId, driverName: assigned.name }),
      }).catch(() => {});
    }
    useBroo.getState().bumpChat();
    useBroo.setState({ orderMinimized: false });
    clearDraft();
    setStage("form");
    setAssigned(null);
  };

  function close_() {
    clearDraft();
    setStage("form");
    setAssigned(null);
  }

  const isTracking = stage === "assigned" || stage === "arrived" || stage === "done";

  // ============ SEARCH SCREEN ============
  if (stage === "search-pickup" || stage === "search-dest") {
    const isPickup = stage === "search-pickup";
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="absolute inset-0 z-[85] flex h-full flex-col bg-background"
      >
        <header className="flex items-center gap-2 border-b border-border bg-card px-4 pb-3 pt-5 safe-top">
          <button onClick={() => setStage("form")} aria-label="Kembali" className="grid h-9 w-9 place-items-center rounded-full border border-border tap-scale">
            <BrooIcon name="ChevronLeft" className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
            <BrooIcon name="Search" className="h-4 w-4 text-primary" />
            <input
              value={searchQ}
              onChange={(e) => doSearch(e.target.value)}
              autoFocus
              placeholder={`Cari ${isPickup ? pickupLabel.toLowerCase() : destLabel.toLowerCase()}…`}
              className="flex-1 bg-transparent text-sm outline-none"
            />
            {searching && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            )}
          </div>
        </header>

        {/* mini map showing search area */}
        <div className="relative h-40 w-full overflow-hidden border-b border-border">
          <BrooMap stage="form" vehicleType="motor" className="h-full w-full" />
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
            Bojonegoro • Cari lokasi
          </div>
        </div>

        <div className="flex-1 overflow-y-auto broo-scrollbar px-4 py-3">
          {/* quick locations */}
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground/70">
            <BrooIcon name="MapPin" className="h-3.5 w-3.5 text-primary" />
            Lokasi Populer
          </p>
          <div className="space-y-1.5">
            {(isPickup ? QUICK_LOCATIONS : SAVED_PLACES).slice(0, 6).map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  if (isPickup) {
                    setPickup(p.name);
                  } else {
                    setDestination(p.name);
                    setKm("km" in p ? p.km : 2);
                  }
                  setSearchQ("");
                  setSearchResults([]);
                  setStage("form");
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left tap-scale"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BrooIcon name="MapPin" className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{"address" in p ? p.address : p.name}</p>
                </div>
                {"km" in p && <span className="text-[11px] font-bold text-foreground">{p.km} km</span>}
              </button>
            ))}
          </div>

          {/* search results */}
          {searchResults.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-xs font-bold text-foreground/70">Hasil Pencarian</p>
              <div className="space-y-1.5">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => pickSearchResult(r)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left tap-scale"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <BrooIcon name="Navigation" className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{r.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{r.address}</p>
                    </div>
                    <BrooIcon name="ChevronRight" className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // ============ MAIN ============
  return (
    <AnimatePresence>
      {draft && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[80] flex flex-col bg-background"
        >
          {/* ============ TRACKING: FULLSCREEN MAP ============ */}
          {isTracking && assigned ? (
            <>
              <div className="absolute inset-0">
                <BrooMap stage={stage} vehicleType={assigned.vehicleType as "motor" | "mobil"} className="h-full w-full" />
              </div>
              <div className="absolute left-4 right-4 top-4 z-10 flex items-center gap-3 safe-top">
                <button onClick={() => useBroo.getState().minimizeOrder()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card shadow-broo tap-scale" aria-label="Minimize">
                  <BrooIcon name="ChevronDown" className="h-5 w-5" />
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
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.2 }}
                className="absolute inset-x-0 bottom-0 z-10 rounded-t-[2rem] bg-background shadow-broo-lg safe-bottom"
              >
                <div className="mx-auto mt-3 mb-2 h-1.5 w-10 rounded-full bg-border" />
                <div className="px-5 pb-5 pt-1">
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
                      <p className="text-xs text-muted-foreground">{assigned.vehicle} • {assigned.plate}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-foreground">
                        <BrooIcon name="Star" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {assigned.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openChat({ conversationId: "", driverName: assigned.name, service: service.name })} className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary tap-scale" aria-label="Chat">
                        <BrooIcon name="MessageCircle" className="h-5 w-5" />
                      </button>
                      <button onClick={() => toast.info("Menghubungkan panggilan…")} className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-emerald-600 tap-scale" aria-label="Telepon">
                        <BrooIcon name="Phone" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
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
                  {stage === "assigned" ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => setStage("arrived")} className="rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground tap-scale">
                        Simulasi: Driver Tiba
                      </button>
                      <button onClick={() => { toast.success("Pesanan dibatalkan"); close_(); }} className="rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive tap-scale">
                        Batalkan
                      </button>
                    </div>
                  ) : (
                    <button onClick={finishOrder} className="mt-3 w-full rounded-2xl bg-broo-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale">
                      Selesaikan & Beri Rating
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            /* ============ FORM STAGE ============ */
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={stage === "form" || stage === "confirming" ? "max-h-[94%] overflow-y-auto broo-scrollbar rounded-t-[2rem] bg-background shadow-2xl" : ""}
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
                        <button onClick={close_} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 tap-scale" aria-label="Tutup">
                          <BrooIcon name="X" className="h-4 w-4" />
                        </button>
                      </div>

                      {/* order type toggle */}
                      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-white/15 p-1 backdrop-blur">
                        {(["now", "booking"] as OrderType[]).map((t) => {
                          const active = orderType === t;
                          return (
                            <button key={t} onClick={() => setOrderType(t)} className="relative overflow-hidden rounded-xl py-2 text-sm font-bold tap-scale">
                              {active && (
                                <motion.span layoutId="loc-otype-wave" className="pointer-events-none absolute inset-0 rounded-xl bg-white shadow" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
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
                      {/* locations — dynamic labels per service */}
                      <div className="rounded-2xl border border-border bg-card p-3.5 shadow-broo">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center pt-2">
                            <span className="h-2.5 w-2.5 rounded-full border-2 border-primary" />
                            <span className="my-1 h-8 w-0.5 border-l border-dashed border-border" />
                            <BrooIcon name="MapPin" className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            {/* Pickup */}
                            <button onClick={() => setStage("search-pickup")} className="w-full text-left">
                              <label className="text-[10px] font-semibold uppercase text-muted-foreground">{pickupLabel}</label>
                              <div className="flex items-center justify-between">
                                <span className="flex-1 truncate text-sm font-semibold text-foreground">{pickup}</span>
                                <BrooIcon name="Search" className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            </button>
                            <div className="h-px bg-border" />
                            {/* Destination */}
                            {isRide ? (
                              <button onClick={() => setStage("search-dest")} className="w-full text-left">
                                <label className="text-[10px] font-semibold uppercase text-muted-foreground">{destLabel}</label>
                                <div className="flex items-center justify-between">
                                  <span className="flex-1 truncate text-sm font-semibold text-foreground">{destination || "Cari lokasi tujuan…"}</span>
                                  <BrooIcon name="Search" className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              </button>
                            ) : (
                              <div>
                                <label className="text-[10px] font-semibold uppercase text-muted-foreground">{destLabel}</label>
                                <input
                                  value={destination}
                                  onChange={(e) => setDestination(e.target.value)}
                                  className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                                  placeholder={
                                    selectedService === "TitipBro" ? "Mis. Belanja minimarket…" :
                                    selectedService === "TolongBro" ? "Mis. Antar dokumen…" :
                                    "Detail pesanan…"
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* TitipBro options */}
                      {selectedService === "TitipBro" && (
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                            <BrooIcon name="ShoppingBag" className="h-3.5 w-3.5 text-primary" />
                            Pilih Jenis Titipan
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {TITIP_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setDestination(opt)}
                                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold tap-scale ${
                                  destination === opt ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground/70"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TolongBro options */}
                      {selectedService === "TolongBro" && (
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                            <BrooIcon name="LifeBuoy" className="h-3.5 w-3.5 text-primary" />
                            Pilih Jenis Bantuan
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {TOLONG_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setDestination(opt)}
                                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold tap-scale ${
                                  destination === opt ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground/70"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Catatan field — for TitipBro, TolongBro, MakanBro */}
                      {(selectedService === "TitipBro" || selectedService === "TolongBro" || selectedService === "MakanBro") && (
                        <div className="rounded-2xl border border-border bg-card p-3.5">
                          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70">
                            <BrooIcon name="FileText" className="h-3.5 w-3.5 text-primary" />
                            Catatan untuk Driver
                          </label>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder={
                              selectedService === "TitipBro" ? "Mis. Beli 2kg gula, 1 bungkus teh…" :
                              selectedService === "TolongBro" ? "Detail bantuan yang dibutuhkan…" :
                              "Mis. Tanpa es, level pedas sedang…"
                            }
                            className="w-full resize-none bg-transparent text-sm font-medium text-foreground outline-none"
                          />
                        </div>
                      )}

                      {/* booking schedule */}
                      {orderType === "booking" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground/70">Tanggal</label>
                            <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none" />
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-foreground/70">Jam</label>
                            <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none" />
                          </div>
                        </motion.div>
                      )}

                      {/* quick pick destinations (ride services) */}
                      {isRide && !destination && (
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                            <BrooIcon name="MapPin" className="h-3.5 w-3.5 text-primary" />
                            Pilih cepat
                          </p>
                          {SAVED_PLACES.slice(0, 4).map((p) => (
                            <button key={p.name} onClick={() => { setDestination(p.name); setKm(p.km); }} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left tap-scale">
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

                      {/* payment */}
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                          <BrooIcon name="Wallet" className="h-3.5 w-3.5 text-primary" />
                          Metode Pembayaran
                        </p>
                        <div className="space-y-1.5">
                          {PAYMENT_METHODS.map((m) => (
                            <button key={m.id} onClick={() => setPayment(m.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left tap-scale ${payment === m.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
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

                      <button onClick={confirm} disabled={!canConfirm} className="w-full rounded-2xl bg-broo-gradient py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-50 tap-scale">
                        {orderType === "now"
                          ? `Pesan ${service.name} • ${destination ? formatIDR(total) : "Pilih tujuan"}`
                          : `Jadwalkan Booking • ${destination ? formatIDR(total) : "Pilih tujuan"}`}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ===== SEARCHING ===== */}
                {(stage === "confirming" || stage === "searching") && (
                  <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center px-8 py-20 text-center">
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
