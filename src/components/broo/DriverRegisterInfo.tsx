"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import {
  DRIVER_REGISTRATION_STEPS,
  DRIVER_REQUIREMENTS,
  CORPORATE_OFFICES,
} from "@/lib/broo-data";
import { toast } from "sonner";

export default function DriverRegisterInfo() {
  const closeModal = useBroo((s) => s.closeModal);
  const [channel, setChannel] = useState<"admin" | "corporate">("admin");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    ktp: "",
    vehicleType: "motor",
    vehicleBrand: "",
    plate: "",
    stnk: "",
    sim: "",
    city: "",
    experience: "",
  });

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.ktp.trim() || !form.plate.trim()) {
      return toast.error("Mohon lengkapi data wajib (Nama, Telepon, KTP, Plat)");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/broo/driver-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, channel }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal mengirim pendaftaran");
      toast.success("Pendaftaran driver terkirim! Tim Broo akan menghubungimu dalam 1x24 jam.");
      setShowForm(false);
      closeModal();
      useBroo.getState().openModal("driver-apply-success");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="absolute inset-0 z-50 flex h-full w-full flex-col bg-background"
    >
      {/* header */}
      <div className="relative bg-broo-gradient px-5 pb-16 pt-6 text-white">
        <button
          onClick={closeModal}
          aria-label="Tutup"
          className="absolute right-4 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur tap-scale"
        >
          <BrooIcon name="X" className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
          <BrooIcon name="BadgeCheck" className="h-4 w-4" />
          Program Driver Broo
        </div>
        <h1 className="mt-2 text-2xl font-black leading-tight">
          Jadi Driver Broo,
          <br />
          100% Tarif untukmu
        </h1>
        <p className="mt-1.5 text-sm text-white/85">
          Dari rakyat untuk rakyat — Broo tidak memotong komisi dari setiap
          orderanmu.
        </p>
      </div>

      <div className="relative -mt-10 flex-1 overflow-y-auto broo-scrollbar rounded-t-[2rem] bg-background px-5 pb-10 pt-6">
        {/* earnings highlight */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "Percent", val: "Rp 0", label: "Komisi Broo" },
            { icon: "Wallet2", val: "100%", label: "Tarif untukmu" },
            { icon: "Award", val: "1x", label: "Biaya admin daftar" },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-3 text-center">
              <div className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <BrooIcon name={c.icon} className="h-4 w-4" />
              </div>
              <p className="mt-1.5 text-base font-black text-foreground">{c.val}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        {/* why */}
        <Section title="Kenapa Jadi Driver Broo?" icon="Sparkles">
          <div className="space-y-2">
            {[
              ["Tanpa potongan komisi", "Tarif penumpang langsung masuk ke rekeningmu, 100%."],
              ["Tarik penghasilan kapan saja", "Gratis, tanpa minimum, cair instan."],
              ["Asuransi & perlindungan", "Driver aktif terlindungi selama bertugas."],
              ["Driver keliling bebas", "Tidak ada target harian — kamu atur sendiri."],
            ].map(([t, d]) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3">
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <BrooIcon name="Check" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t}</p>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* steps */}
        <Section title="Langkah-Langkah Pendaftaran" icon="Route">
          <div className="relative space-y-3">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
            {DRIVER_REGISTRATION_STEPS.map((s) => (
              <div key={s.step} className="relative flex gap-3">
                <div className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-broo-gradient text-white shadow-md shadow-primary/30">
                  <BrooIcon name={s.icon} className="h-5 w-5" />
                </div>
                <div className="flex-1 rounded-2xl border border-border bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-foreground">{s.title}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Langkah {s.step}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-xs text-foreground/80">
                        <BrooIcon
                          name="ChevronRight"
                          className="mt-0.5 h-3 w-3 shrink-0 text-primary"
                        />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* requirements */}
        <Section title="Persyaratan Driver" icon="FileText">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {DRIVER_REQUIREMENTS.map((r, i) => (
              <div
                key={r.label}
                className={`flex items-center justify-between px-3.5 py-3 ${
                  i % 2 ? "bg-secondary/30" : "bg-card"
                } ${i === DRIVER_REQUIREMENTS.length - 1 ? "" : "border-b border-border"}`}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {r.label}
                </span>
                <span className="text-sm font-bold text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-start gap-2 rounded-2xl bg-emerald-500/10 p-3">
            <BrooIcon name="ShieldCheck" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-300">
              <b>Biaya administrasi Rp 150.000 (motor) / Rp 250.000 (mobil)</b>{" "}
              dibayar satu kali saat pendaftaran — 100% digunakan untuk
              operasional, verifikasi, & asuransi driver.{" "}
              <b>Bukan komisi per order.</b>
            </p>
          </div>
        </Section>

        {/* offices */}
        <Section title="Kantor Corporate Broo" icon="Building2">
          <div className="space-y-2.5">
            {CORPORATE_OFFICES.map((o) => (
              <div key={o.city} className="rounded-2xl border border-border bg-card p-3.5">
                <div className="flex items-center gap-2">
                  <BrooIcon name="MapPin" className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold text-foreground">{o.city}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {o.address}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-foreground/70">
                  <span className="inline-flex items-center gap-1">
                    <BrooIcon name="Clock" className="h-3 w-3" />
                    {o.hours}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BrooIcon name="Phone" className="h-3 w-3" />
                    {o.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* channel toggle */}
        <Section title="Pilih Cara Mendaftar" icon="Route">
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "admin", t: "Via Admin Broo", d: "Verifikasi video call online", icon: "Headphones" },
              { v: "corporate", t: "Datang Langsung", d: "Ke kantor corporate terdekat", icon: "Building2" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setChannel(o.v as "admin" | "corporate")}
                className={`rounded-2xl border p-3 text-left tap-scale ${
                  channel === o.v
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    channel === o.v ? "bg-broo-gradient text-white" : "bg-secondary text-foreground/70"
                  }`}
                >
                  <BrooIcon name={o.icon} className="h-5 w-5" />
                </div>
                <p className="mt-2 text-sm font-bold text-foreground">{o.t}</p>
                <p className="text-[11px] text-muted-foreground">{o.d}</p>
              </button>
            ))}
          </div>
        </Section>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 w-full rounded-2xl bg-broo-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
          >
            Daftar sebagai Driver Broo
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 space-y-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2 text-sm font-black text-foreground">
              <BrooIcon name="UserPlus" className="h-4 w-4 text-primary" />
              Formulir Pendaftaran Driver
            </div>
            <FormGrid form={form} setForm={setForm} />
            <div className="rounded-xl bg-secondary/60 p-2.5 text-[11px] text-muted-foreground">
              Kanal:{" "}
              <b className="text-foreground">
                {channel === "admin" ? "Verifikasi via Admin Broo (online)" : "Datang langsung ke corporate"}
              </b>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-2xl border border-border bg-secondary py-3 text-sm font-semibold text-secondary-foreground tap-scale"
              >
                Batal
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-[2] rounded-2xl bg-broo-gradient py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-60 tap-scale"
              >
                {loading ? "Mengirim…" : "Kirim Pendaftaran"}
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl">
          <Image
            src="/promo/promo-driver.png"
            alt="Driver Broo"
            width={800}
            height={460}
            className="h-32 w-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <BrooIcon name={icon} className="h-4 w-4" />
        </div>
        <h3 className="text-base font-black text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FormGrid({
  form,
  setForm,
}: {
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
}) {
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <DriverField label="Nama Lengkap" name="name" placeholder="Nama sesuai KTP" required form={form} set={set} />
      <DriverField label="No. Telepon" name="phone" placeholder="08xx" required form={form} set={set} />
      <DriverField label="Email" name="email" placeholder="opsional" type="email" form={form} set={set} />
      <DriverField label="No. KTP" name="ktp" placeholder="16 digit" required form={form} set={set} />
      <div className="col-span-2">
        <label className="mb-1 block text-[11px] font-semibold text-foreground/70">
          Jenis Kendaraan
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "motor", l: "Motor" },
            { v: "mobil", l: "Mobil" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => set("vehicleType", o.v)}
              className={`rounded-xl border py-2 text-sm font-semibold tap-scale ${
                form.vehicleType === o.v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground/70"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <DriverField label="Merek Kendaraan" name="vehicleBrand" placeholder="Honda Beat" form={form} set={set} />
      <DriverField label="Plat Nomor" name="plate" placeholder="B 1234 XX" required form={form} set={set} />
      <DriverField label="No. STNK" name="stnk" placeholder="opsional" form={form} set={set} />
      <DriverField label="No. SIM" name="sim" placeholder="SIM C / B" form={form} set={set} />
      <DriverField label="Kota Domisili" name="city" placeholder="Jakarta" form={form} set={set} />
      <DriverField label="Pengalaman" name="experience" placeholder="mis. 2 tahun ojek" form={form} set={set} />
      <style jsx>{`
        :global(.broo-input2) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.55rem 0.7rem;
          font-size: 0.825rem;
          color: var(--foreground);
          outline: none;
        }
        :global(.broo-input2::placeholder) {
          color: var(--muted-foreground);
        }
        :global(.broo-input2:focus) {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent);
        }
      `}</style>
    </div>
  );
}

function DriverField({
  label,
  name,
  placeholder,
  required,
  type = "text",
  form,
  set,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  form: Record<string, string>;
  set: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-foreground/70">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        className="broo-input2"
        type={type}
        placeholder={placeholder}
        value={form[name] || ""}
        onChange={(e) => set(name, e.target.value)}
      />
    </div>
  );
}
