"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { toast } from "sonner";

export function ProfileSheet() {
  const user = useBroo((s) => s.user);
  const closeModal = useBroo((s) => s.closeModal);
  const openModal = useBroo((s) => s.openModal);
  const logout = useBroo((s) => s.logout);
  const setPhase = useBroo((s) => s.setPhase);

  if (!user) return null;

  const menu = [
    { icon: "User", label: "Edit Profil", action: () => toast.info("Edit profil segera hadir") },
    { icon: "MapPin", label: "Alamat Tersimpan", action: () => toast.info("Alamat tersimpan segera hadir") },
    { icon: "CreditCard", label: "Metode Pembayaran", action: () => toast.info("Tunai & QRIS tersedia") },
    { icon: "Gift", label: "Voucher & Promo", action: () => toast.info("Belum ada voucher aktif") },
    { icon: "ShieldCheck", label: "Privasi & Keamanan", action: () => toast.info("Pengaturan keamanan") },
    { icon: "Headphones", label: "Bantuan", action: () => toast.info("Hubungi 0800-1234-BROO") },
    { icon: "Settings", label: "Pengaturan", action: () => toast.info("Pengaturan aplikasi") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
      className="absolute inset-0 z-[70] flex justify-end bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[88%] max-w-[360px] flex-col bg-background"
      >
        <div className="bg-broo-gradient px-5 pb-6 pt-7 text-white safe-top">
          <div className="flex items-start justify-between">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-2xl font-black backdrop-blur">
              {user.name[0].toUpperCase()}
            </div>
            <button
              onClick={closeModal}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/20 tap-scale"
              aria-label="Tutup"
            >
              <BrooIcon name="X" className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-3 text-lg font-black">{user.name}</h2>
          <p className="text-xs text-white/80">
            {user.provider === "google" ? user.email || "Akun Google" : `+62 ${user.phone}`}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur">
            <BrooIcon name="BadgeCheck" className="h-3.5 w-3.5" />
            Brooer Aktif
          </div>
        </div>

        <div className="flex-1 overflow-y-auto broo-scrollbar px-4 py-4">
          {/* stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Perjalanan", v: "0" },
              { l: "Rating", v: "—" },
              { l: "Poin", v: "120" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-3 text-center">
                <p className="text-base font-black text-primary">{s.v}</p>
                <p className="text-[10px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>

          {/* become driver cta */}
          <button
            onClick={() => openModal("driver-info")}
            className="mt-3 flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-broo-dark-gradient p-3.5 text-left text-white tap-scale"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <Image src="/promo/promo-driver.png" alt="" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black">Jadi Driver Broo</p>
              <p className="text-[11px] text-white/75">100% tarif untukmu, tanpa komisi</p>
            </div>
            <BrooIcon name="ChevronRight" className="h-5 w-5" />
          </button>

          {/* menu */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            {menu.map((m, i) => (
              <button
                key={m.label}
                onClick={m.action}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left tap-scale ${
                  i === menu.length - 1 ? "" : "border-b border-border"
                }`}
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground/70">
                  <BrooIcon name={m.icon} className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground">{m.label}</span>
                <BrooIcon name="ChevronRight" className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              logout();
              setPhase("onboarding");
              closeModal();
              toast.success("Berhasil keluar");
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3.5 text-sm font-bold text-destructive tap-scale"
          >
            <BrooIcon name="LogOut" className="h-4 w-4" />
            Keluar
          </button>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            Broo v1.0.0 • Dari rakyat untuk rakyat
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function NotificationsSheet() {
  const closeModal = useBroo((s) => s.closeModal);
  const openModal = useBroo((s) => s.openModal);
  const notifs = [
    { icon: "Gift", color: "bg-emerald-500", title: "Selamat datang di Broo!", desc: "Nikmati perjalanan tanpa biaya admin selamanya.", time: "Baru saja" },
    { icon: "Percent", color: "bg-primary", title: "0% Komisi untuk Driver", desc: "Ajak teman jadi driver, dapat penghasilan penuh.", time: "2 jam lalu" },
    { icon: "Star", color: "bg-amber-500", title: "Beri rating drivemu", desc: "Bantu driver Broo mendapat apresiasi.", time: "Kemarin" },
    { icon: "UserPlus", color: "bg-violet-500", title: "Program Driver Broo dibuka", desc: "Daftar sekali, berpenghasilan selamanya.", time: "2 hari lalu" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
      className="absolute inset-0 z-[70] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-16 px-4"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] overflow-hidden rounded-3xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-black">Notifikasi</h3>
          <button onClick={closeModal} className="grid h-8 w-8 place-items-center rounded-full bg-secondary tap-scale" aria-label="Tutup">
            <BrooIcon name="X" className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto broo-scrollbar">
          {notifs.map((n, i) => (
            <button
              key={i}
              onClick={() => {
                closeModal();
                if (n.title.includes("Driver")) openModal("driver-info");
              }}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left tap-scale ${
                i === notifs.length - 1 ? "" : "border-b border-border"
              } ${i === 0 ? "bg-primary/5" : ""}`}
            >
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${n.color}`}>
                <BrooIcon name={n.icon} className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{n.title}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{n.desc}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">{n.time}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ApplySuccessModal() {
  const closeModal = useBroo((s) => s.closeModal);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
      className="absolute inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] overflow-hidden rounded-3xl bg-card p-6 text-center shadow-2xl"
      >
        <div className="relative mx-auto grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 rounded-full bg-emerald-500/15 broo-pulse-ring" />
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
            <BrooIcon name="Check" className="h-9 w-9" strokeWidth={3} />
          </div>
        </div>
        <h3 className="mt-4 text-lg font-black text-foreground">Pendaftaran Terkirim!</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Terima kasih sudah mendaftar sebagai driver Broo. Tim kami akan
          menghubungimu dalam 1x24 jam untuk verifikasi & tes.
        </p>
        <div className="mt-4 rounded-2xl bg-secondary/60 p-3 text-left">
          <p className="flex items-center gap-2 text-xs text-foreground/80">
            <BrooIcon name="Phone" className="h-4 w-4 text-primary" />
            0800-1234-BROO
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-foreground/80">
            <BrooIcon name="Building2" className="h-4 w-4 text-primary" />
            Kantor corporate Broo terdekat
          </p>
        </div>
        <button
          onClick={closeModal}
          className="mt-4 w-full rounded-2xl bg-broo-gradient py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
        >
          Mengerti
        </button>
      </motion.div>
    </motion.div>
  );
}
