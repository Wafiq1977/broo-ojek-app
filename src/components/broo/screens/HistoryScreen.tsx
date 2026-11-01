"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";
import { SERVICE_MAP, formatIDR } from "@/lib/broo-data";
import { toast } from "sonner";

const SERVICE_IMG: Record<string, string> = {
  MotorBro: "/icons/motor.png",
  MobilBro: "/icons/mobil.png",
  MakanBro: "/icons/makanan.png",
  TitipBro: "/icons/jastip.png",
  TolongBro: "/icons/tolong.png",
};

interface Order {
  id: string;
  service: string;
  pickup: string;
  destination: string;
  price: number;
  fee: number;
  status: string;
  rating: number | null;
  paymentMethod: string;
  driverName: string | null;
  vehicleType: string | null;
  distanceKm: number;
  createdAt: string;
  kind?: "ride" | "food";
  merchantName?: string;
}

export default function HistoryScreen() {
  const user = useBroo((s) => s.user);
  const nonce = useBroo((s) => s.historyNonce);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all");
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [rideRes, foodRes] = await Promise.all([
        fetch(`/api/broo/orders?userId=${user.id}`),
        fetch(`/api/broo/food-orders?userId=${user.id}`),
      ]);
      const rideData = await rideRes.json();
      const foodData = await foodRes.json();
      const rides: Order[] = (rideData.ok ? rideData.orders : []).map((o: Order) => ({ ...o, kind: "ride" as const }));
      const foods: Order[] = (foodData.ok ? foodData.orders : []).map((o: { id: string; merchantName: string; total: number; status: string; createdAt: string; driverName: string | null }) => ({
        id: o.id,
        service: "MakanBro",
        pickup: o.merchantName,
        destination: "Antar ke lokasimu",
        price: o.total,
        fee: 0,
        status: o.status,
        rating: null,
        paymentMethod: "cash",
        driverName: o.driverName,
        vehicleType: "motor",
        distanceKm: 0,
        createdAt: o.createdAt,
        kind: "food" as const,
        merchantName: o.merchantName,
      }));
      const merged = [...rides, ...foods].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(merged);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, nonce]);

  const filtered = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  const rate = (o: Order) => {
    setRatingStars(5);
    setRatingOrderId(o.id);
  };

  const submitRating = async () => {
    if (!ratingOrderId) return;
    const oid = ratingOrderId;
    try {
      // try ride orders first, then food orders
      await fetch("/api/broo/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: oid, rating: ratingStars }),
      });
      // also try food order endpoint
      await fetch("/api/broo/food-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: oid, rating: ratingStars }),
      });
      toast.success(`Terima kasih! Rating ${ratingStars} ⭐ terkirim`);
      setRatingOrderId(null);
      load();
    } catch {
      toast.error("Gagal mengirim rating");
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const total = orders
    .filter((o) => o.status === "completed")
    .reduce((a, b) => a + b.price, 0);

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft-warm">
      <header className="sticky top-0 z-10 bg-broo-header-gradient px-5 pb-4 pt-6 text-white safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Riwayat</h1>
            <p className="text-xs text-white/75">Perjalanan & transaksimu</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur ring-1 ring-white/30">
            <BrooIcon name="ReceiptText" className="h-5 w-5" />
          </div>
        </div>

        {orders.length > 0 && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-broo-gradient p-3.5 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
              <BrooIcon name="ReceiptText" className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/80">Total belanja perjalanan</p>
              <p className="text-base font-black">{formatIDR(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/80">Hemat</p>
              <p className="text-sm font-black text-emerald-200">
                {formatIDR(Math.round(total * 0.15))}
              </p>
            </div>
          </div>
        )}
      </header>

      {orders.length > 0 && (
        <div className="flex gap-1.5 px-5 pt-3">
          {(["all", "completed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold tap-scale ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {f === "all" ? "Semua" : f === "completed" ? "Selesai" : "Dibatalkan"}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 px-5 pt-3 pb-8">
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl broo-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="ReceiptText"
            title="Belum ada riwayat"
            desc="Perjalanan pertamamu dengan Broo akan muncul di sini. Yuk pesan sekarang!"
            cta
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((o) => {
              const done = o.status === "completed";
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0">
                      <Image
                        src={SERVICE_IMG[o.service] || "/icons/motor.png"}
                        alt={o.service}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{o.service}</p>
                        <OrderStatus status={o.status} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {fmt(o.createdAt)}{o.kind === "ride" ? ` • ${o.distanceKm} km` : " • Makanan"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-foreground">{formatIDR(o.price)}</p>
                  </div>

                  <div className="mt-2.5 rounded-xl bg-secondary/40 p-2.5 text-[11px]">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="truncate">
                        {o.kind === "food" ? o.pickup : o.pickup}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                      <BrooIcon name="MapPin" className="h-3 w-3 text-primary" />
                      <span className="truncate">{o.destination}</span>
                    </p>
                  </div>

                  {done && o.driverName && (
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-broo-gradient text-[10px] font-black text-white">
                          {o.driverName[0]}
                        </div>
                        {o.driverName}
                      </div>
                      {!o.rating ? (
                        <button
                          onClick={() => rate(o)}
                          className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary tap-scale"
                        >
                          Beri Rating
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                          <BrooIcon name="Star" className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {o.rating}
                        </span>
                      )}
                    </div>
                  )}

                  {done && (
                    <div className="mt-2 flex items-center gap-2 border-t border-border pt-2 text-[10px] text-emerald-600">
                      <BrooIcon name="CheckCircle2" className="h-3.5 w-3.5" />
                      0% komisi Broo — 100% untuk driver
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating modal — realtime star picker */}
      <AnimatePresence>
        {ratingOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRatingOrderId(null)}
            className="absolute inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px] rounded-3xl bg-card p-6 text-center shadow-2xl"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-broo-gradient text-white">
                <BrooIcon name="Star" className="h-7 w-7 fill-white" />
              </div>
              <h3 className="mt-3 text-lg font-black text-foreground">Beri Rating</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Bagaimana pengalaman perjalananmu?
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRatingStars(n)}
                    className="tap-scale"
                    aria-label={`Rating ${n} bintang`}
                  >
                    <motion.span
                      animate={{ scale: n <= ratingStars ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <BrooIcon
                        name="Star"
                        className={`h-9 w-9 transition-colors ${
                          n <= ratingStars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-muted-foreground/40"
                        }`}
                      />
                    </motion.span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setRatingOrderId(null)}
                  className="flex-1 rounded-2xl border border-border bg-secondary py-3 text-sm font-semibold text-foreground tap-scale"
                >
                  Batal
                </button>
                <button
                  onClick={submitRating}
                  className="flex-[2] rounded-2xl bg-broo-gradient py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
                >
                  Kirim Rating {ratingStars} ⭐
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: "Selesai", cls: "bg-emerald-500/15 text-emerald-600" },
    ongoing: { label: "Berjalan", cls: "bg-blue-500/15 text-blue-600" },
    searching: { label: "Mencari", cls: "bg-amber-500/15 text-amber-600" },
    cancelled: { label: "Batal", cls: "bg-destructive/10 text-destructive" },
  };
  const m = map[status] || { label: status, cls: "bg-secondary text-muted-foreground" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.cls}`}>
      {m.label}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  cta,
}: {
  icon: string;
  title: string;
  desc: string;
  cta?: boolean;
}) {
  const setTab = useBroo((s) => s.setTab);
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <BrooIcon name={icon} className="h-8 w-8" />
      </div>
      <p className="mt-3 text-sm font-black text-foreground">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">{desc}</p>
      {cta && (
        <button
          onClick={() => setTab("home")}
          className="mt-4 rounded-full bg-broo-gradient px-5 py-2 text-xs font-bold text-white shadow-lg shadow-primary/30 tap-scale"
        >
          Pesan Sekarang
        </button>
      )}
    </div>
  );
}
