"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBroo, cartCount } from "@/lib/store";
import { BrooIcon } from "../BrooIcon";
import { MERCHANTS, MERCHANT_CATEGORIES, formatIDR } from "@/lib/broo-data";
import { toast } from "sonner";

export default function FoodScreen() {
  const openMerchant = useBroo((s) => s.openMerchant);
  const cart = useBroo((s) => s.cart);
  const cartMerchantId = useBroo((s) => s.cartMerchantId);
  const setTab = useBroo((s) => s.setTab);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const filtered = MERCHANTS.filter((m) => {
    const catOk = cat === "all" ? true : m.tags.includes(cat);
    const qOk = q.trim() ? (m.name + m.category).toLowerCase().includes(q.toLowerCase()) : true;
    return catOk && qOk;
  });

  const banners = [
    { img: "/promo/promo-2.png", title: "MakanBro — Tanpa Markup Harga", sub: "Harga sama seperti di kedai", cta: "Pesan sekarang" },
    { img: "/promo/promo-1.png", title: "Gratis Ongkir s/d 3 km", sub: "Untuk kedai pilihan", cta: "Lihat kedai" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto broo-scrollbar bg-broo-soft">
      <header className="sticky top-0 z-20 bg-card/95 px-5 pb-3 pt-6 backdrop-blur safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-foreground">MakanBro</h1>
            <p className="text-xs text-muted-foreground">Pesan makanan dari kedai terdaftar</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[11px] font-bold text-emerald-600">
            <BrooIcon name="Percent" className="h-3.5 w-3.5" />
            0% markup
          </div>
        </div>

        {/* location */}
        <button className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-secondary/70 px-3.5 py-2.5 text-left tap-scale">
          <BrooIcon name="MapPin" className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">Antar ke</p>
            <p className="truncate text-xs font-bold text-foreground">Jl. Melati No. 12, Jakarta Selatan</p>
          </div>
          <BrooIcon name="ChevronDown" className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* search */}
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5">
          <BrooIcon name="Search" className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kedai atau makanan…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* promo banners carousel */}
      <section className="pt-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5">
          {banners.map((b, i) => (
            <div
              key={i}
              className="relative h-24 w-[80%] shrink-0 overflow-hidden rounded-2xl"
            >
              <Image src={b.img} alt={b.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-orange-300">
                  Promo
                </p>
                <p className="mt-0.5 text-sm font-black leading-tight text-white">{b.title}</p>
                <p className="text-[10px] text-white/80">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* categories */}
      <section className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MERCHANT_CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex shrink-0 flex-col items-center gap-1.5 tap-scale`}
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    active ? "bg-broo-gradient text-white shadow-md shadow-primary/30" : "bg-card border border-border text-foreground/70"
                  }`}
                >
                  <BrooIcon name={c.icon} className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* merchant list — GoFood style */}
      <section className="px-5 pt-5 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-black text-foreground">
            {cat === "all" ? "Rekomendasi untukmu" : MERCHANT_CATEGORIES.find((c) => c.id === cat)?.label}
          </h2>
          <span className="text-[11px] text-muted-foreground">{filtered.length} kedai</span>
        </div>

        <div className="space-y-3">
          {filtered.map((m) => (
            <motion.button
              key={m.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openMerchant(m)}
              className="block w-full overflow-hidden rounded-3xl border border-border bg-card text-left tap-scale"
            >
              {/* cover */}
              <div className="relative h-28 w-full overflow-hidden">
                <Image src={m.cover} alt={m.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {m.promo && (
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    <BrooIcon name="Tag" className="h-3 w-3" />
                    {m.promo}
                  </span>
                )}
                {/* logo */}
                <div className="absolute -bottom-5 left-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.logoColor} text-base font-black text-white shadow-lg ring-2 ring-card`}>
                    {m.name[0]}
                  </div>
                </div>
              </div>

              {/* info */}
              <div className="px-3 pb-3 pt-7">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-foreground">{m.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{m.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-1.5 py-0.5 text-[11px] font-bold text-foreground">
                    <BrooIcon name="Star" className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {m.rating.toFixed(1)}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BrooIcon name="Navigation" className="h-3 w-3" />
                    {m.distanceKm} km
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BrooIcon name="Clock" className="h-3 w-3" />
                    {m.eta}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BrooIcon name="BadgeCheck" className="h-3 w-3 text-emerald-600" />
                    Halal
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* floating cart bar */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 z-20 p-3">
          <button
            onClick={() => {
              const m = MERCHANTS.find((x) => x.id === cartMerchantId);
              if (m) openMerchant(m);
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-broo-gradient p-3 text-white shadow-2xl shadow-primary/40 tap-scale"
          >
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/20">
              <BrooIcon name="ShoppingBag" className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-primary">
                {cartCount(cart)}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[11px] text-white/80">{cartCount(cart)} item • Keranjang</p>
              <p className="text-sm font-black">
                {formatIDR(cart.reduce((a, c) => a + c.qty * c.item.price, 0))}
              </p>
            </div>
            <span className="text-xs font-bold">Lihat Keranjang</span>
            <BrooIcon name="ChevronRight" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
