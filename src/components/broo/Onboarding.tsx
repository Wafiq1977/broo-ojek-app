"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { SERVICES } from "@/lib/broo-data";
import { toast } from "sonner";

type View = "welcome" | "register" | "phone" | "google-loading" | "admin";

export default function Onboarding() {
  const setUser = useBroo((s) => s.setUser);
  const setPhase = useBroo((s) => s.setPhase);
  const openModal = useBroo((s) => s.openModal);
  const [view, setView] = useState<View>("welcome");

  // ----- register form state -----
  const [reg, setReg] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    gender: "L",
    agree: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // ----- phone login state -----
  const [phoneLogin, setPhoneLogin] = useState("");

  const submitRegister = async () => {
    if (!reg.name.trim()) return toast.error("Nama lengkap wajib diisi");
    if (!reg.phone.trim()) return toast.error("Nomor telepon wajib diisi");
    if (reg.phone.replace(/\D/g, "").length < 8)
      return toast.error("Nomor telepon tidak valid");
    if (reg.password.length < 6)
      return toast.error("Kata sandi minimal 6 karakter");
    if (!reg.agree) return toast.error("Setujui syarat & ketentuan Broo");

    setLoading(true);
    try {
      const res = await fetch("/api/broo/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reg),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error?.includes("sudah terdaftar")) {
          toast.info("Nomor sudah terdaftar, silakan masuk");
          setView("phone");
          setPhoneLogin(reg.phone);
        } else {
          throw new Error(data.error || "Gagal mendaftar");
        }
        setLoading(false);
        return;
      }
      setUser(data.user);
      toast.success(`Selamat datang, ${data.user.name}! 🎉`);
      setPhase("app");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitPhone = async () => {
    if (phoneLogin.replace(/\D/g, "").length < 8)
      return toast.error("Nomor telepon tidak valid");
    setLoading(true);
    try {
      const res = await fetch("/api/broo/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "phone", phone: phoneLogin }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal masuk");
      setUser(data.user);
      toast.success(`Halo, ${data.user.name}!`);
      setPhase("app");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitGoogle = async () => {
    setView("google-loading");
    // simulate google account
    await new Promise((r) => setTimeout(r, 1400));
    try {
      const res = await fetch("/api/broo/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "google",
          email: "brooer.gmail@gmail.com",
          name: "Pengguna Google",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal masuk");
      setUser(data.user);
      toast.success(`Halo, ${data.user.name}!`);
      setPhase("app");
    } catch (e) {
      toast.error((e as Error).message);
      setView("welcome");
    }
  };

  return (
    <div className="relative h-full w-full overflow-y-auto no-scrollbar bg-background">
      <AnimatePresence mode="wait">
        {view === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex min-h-full flex-col"
          >
            {/* hero */}
            <div className="relative bg-broo-gradient px-6 pb-20 pt-12 text-center text-white">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute left-2 top-28 h-32 w-32 rounded-full bg-amber-300/25 blur-2xl" />
              </div>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="relative mx-auto"
              >
                <Image src="/broo-logo.png" alt="Broo" width={100} height={100} priority className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]" />
              </motion.div>
              <h1 className="relative mt-5 text-3xl font-black tracking-tight">Broo</h1>
              <p className="relative mt-1.5 text-sm text-white/85">
                Ojek online dari rakyat untuk rakyat
              </p>
            </div>

            {/* card overlapping */}
            <div className="relative -mt-10 rounded-t-[2rem] bg-background px-6 pt-6 pb-8">
              {/* value props */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: "Percent", label: "Tanpa biaya admin" },
                  { icon: "ShieldCheck", label: "Driver terverifikasi" },
                  { icon: "Zap", label: "Cepat & murah" },
                ].map((v) => (
                  <div
                    key={v.label}
                    className="rounded-2xl bg-secondary/60 p-3"
                  >
                    <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-broo-gradient text-white">
                      <BrooIcon name={v.icon} className="h-5 w-5" />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold leading-tight text-foreground/80">
                      {v.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* service chips */}
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {SERVICES.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-foreground/80"
                  >
                    {s.name}
                  </span>
                ))}
              </div>

              <h2 className="mt-6 text-center text-lg font-black text-foreground">
                Gabung Broo Sekarang
              </h2>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Daftar sekali, pesan ojek makin murah selamanya.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => setView("register")}
                  className="w-full rounded-2xl bg-broo-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 tap-scale"
                >
                  Daftar Akun Baru
                </button>
                <button
                  onClick={() => setView("phone")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground tap-scale"
                >
                  <BrooIcon name="Smartphone" className="h-5 w-5 text-primary" />
                  Masuk dengan No. Telepon
                </button>
                <button
                  onClick={submitGoogle}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground tap-scale"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Masuk dengan Google
                </button>
              </div>

              <button
                onClick={() => openModal("driver-info")}
                className="mt-5 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-primary tap-scale"
              >
                <BrooIcon name="UserPlus" className="h-4 w-4" />
                Ingin jadi Driver Broo? Lihat cara daftar
                <BrooIcon name="ChevronRight" className="h-4 w-4" />
              </button>

              <button
                onClick={() => setView("admin")}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-foreground/60 tap-scale"
              >
                <BrooIcon name="ShieldCheck" className="h-4 w-4" />
                Masuk sebagai Admin Broo
                <BrooIcon name="ChevronRight" className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {view === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex min-h-full flex-col px-6 pb-8 pt-6"
          >
            <HeaderBack onBack={() => setView("welcome")} title="Daftar Akun Baru" />
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/10 p-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <BrooIcon name="Gift" className="h-4 w-4" />
              </div>
              <div className="text-xs leading-snug text-foreground/80">
                <b className="text-foreground">Gratis daftar</b> — tanpa biaya
                tahunan. Kamu hanya membayar ongkir saat memesan.
              </div>
            </div>

            <form
              className="mt-5 space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                submitRegister();
              }}
            >
              <Field label="Nama Lengkap" icon="User">
                <input
                  className="broo-input"
                  placeholder="Contoh: Budi Santoso"
                  value={reg.name}
                  onChange={(e) => setReg({ ...reg, name: e.target.value })}
                />
              </Field>

              <Field label="Nomor Telepon" icon="Smartphone">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-foreground/70">
                    +62
                  </span>
                  <input
                    className="broo-input flex-1"
                    inputMode="tel"
                    placeholder="812 3456 7890"
                    value={reg.phone}
                    onChange={(e) =>
                      setReg({ ...reg, phone: e.target.value.replace(/[^\d]/g, "") })
                    }
                  />
                </div>
              </Field>

              <Field label="Email (opsional)" icon="Mail">
                <input
                  className="broo-input"
                  type="email"
                  placeholder="nama@email.com"
                  value={reg.email}
                  onChange={(e) => setReg({ ...reg, email: e.target.value })}
                />
              </Field>

              <Field label="Kata Sandi" icon="Lock">
                <div className="relative">
                  <input
                    className="broo-input pr-11"
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 6 karakter"
                    value={reg.password}
                    onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label="Toggle password"
                  >
                    <BrooIcon name={showPwd ? "EyeOff" : "Eye"} className="h-4 w-4" />
                  </button>
                </div>
              </Field>

              <Field label="Alamat Domisili (opsional)" icon="MapPin">
                <input
                  className="broo-input"
                  placeholder="Kota, kecamatan"
                  value={reg.address}
                  onChange={(e) => setReg({ ...reg, address: e.target.value })}
                />
              </Field>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "L", l: "Laki-laki" },
                    { v: "P", l: "Perempuan" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setReg({ ...reg, gender: o.v })}
                      className={`rounded-2xl border py-2.5 text-sm font-semibold tap-scale ${
                        reg.gender === o.v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground/70"
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setReg({ ...reg, agree: !reg.agree })}
                  className={`mt-0.5 grid h-5 w-5 place-items-center rounded-md border tap-scale ${
                    reg.agree
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {reg.agree && <BrooIcon name="Check" className="h-3.5 w-3.5" />}
                </button>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Saya menyetujui{" "}
                  <b className="text-foreground">Syarat & Ketentuan</b> serta{" "}
                  <b className="text-foreground">Kebijakan Privasi</b> Broo.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-broo-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-60 tap-scale"
              >
                {loading ? "Mendaftarkan…" : "Daftar Sekarang"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Sudah punya akun?{" "}
              <button
                onClick={() => setView("phone")}
                className="font-bold text-primary"
              >
                Masuk di sini
              </button>
            </p>
          </motion.div>
        )}

        {view === "phone" && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex min-h-full flex-col px-6 pb-8 pt-6"
          >
            <HeaderBack onBack={() => setView("welcome")} title="Masuk" />
            <div className="mt-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-broo-gradient text-white shadow-lg shadow-primary/30">
                <BrooIcon name="Smartphone" className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-xl font-black">Masuk dengan No. Telepon</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Masukkan nomor aktifmu. Kami akan verifikasi via WhatsApp/SMS.
              </p>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitPhone();
              }}
            >
              <Field label="Nomor Telepon" icon="Smartphone">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-foreground/70">
                    +62
                  </span>
                  <input
                    className="broo-input flex-1 text-lg font-semibold tracking-wide"
                    inputMode="tel"
                    placeholder="812 3456 7890"
                    value={phoneLogin}
                    onChange={(e) =>
                      setPhoneLogin(e.target.value.replace(/[^\d]/g, ""))
                    }
                    autoFocus
                  />
                </div>
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-broo-gradient py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-60 tap-scale"
              >
                {loading ? "Memverifikasi…" : "Lanjutkan"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">atau</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={submitGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground tap-scale"
            >
              <GoogleIcon className="h-5 w-5" />
              Masuk dengan Google
            </button>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Belum punya akun?{" "}
              <button
                onClick={() => setView("register")}
                className="font-bold text-primary"
              >
                Daftar di sini
              </button>
            </p>
          </motion.div>
        )}

        {view === "google-loading" && (
          <motion.div
            key="google-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-full flex-col items-center justify-center gap-4 px-8 text-center"
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="grid h-16 w-16 place-items-center">
                <GoogleIcon className="h-7 w-7" />
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">
              Menghubungkan ke Google…
            </p>
          </motion.div>
        )}

        {view === "admin" && (
          <AdminLoginView onBack={() => setView("welcome")} onSuccess={() => { setPhase("app"); useBroo.getState().setTab("admin"); }} />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .broo-input {
          width: 100%;
          border-radius: 0.85rem;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 0.625rem 0.875rem;
          font-size: 0.95rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .broo-input::placeholder {
          color: var(--muted-foreground);
        }
        .broo-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent);
        }
      `}</style>
    </div>
  );
}

function HeaderBack({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        aria-label="Kembali"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card tap-scale"
      >
        <BrooIcon name="ChevronLeft" className="h-5 w-5" />
      </button>
      <h2 className="text-lg font-black">{title}</h2>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
        <BrooIcon name={icon} className="h-3.5 w-3.5 text-primary" />
        {label}
      </label>
      {children}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

// ====== Admin Login View ======
const ADMIN_CREDENTIALS = [
  { email: "admin@broo.id", phone: "081200000001", password: "broo-admin-2026", name: "Admin Broo Bojonegoro" },
];

function AdminLoginView({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useBroo((s) => s.setUser);

  const submit = () => {
    const id = mode === "email" ? email.trim().toLowerCase() : phone.trim();
    if (!id || !password) return toast.error("Lengkapi email/no.telepon & password");
    setLoading(true);

    setTimeout(() => {
      const admin = ADMIN_CREDENTIALS.find(
        (a) =>
          (mode === "email" ? a.email.toLowerCase() === id : a.phone === id) &&
          a.password === password
      );
      if (!admin) {
        setLoading(false);
        return toast.error("Kredensial admin salah. Cek kembali.");
      }
      setUser({
        id: "admin-broo",
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        provider: "phone",
      });
      toast.success("Selamat datang, Admin Broo!");
      onSuccess();
    }, 800);
  };

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex min-h-full flex-col px-6 pb-8 pt-6"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} aria-label="Kembali" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card tap-scale">
          <BrooIcon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-black">Login Admin</h2>
      </div>

      <div className="mt-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-broo-dark-gradient text-white shadow-broo-lg">
          <BrooIcon name="ShieldCheck" className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-black">Panel Admin Broo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Khusus admin Broo Bojonegoro. Masuk dengan kredensial admin.
        </p>
      </div>

      {/* mode toggle */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
        {(["email", "phone"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`relative rounded-xl py-2.5 text-sm font-bold tap-scale ${
              mode === m ? "bg-broo-gradient text-white shadow-md" : "text-muted-foreground"
            }`}
          >
            {m === "email" ? "Email Admin" : "No. Telepon Admin"}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {mode === "email" ? (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Email Admin</label>
            <input
              className="broo-input"
              type="email"
              placeholder="admin@broo.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground/70">No. Telepon Admin</label>
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-foreground/70">+62</span>
              <input
                className="broo-input flex-1"
                inputMode="tel"
                placeholder="81200000001"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Password Admin</label>
          <div className="relative">
            <input
              className="broo-input pr-11"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Toggle password"
            >
              <BrooIcon name={showPwd ? "EyeOff" : "Eye"} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-2xl bg-broo-dark-gradient py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60 tap-scale"
        >
          {loading ? "Memverifikasi…" : "Masuk sebagai Admin"}
        </button>
      </div>

      {/* demo credentials hint */}
      <div className="mt-5 rounded-2xl bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400">
        <p className="font-bold">Demo Admin Credentials:</p>
        <p className="mt-0.5">Email: admin@broo.id</p>
        <p>Password: broo-admin-2026</p>
        <p className="mt-0.5">Atau Telepon: 081200000001</p>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Bukan admin?{" "}
        <button onClick={onBack} className="font-bold text-primary">
          Kembali ke daftar
        </button>
      </p>
    </motion.div>
  );
}
