"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBroo, cartCount } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { MERCHANTS, MERCHANT_CATEGORIES, formatIDR } from "@/lib/broo-data";

export default function MerchantListOverlay() {
  const closeModal = useBroo((s) => s.closeModal);
  const openMerchant = useBroo((s) => s.openMerchant);
  const cart = useBroo((s) => s.cart);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const filtered = MERCHANTS.filter((m) => {
    const catOk = cat === "all" ? true : m.tags.includes(cat);
    const qOk = q.trim()
      ? (m.name + m.category).toLowerCase().includes(q.toLowerCase())
      : true;
    return catOk && qOk;
  });

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="absolute inset-0 z-[72] flex h-full w-full flex-col bg-broo-soft-warm"
    >
      {/* header */}
      <header className="relative bg-broo-header-gradient px-5 pb-5 pt-6 text-white safe-top">
        <button
          onClick={closeModal}
          aria-label="Kembali"
          className="absolute left-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur tap-scale"
        >
          <BrooIcon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-orange-200">
            <span>🍜</span> MAKANBRO
          </div>
          <h1 className="mt-1 text-xl font-black">Kedai & UMKM Terdaftar</h1>
          <p className="text-xs text-white/75">Pesan makanan tanpa markup harga</p>
        </div>

        {/* search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-black/10">
          <BrooIcon name="Search" className="h-4 w-4 text-primary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kedai atau makanan…"
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-3">
        {MERCHANT_CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="flex shrink-0 flex-col items-center gap-1 tap-scale"
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-2xl ${
                  active
                    ? "bg-broo-gradient text-white shadow-broo-primary"
                    : "bg-card border border-border text-foreground/70"
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

      {/* merchant list */}
      <div className="flex-1 overflow-y-auto broo-scrollbar px-5 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground">
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
              className="block w-full overflow-hidden rounded-3xl border border-border bg-broo-card-gradient text-left shadow-broo tap-scale"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <Image src={m.cover} alt={m.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {m.promo && (
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    <BrooIcon name="Tag" className="h-3 w-3" />
                    {m.promo}
                  </span>
                )}
                <div className="absolute -bottom-5 left-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${m.logoColor} text-base font-black text-white shadow-broo ring-2 ring-card`}>
                    {m.name[0]}
                  </div>
                </div>
              </div>
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
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <BrooIcon name="BadgeCheck" className="h-3 w-3" />
                    Halal
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* floating cart bar */}
      {cart.length > 0 && (
        <div className="border-t border-border bg-card p-3 safe-bottom">
          <button
            onClick={closeModal}
            className="flex w-full items-center gap-3 rounded-2xl bg-broo-gradient p-3 text-white shadow-broo-primary tap-scale"
          >
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/20">
              <BrooIcon name="ShoppingBag" className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-primary">
                {cartCount(cart)}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[11px] text-white/80">{cartCount(cart)} item di keranjang</p>
              <p className="text-sm font-black">{formatIDR(cart.reduce((a, c) => a + c.qty * c.item.price, 0))}</p>
            </div>
            <span className="text-xs font-bold">Lihat Keranjang</span>
            <BrooIcon name="ChevronRight" className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
