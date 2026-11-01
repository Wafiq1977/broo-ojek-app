"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";
import { formatIDR } from "@/lib/broo-data";
import { toast } from "sonner";

interface AdminData {
  stats: {
    users: number;
    drivers: number;
    merchants: number;
    orders: number;
    foodOrders: number;
    driverApps: number;
    bookings: number;
    pendingApps: number;
    gmv: number;
  };
  pendingApps: Array<{
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleBrand: string;
    plate: string;
    city: string;
    channel: string;
    status: string;
    createdAt: string;
  }>;
  recentOrders: Array<{ id: string; service: string; price: number; status: string; createdAt: string; driverName: string | null }>;
  recentFoodOrders: Array<{ id: string; merchantName: string; total: number; status: string; createdAt: string; driverName: string | null }>;
  allMerchants: Array<{ id: string; name: string; category: string; rating: number; status: string }>;
  allDrivers: Array<{ id: string; name: string; vehicleType: string; plate: string; rating: number; totalOrders: number; status: string }>;
}

export default function AdminScreen() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "drivers" | "merchants" | "orders">("overview");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/broo/admin");
      const d = await res.json();
      if (d.ok) setData(d);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decideApp = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/broo/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = await res.json();
      if (d.ok) {
        toast.success(status === "approved" ? "Driver disetujui ✅" : "Pendaftaran ditolak");
        load();
      }
    } catch {
      toast.error("Gagal memproses");
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-broo-soft">
        <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-primary/20">
          <span className="absolute h-16 w-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  const s = data.stats;

  const statsCards = [
    { label: "Total User", value: s.users, icon: "Users", color: "from-blue-500 to-indigo-600" },
    { label: "Driver Aktif", value: s.drivers, icon: "Bike", color: "from-orange-500 to-amber-600" },
    { label: "Kedai UMKM", value: s.merchants, icon: "Store", color: "from-emerald-500 to-teal-600" },
    { label: "Total Order", value: s.orders + s.foodOrders, icon: "ReceiptText", color: "from-violet-500 to-purple-600" },
    { label: "Booking", value: s.bookings, icon: "CalendarClock", color: "from-rose-500 to-pink-600" },
    { label: "Daftar Driver", value: s.pendingApps, icon: "UserPlus", color: "from-amber-500 to-yellow-600" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft">
      <header className="sticky top-0 z-20 bg-broo-dark-gradient px-5 pb-4 pt-6 text-white safe-top">
        <div className="flex items-center gap-2 text-[11px] font-bold text-orange-300">
          <BrooIcon name="ShieldCheck" className="h-4 w-4" />
          ADMIN PANEL BROO
        </div>
        <h1 className="mt-1 text-xl font-black">Dashboard Admin</h1>
        <p className="text-xs text-white/70">Kelola driver, kedai, & transaksi Broo</p>

        {/* GMV */}
        <div className="mt-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/70">Total Transaksi (GMV)</p>
              <p className="text-2xl font-black">{formatIDR(s.gmv)}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <BrooIcon name="TrendingUp" className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-300">
            <BrooIcon name="Percent" className="h-3 w-3" />
            0% komisi Broo — 100% untuk mitra
          </div>
        </div>
      </header>

      {/* stats grid */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {statsCards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-3 text-center">
              <div className={`mx-auto grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
                <BrooIcon name={c.icon} className="h-5 w-5" />
              </div>
              <p className="mt-1.5 text-lg font-black text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* tabs */}
      <section className="px-5 pt-4">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {([
            ["overview", "Ringkasan"],
            ["drivers", `Driver (${s.pendingApps})`],
            ["merchants", "Kedai"],
            ["orders", "Orderan"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold tap-scale ${
                tab === id ? "bg-primary text-primary-foreground shadow" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex-1 px-5 pt-4 pb-8">
        {tab === "overview" && (
          <div className="space-y-3">
            <Section title="Orderan Terbaru" icon="ReceiptText">
              {data.recentOrders.length === 0 && data.recentFoodOrders.length === 0 ? (
                <Empty text="Belum ada orderan" />
              ) : (
                <div className="space-y-2">
                  {data.recentOrders.slice(0, 4).map((o) => (
                    <Row key={o.id} left={o.service} mid={`${o.driverName || "—"} • ${formatIDR(o.price)}`} right={o.status} status={o.status} />
                  ))}
                  {data.recentFoodOrders.slice(0, 3).map((o) => (
                    <Row key={o.id} left={`MakanBro — ${o.merchantName}`} mid={formatIDR(o.total)} right={o.status} status={o.status} />
                  ))}
                </div>
              )}
            </Section>
            <Section title="Top Driver" icon="Bike">
              <div className="space-y-2">
                {data.allDrivers.slice(0, 5).map((d) => (
                  <Row
                    key={d.id}
                    left={d.name}
                    mid={`${d.vehicleType === "mobil" ? "Mobil" : "Motor"} • ${d.plate} • ${d.totalOrders} order`}
                    right={`⭐ ${d.rating.toFixed(1)}`}
                  />
                ))}
              </div>
            </Section>
          </div>
        )}

        {tab === "drivers" && (
          <Section title={`Pendaftar Driver Pending (${data.pendingApps.length})`} icon="UserPlus">
            {data.pendingApps.length === 0 ? (
              <Empty text="Tidak ada pendaftar pending" />
            ) : (
              <div className="space-y-2.5">
                {data.pendingApps.map((a) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border bg-card p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-broo-gradient text-sm font-black text-white">
                          {a.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{a.name}</p>
                          <p className="text-[11px] text-muted-foreground">{a.phone}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        Menunggu
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
                      <Info l="Kendaraan" v={`${a.vehicleType === "mobil" ? "Mobil" : "Motor"} • ${a.vehicleBrand}`} />
                      <Info l="Plat" v={a.plate} />
                      <Info l="Kota" v={a.city} />
                      <Info l="Kanal" v={a.channel === "admin" ? "Via Admin" : "Corporate"} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => decideApp(a.id, "rejected")}
                        className="rounded-xl border border-destructive/30 bg-destructive/5 py-2 text-xs font-bold text-destructive tap-scale"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => decideApp(a.id, "approved")}
                        className="rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white tap-scale"
                      >
                        Setujui Driver
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Section>
        )}

        {tab === "merchants" && (
          <Section title={`Kedai Terdaftar (${data.allMerchants.length})`} icon="Store">
            <div className="space-y-2">
              {data.allMerchants.map((m) => (
                <Row
                  key={m.id}
                  left={m.name}
                  mid={m.category}
                  right={`⭐ ${m.rating.toFixed(1)}`}
                  status={m.status}
                />
              ))}
            </div>
          </Section>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            <Section title="Orderan Ojek" icon="Bike">
              {data.recentOrders.length === 0 ? (
                <Empty text="Belum ada order ojek" />
              ) : (
                <div className="space-y-2">
                  {data.recentOrders.map((o) => (
                    <Row key={o.id} left={o.service} mid={formatIDR(o.price)} right={o.status} status={o.status} />
                  ))}
                </div>
              )}
            </Section>
            <Section title="Orderan Makanan" icon="UtensilsCrossed">
              {data.recentFoodOrders.length === 0 ? (
                <Empty text="Belum ada order makanan" />
              ) : (
                <div className="space-y-2">
                  {data.recentFoodOrders.map((o) => (
                    <Row key={o.id} left={o.merchantName} mid={formatIDR(o.total)} right={o.status} status={o.status} />
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <BrooIcon name={icon} className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-black text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-2 py-1">
      <p className="text-[9px] text-muted-foreground">{l}</p>
      <p className="truncate text-[11px] font-bold text-foreground">{v}</p>
    </div>
  );
}

function Row({ left, mid, right, status }: { left: string; mid: string; right: string; status?: string }) {
  const badge = status
    ? status === "completed" || status === "active"
      ? "bg-emerald-500/15 text-emerald-600"
      : status === "pending"
      ? "bg-amber-500/15 text-amber-600"
      : "bg-destructive/10 text-destructive"
    : "bg-secondary text-muted-foreground";
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{left}</p>
        <p className="truncate text-[11px] text-muted-foreground">{mid}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge}`}>
        {right}
      </span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 py-8 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}
