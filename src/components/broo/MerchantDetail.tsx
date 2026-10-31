"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBroo, cartCount, cartTotal } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { formatIDR, MERCHANTS } from "@/lib/broo-data";
import { toast } from "sonner";

export default function MerchantDetail() {
  const merchant = useBroo((s) => s.activeMerchant);
  const closeMerchant = useBroo((s) => s.closeMerchant);
  const cart = useBroo((s) => s.cart);
  const addToCart = useBroo((s) => s.addToCart);
  const decFromCart = useBroo((s) => s.decFromCart);
  const cartMerchantId = useBroo((s) => s.cartMerchantId);
  const clearCart = useBroo((s) => s.clearCart);
  const startDraft = useBroo((s) => s.startDraft);
  const user = useBroo((s) => s.user);
  const bumpHistory = useBroo((s) => s.bumpHistory);

  const [pay, setPay] = useState<"cash" | "qris">("cash");
  const [note, setNote] = useState("");

  if (!merchant) return null;

  const popular = merchant.menu.filter((i) => i.popular);
  const others = merchant.menu.filter((i) => !i.popular);

  const qtyOf = (id: string) => cart.find((c) => c.item.id === id)?.qty || 0;

  // cart belongs to a different merchant?
  const cartMismatch = cart.length > 0 && cartMerchantId && cartMerchantId !== merchant.id;

  const resetCart = () => {
    clearCart();
    toast.success("Keranjang dikosongkan, silakan pilih menu");
  };

  const checkout = async () => {
    if (!user || cart.length === 0) return;
    const items = cart.map((c) => ({ id: c.item.id, name: c.item.name, price: c.item.price, qty: c.qty }));
    const subtotal = cartTotal(cart);
    const deliveryFee = 8000;
    const total = subtotal + deliveryFee;
    try {
      const res = await fetch("/api/broo/food-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          merchantId: merchant.id,
          merchantName: merchant.name,
          items,
          total,
          deliveryFee,
          paymentMethod: pay,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal memesan");
      toast.success(`Pesanan ${merchant.name} terkirim! 🍜`);
      bumpHistory();
      clearCart();
      closeMerchant();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  // start a normal MakanBro ride order with cart context (for driver to pickup)
  const orderViaDriver = () => {
    if (cart.length === 0) return toast.error("Pilih menu dulu");
    if (!user) return;
    startDraft({
      service: "MakanBro",
      orderType: "now",
      pickup: merchant.name,
      destination: "Jl. Melati No. 12, Jakarta Selatan (lokasimu)",
      detail: `${cart.map((c) => `${c.qty}x ${c.item.name}`).join(", ")}`,
      km: merchant.distanceKm,
      paymentMethod: pay,
      note: note || undefined,
      merchantId: merchant.id,
      merchantName: merchant.name,
      cartItems: cart,
      cartTotal: cartTotal(cart),
    });
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="absolute inset-0 z-[75] flex h-full w-full flex-col bg-background"
    >
      {/* scrollable content */}
      <div className="flex-1 overflow-y-auto broo-scrollbar">
        {/* cover */}
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={merchant.cover} alt={merchant.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
          <button
            onClick={closeMerchant}
            aria-label="Kembali"
            className="absolute left-3 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur tap-scale"
          >
            <BrooIcon name="ChevronLeft" className="h-5 w-5" />
          </button>
          <button
            onClick={() => toast.info("Ditambahkan ke favorit")}
            aria-label="Favorit"
            className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur tap-scale"
          >
            <BrooIcon name="Star" className="h-5 w-5" />
          </button>
        </div>

        {/* merchant header */}
        <div className="relative px-5 pb-4 pt-4">
          <div className="flex items-start gap-3">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${merchant.logoColor} text-xl font-black text-white shadow-lg`}>
              {merchant.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black leading-tight text-foreground">{merchant.name}</h1>
              <p className="text-xs text-muted-foreground">{merchant.category}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-bold text-foreground">
                  <BrooIcon name="Star" className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {merchant.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BrooIcon name="Navigation" className="h-3 w-3" />
                  {merchant.distanceKm} km
                </span>
                <span className="inline-flex items-center gap-1">
                  <BrooIcon name="Clock" className="h-3 w-3" />
                  {merchant.eta}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <BrooIcon name="BadgeCheck" className="h-3 w-3" />
                  Halal
                </span>
              </div>
            </div>
          </div>

          {merchant.promo && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2">
              <BrooIcon name="Tag" className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary">{merchant.promo}</span>
            </div>
          )}

          {cartMismatch && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-500/10 px-3 py-2">
              <BrooIcon name="Info" className="h-4 w-4 text-amber-600" />
              <span className="flex-1 text-[11px] text-amber-700 dark:text-amber-400">
                Keranjang berisi pesanan dari kedai lain.
              </span>
              <button onClick={resetCart} className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                Kosongkan
              </button>
            </div>
          )}
        </div>

        {/* popular section */}
        {popular.length > 0 && (
          <MenuSection title="Paling Laris" icon="Flame">
            <div className="grid grid-cols-1 gap-2.5">
              {popular.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  qty={qtyOf(item.id)}
                  onAdd={() => addToCart(item)}
                  onDec={() => decFromCart(item.id)}
                />
              ))}
            </div>
          </MenuSection>
        )}

        {/* menu */}
        <MenuSection title="Daftar Menu" icon="UtensilsCrossed">
          <div className="grid grid-cols-1 gap-2.5">
            {others.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                qty={qtyOf(item.id)}
                onAdd={() => addToCart(item)}
                onDec={() => decFromCart(item.id)}
              />
            ))}
          </div>
        </MenuSection>

        <div className="h-28" />
      </div>

      {/* sticky cart bar */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 safe-bottom"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Pembayaran:</span>
              {(["cash", "qris"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPay(p)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold tap-scale ${
                    pay === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"
                  }`}
                >
                  {p === "cash" ? "Tunai" : "QRIS"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">
                  {cartCount(cart)} item • Ongkir {formatIDR(8000)}
                </p>
                <p className="text-base font-black text-foreground">
                  {formatIDR(cartTotal(cart) + 8000)}
                </p>
              </div>
              <button
                onClick={checkout}
                className="rounded-2xl bg-broo-gradient px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
              >
                Pesan Sekarang
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pb-2 pt-3">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <BrooIcon name={icon} className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-black text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function MenuItemRow({
  item,
  qty,
  onAdd,
  onDec,
}: {
  item: { id: string; name: string; desc: string; price: number; image: string; popular?: boolean };
  qty: number;
  onAdd: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-sm font-bold leading-tight text-foreground">{item.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{item.desc}</p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <span className="text-sm font-black text-primary">{formatIDR(item.price)}</span>
          <div className="flex items-center gap-2">
            {qty > 0 && (
              <motion.button
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onDec}
                className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-card text-foreground tap-scale"
                aria-label="Kurangi"
              >
                <BrooIcon name="Minus" className="h-4 w-4" />
              </motion.button>
            )}
            {qty > 0 && (
              <span className="min-w-5 text-center text-sm font-black text-foreground">{qty}</span>
            )}
            <button
              onClick={onAdd}
              className="grid h-8 w-8 place-items-center rounded-xl bg-broo-gradient text-white shadow-md shadow-primary/30 tap-scale"
              aria-label="Tambah"
            >
              <BrooIcon name="Plus" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
