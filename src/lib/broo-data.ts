// Broo — service catalog, pricing & domain constants

export type ServiceId =
  | "MotorBro"
  | "MobilBro"
  | "MakanBro"
  | "TitipBro"
  | "TolongBro";

export type OrderType = "now" | "booking";

export interface ServiceConfig {
  id: ServiceId;
  name: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name (resolved in components)
  color: string; // tailwind gradient classes
  solid: string; // solid bg class
  text: string; // text color class
  base: number; // base fare (IDR)
  perKm: number; // per km (IDR)
  eta: string; // est. pickup time label
  category: "ride" | "food" | "errand";
}

export const SERVICES: ServiceConfig[] = [
  {
    id: "MotorBro",
    name: "MotorBro",
    tagline: "Ojek motor cepat",
    description: "Antar kamu kemana saja dengan motor. Hemat, cepat, dan lincau di jalanan.",
    icon: "Bike",
    color: "from-orange-400 to-orange-600",
    solid: "bg-orange-500",
    text: "text-orange-600",
    base: 8000,
    perKm: 2200,
    eta: "3 menit",
    category: "ride",
  },
  {
    id: "MobilBro",
    name: "MobilBro",
    tagline: "Ojek mobil nyaman",
    description: "Naik mobil ber-AC, nyaman untuk berkelompok atau bawa banyak barang.",
    icon: "Car",
    color: "from-amber-400 to-orange-500",
    solid: "bg-amber-500",
    text: "text-amber-600",
    base: 12000,
    perKm: 3500,
    eta: "5 menit",
    category: "ride",
  },
  {
    id: "MakanBro",
    name: "MakanBro",
    tagline: "Antar makanan & jajan",
    description: "Pesan makanan dari resto langganan, driver Broo yang antar. Tanpa markup harga.",
    icon: "UtensilsCrossed",
    color: "from-rose-400 to-red-500",
    solid: "bg-rose-500",
    text: "text-rose-600",
    base: 10000,
    perKm: 1800,
    eta: "4 menit",
    category: "food",
  },
  {
    id: "TitipBro",
    name: "TitipBro",
    tagline: "Jasa titip belanja",
    description: "Titip belanja dari minimarket, apotek, atau toko lain sesuai kebutuhanmu.",
    icon: "ShoppingBag",
    color: "from-emerald-400 to-green-600",
    solid: "bg-emerald-500",
    text: "text-emerald-600",
    base: 12000,
    perKm: 2000,
    eta: "6 menit",
    category: "errand",
  },
  {
    id: "TolongBro",
    name: "TolongBro",
    tagline: "Bantuan serba bisa",
    description: "Butuh bantuan? Antar dokumen, jemput barang, atau pekerjaan ringat lainnya.",
    icon: "LifeBuoy",
    color: "from-violet-400 to-purple-600",
    solid: "bg-violet-500",
    text: "text-violet-600",
    base: 15000,
    perKm: 2200,
    eta: "5 menit",
    category: "errand",
  },
];

export const SERVICE_MAP: Record<ServiceId, ServiceConfig> = SERVICES.reduce(
  (acc, s) => ((acc[s.id] = s), acc),
  {} as Record<ServiceId, ServiceConfig>
);

export function priceOf(service: ServiceId, km: number): number {
  const s = SERVICE_MAP[service];
  return Math.round((s.base + s.perKm * Math.max(km, 0)) / 100) * 100;
}

