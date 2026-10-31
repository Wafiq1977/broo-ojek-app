"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";
import { SERVICE_MAP, formatIDR } from "@/lib/broo-data";
import { toast } from "sonner";

interface Booking {
  id: string;
  service: string;
  pickup: string;
  destination: string;
  price: number;
  scheduledAt: string;
  status: string;
}

export default function BookingScreen() {
  const user = useBroo((s) => s.user);
  const nonce = useBroo((s) => s.historyNonce);
  const startDraft = useBroo((s) => s.startDraft);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/broo/bookings?userId=${user.id}`);
      const data = await res.json();
      if (data.ok) setBookings(data.bookings);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id, nonce]);

  const cancel = async (id: string) => {
    try {
      const res = await fetch("/api/broo/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Booking dibatalkan");
        load();
      }
    } catch {
      toast.error("Gagal membatalkan");
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft">
      <header className="sticky top-0 z-10 bg-card/95 px-5 pb-3 pt-6 backdrop-blur safe-top">
        <h1 className="text-xl font-black text-foreground">Booking</h1>
        <p className="text-xs text-muted-foreground">
          Jadwalkan perjalananmu untuk nanti
        </p>
      </header>

      <div className="px-5 pt-3">
        <button
          onClick={() =>
            startDraft({
              service: "MotorBro",
              orderType: "booking",
              pickup: "Lokasi kamu sekarang",
              destination: "",
              km: 0,
              paymentMethod: "cash",
            })
          }
          className="flex w-full items-center gap-3 rounded-2xl bg-broo-gradient p-4 text-left text-white shadow-lg shadow-primary/30 tap-scale"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <BrooIcon name="CalendarClock" className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Buat Booking Baru</p>
            <p className="text-[11px] text-white/80">
              Pesan jadwal untuk MotorBro, MobilBro & lainnya
            </p>
          </div>
          <BrooIcon name="ChevronRight" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 px-5 pt-4 pb-8">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground">Booking Aktif</h2>
          {bookings.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {bookings.filter((b) => b.status === "scheduled").length} terjadwal
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl broo-shimmer" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="CalendarClock"
            title="Belum ada booking"
            desc="Jadwalkan perjalanan agar lebih tenang. Driver Broo akan menjemput tepat waktu."
          />
        ) : (
          <div className="space-y-2.5">
            {bookings.map((b) => {
              const s = SERVICE_MAP[b.service as keyof typeof SERVICE_MAP];
              const cancelled = b.status === "cancelled";
              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border bg-card p-3.5 ${
                    cancelled ? "border-border opacity-60" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s?.color} text-white`}>
                      <BrooIcon name={s?.icon || "Car"} className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{b.service}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <BrooIcon name="Clock" className="h-3 w-3" />
                        {fmt(b.scheduledAt)}
                      </p>
                    </div>
                    <p className="text-sm font-black text-primary">{formatIDR(b.price)}</p>
                  </div>
                  <div className="mt-2.5 rounded-xl bg-secondary/50 p-2.5 text-[11px]">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {b.pickup}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                      <BrooIcon name="MapPin" className="h-3 w-3 text-primary" />
                      {b.destination}
                    </p>
                  </div>
                  {b.status === "scheduled" && (
                    <button
                      onClick={() => cancel(b.id)}
                      className="mt-2.5 w-full rounded-xl border border-destructive/30 bg-destructive/5 py-2 text-xs font-semibold text-destructive tap-scale"
                    >
                      Batalkan Booking
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    scheduled: { label: "Terjadwal", cls: "bg-amber-500/15 text-amber-600" },
    active: { label: "Aktif", cls: "bg-emerald-500/15 text-emerald-600" },
    done: { label: "Selesai", cls: "bg-secondary text-muted-foreground" },
    cancelled: { label: "Dibatalkan", cls: "bg-destructive/10 text-destructive" },
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
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <BrooIcon name={icon} className="h-8 w-8" />
      </div>
      <p className="mt-3 text-sm font-black text-foreground">{title}</p>
      <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