export function formatIDR(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

export const PAYMENT_METHODS = [
  { id: "cash", label: "Tunai", icon: "Wallet", desc: "Bayar langsung ke driver" },
  { id: "wallet", label: "BrooPay", icon: "Smartphone", desc: "Saldo Rp0 (top up dulu)" },
  { id: "qris", label: "QRIS", icon: "QrCode", desc: "Scan bayar instan" },
] as const;

// Quick location presets for fast demo flow
export const QUICK_LOCATIONS = [
  { name: "Rumah", address: "Jl. Melati No. 12, Jakarta Selatan", icon: "Home" },
  { name: "Kantor", address: "Menara Broo Lt. 14, Thamrin", icon: "Building2" },
  { name: "Kampus", address: "Universitas Indonesia, Depok", icon: "GraduationCap" },
  { name: "Mall", address: "Plaza Indonesia, Thamrin", icon: "Store" },
];

export const SAVED_PLACES = [
  { name: "Bandara Soekarno-Hatta", address: "Terminal 3, Cengkareng", km: 24 },
  { name: "Stasiun Gambir", address: "Gambir, Jakarta Pusat", km: 6.4 },
  { name: "Monas", address: "Medan Merdeka, Jakarta Pusat", km: 4.1 },
  { name: "Ancol", address: "Taman Impian Jaya Ancol", km: 11.2 },
  { name: "Pasar Senen", address: "Pasar Senen, Jakarta Pusat", km: 3.3 },
  { name: "RS Cipto", address: "RSUP Dr. Cipto Mangunkusumo", km: 5.0 },
];

export const DRIVER_REGISTRATION_STEPS = [
  {
    step: 1,
    title: "Siapkan Dokumen",
    icon: "FileText",
    items: [
      "KTP asli (usia minimal 17 tahun)",
      "SIM C untuk MotorBro / SIM B untuk MobilBro",
      "STNK & BPKB kendaraan",
      "SKCK (Surat Keterangan Catatan Kepolisian)",
      "Foto diri 3x4 & foto kendaraan",
    ],
  },
  {
    step: 2,
    title: "Pilih Cara Pendaftaran",
    icon: "Route",
    items: [
      "Online: Daftar via admin Broo (verifikasi video call)",
      "Datang langsung: ke kantor corporate Broo terdekat",
      "Biaya administrasi sekali daftar: Rp 150.000 (motor) / Rp 250.000 (mobil)",
      "Biaya ini 100% untuk operasional & asuransi driver — BUKAN komisi",
    ],
  },
  {
    step: 3,
    title: "Verifikasi & Tes",
    icon: "ShieldCheck",
    items: [
      "Verifikasi data & dokumen oleh tim Broo",
      "Tes berkendara & wawancara singkat (online/offline)",
      "Pemasangan jaket & atribut resmi Broo",
      "Aktivasi akun driver di aplikasi (maks 2x24 jam)",
    ],
  },
  {
    step: 4,
    title: "Mulai Bertugas",
    icon: "Rocket",
    items: [
      "Buka aplikasi driver, set status Online",
      "Terima orderan masuk secara otomatis",
      "100% tarif masuk ke rekeningmu — tanpa potongan",
      "Tarik penghasilan kapan saja, gratis",
    ],
  },
];

export const CORPORATE_OFFICES = [
  {
    city: "Jakarta (Kantor Pusat)",
    address: "Menara Broo Lt. 14, Jl. M.H. Thamrin No. 10, Jakarta Pusat",
    hours: "Senin–Sabtu, 09.00–18.00 WIB",
    phone: "0800-1234-BROO",
  },
  {
    city: "Bandung",
    address: "Jl. Dipatiukur No. 35, Coblong, Bandung",
    hours: "Senin–Sabtu, 09.00–17.00 WIB",
    phone: "0800-1234-BROO",
  },
  {
    city: "Surabaya",
    address: "Jl. Tunjungan No. 88, Surabaya",
    hours: "Senin–Sabtu, 09.00–17.00 WIB",
    phone: "0800-1234-BROO",
  },
];

export const DRIVER_REQUIREMENTS = [
  { label: "Usia minimal", value: "17 tahun" },
  { label: "Kewarganegaraan", value: "WNI / KITAS" },
  { label: "Kendaraan", value: "Milik sendiri / sewa" },
  { label: "Maksimal usia kendaraan", value: "12 tahun" },
  { label: "Administrasi (motor)", value: "Rp 150.000" },
  { label: "Administrasi (mobil)", value: "Rp 250.000" },
  { label: "Komisi Broo", value: "Rp 0 (gratis selamanya)" },
];
