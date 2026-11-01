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
  emoji: string; // realistic emoji icon
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
    emoji: "🛵",
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
    emoji: "🚗",
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
    emoji: "🍜",
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
    emoji: "🛍️",
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
    emoji: "🤝",
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

// ============ MAKANBRO — KEDAI / MERCHANT CATALOG (GoFood style) ============

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  popular?: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  category: string; // e.g. "Mie & Bakso", "Ayam", "Minuman"
  tags: string[]; // e.g. ["Halal","Promo","Terdekat","Baru"]
  cover: string;
  logoColor: string; // gradient class for logo circle
  rating: number;
  eta: string;
  distanceKm: number;
  promo?: string; // e.g. "Diskon 30%"
  menu: MenuItem[];
}

export const MERCHANTS: Merchant[] = [
  {
    id: "gacoan",
    name: "Mie Gacoan",
    category: "Mie & Bakso",
    tags: ["Halal", "Promo", "Favorit"],
    cover: "/merchants/gacoan.jpg",
    logoColor: "from-red-500 to-rose-600",
    rating: 4.8,
    eta: "20 menit",
    distanceKm: 1.2,
    promo: "Diskon s/d 30%",
    menu: [
      { id: "g1", name: "Mie Pedas Level 1", desc: "Mie kuah pedas, topping ayam suwir", price: 13000, image: "/menu/mie-level.jpg", popular: true },
      { id: "g2", name: "Mie Pedas Level 3", desc: "Untuk pencinta pedas, ayam suwir", price: 14000, image: "/menu/mie-level.jpg", popular: true },
      { id: "g3", name: "Mie Pedas Level 5 (Setan)", desc: "Level pedas tertinggi, hati-hati!", price: 15000, image: "/menu/mie-level.jpg" },
      { id: "g4", name: "Udang Keju", desc: "Udang crispy isi 5 pcs, saus keju", price: 18000, image: "/menu/fried-chicken.jpg", popular: true },
      { id: "g5", name: "Es Teh Manis", desc: "Segelas es teh manis dingin", price: 5000, image: "/menu/es-teh-gelas.jpg" },
      { id: "g6", name: "Es Jeruk", desc: "Jus jeruk peras segar", price: 7000, image: "/menu/es-teh-gelas.jpg" },
    ],
  },
  {
    id: "geprek",
    name: "Geprek Bensu",
    category: "Ayam",
    tags: ["Halal", "Terdekat"],
    cover: "/merchants/geprek.jpg",
    logoColor: "from-orange-500 to-amber-600",
    rating: 4.7,
    eta: "15 menit",
    distanceKm: 0.8,
    promo: "Beli 2 hemat 5rb",
    menu: [
      { id: "p1", name: "Ayam Geprek Sambal Matah", desc: "Ayam crispy + sambal matah segar + nasi", price: 18000, image: "/menu/ayam-geprek.jpg", popular: true },
      { id: "p2", name: "Ayam Geprek Level 5", desc: "Super pedas, nasi, lalapan", price: 17000, image: "/menu/ayam-geprek.jpg", popular: true },
      { id: "p3", name: "Paket Komplit (Ayam+Es Teh)", desc: "Ayam geprek + nasi + es teh", price: 22000, image: "/menu/ayam-geprek.jpg" },
      { id: "p4", name: "Ayam Goreng Kremes", desc: "Ayam goreng + kremes + nasi", price: 19000, image: "/menu/fried-chicken.jpg" },
      { id: "p5", name: "Es Teh Manis", desc: "Gelas besar", price: 5000, image: "/menu/es-teh-gelas.jpg" },
    ],
  },
  {
    id: "esteh",
    name: "Es Teh Indonesia",
    category: "Minuman",
    tags: ["Halal", "Baru"],
    cover: "/merchants/esteh.jpg",
    logoColor: "from-emerald-500 to-teal-600",
    rating: 4.9,
    eta: "12 menit",
    distanceKm: 0.6,
    promo: "Gratis ongkir",
    menu: [
      { id: "e1", name: "Es Teh Manis Original", desc: "Botol 350ml, teh pilihan", price: 6000, image: "/menu/es-teh-gelas.jpg", popular: true },
      { id: "e2", name: "Es Teh Tawar", desc: "Botol 350ml, tanpa gula", price: 5000, image: "/menu/es-teh-gelas.jpg" },
      { id: "e3", name: "Es Teh Lemon", desc: "Teh + lemon segar", price: 8000, image: "/menu/es-teh-gelar.jpg" },
      { id: "e4", name: "Es Jeruk Peras", desc: "Botol 350ml", price: 8000, image: "/menu/es-teh-gelas.jpg" },
      { id: "e5", name: "Es Teh Tarik", desc: "Teh tarik dingin, creamy", price: 9000, image: "/menu/kopi-susu.jpg", popular: true },
    ],
  },
  {
    id: "martabak",
    name: "Martabak Orins",
    category: "Martabak",
    tags: ["Halal", "Favorit", "Promo"],
    cover: "/merchants/martabak.jpg",
    logoColor: "from-amber-500 to-yellow-600",
    rating: 4.85,
    eta: "25 menit",
    distanceKm: 2.1,
    promo: "Diskon 15%",
    menu: [
      { id: "m1", name: "Martabak Manis Coklat Keju", desc: "Topping coklat + keju full", price: 35000, image: "/menu/martabak-potong.jpg", popular: true },
      { id: "m2", name: "Martabak Manis Mix Spesial", desc: "Coklat, keju, kacang, susu", price: 42000, image: "/menu/martabak-potong.jpg", popular: true },
      { id: "m3", name: "Martabak Telur Spesial", desc: "Telur, daging, daun bawang", price: 38000, image: "/menu/martabak-potong.jpg" },
      { id: "m4", name: "Martabak Mini (6 pcs)", desc: "Manis coklat, ukuran mini", price: 18000, image: "/menu/martabak-potong.jpg" },
    ],
  },
  {
    id: "kopi",
    name: "Kopi Kenangan",
    category: "Kopi & Minuman",
    tags: ["Halal", "Favorit"],
    cover: "/merchants/kopi.jpg",
    logoColor: "from-amber-700 to-stone-800",
    rating: 4.75,
    eta: "18 menit",
    distanceKm: 1.5,
    promo: "Promo 1+1",
    menu: [
      { id: "k1", name: "Es Kopi Susu Kenangan", desc: "Kopi susu signature, less ice", price: 18000, image: "/menu/kopi-susu.jpg", popular: true },
      { id: "k2", name: "Es Kopi Susu Gula Aren", desc: "Dengan gula aren asli", price: 20000, image: "/menu/kopi-susu.jpg", popular: true },
      { id: "k3", name: "Americano", desc: "Espresso + air, hot/iced", price: 22000, image: "/menu/kopi-susu.jpg" },
      { id: "k4", name: "Cappuccino", desc: "Hot, foam susu segar", price: 28000, image: "/menu/kopi-susu.jpg" },
      { id: "k5", name: "Roti Bakar Coklat", desc: "Roti bakar isi coklat", price: 15000, image: "/menu/martabak-potong.jpg" },
    ],
  },
  {
    id: "warteg",
    name: "Warteg Bu Sari",
    category: "Nasi & Masakan",
    tags: ["Halal", "Terdekat"],
    cover: "/merchants/warteg.jpg",
    logoColor: "from-green-600 to-emerald-700",
    rating: 4.6,
    eta: "14 menit",
    distanceKm: 0.5,
    promo: "Hemat 10rb",
    menu: [
      { id: "w1", name: "Nasi Ayam Goreng", desc: "Nasi + ayam goreng + lalapan + sambal", price: 16000, image: "/menu/nasi-ayam.jpg", popular: true },
      { id: "w2", name: "Nasi Rendang", desc: "Nasi + rendang sapi + sayur", price: 20000, image: "/menu/nasi-ayam.jpg", popular: true },
      { id: "w3", name: "Nasi Ayam Bakar", desc: "Nasi + ayam bakar + lalapan", price: 17000, image: "/menu/nasi-ayam.jpg" },
      { id: "w4", name: "Nasi Telur Dadar", desc: "Nasi + telur dadar + sambal", price: 12000, image: "/menu/nasi-ayam.jpg" },
      { id: "w5", name: "Es Teh Manis", desc: "Gelas besar", price: 4000, image: "/menu/es-teh-gelas.jpg" },
    ],
  },
  {
    id: "bakso",
    name: "Bakso Cak Har",
    category: "Mie & Bakso",
    tags: ["Halal", "Favorit"],
    cover: "/merchants/bakso.jpg",
    logoColor: "from-rose-500 to-red-600",
    rating: 4.9,
    eta: "22 menit",
    distanceKm: 1.8,
    promo: "Diskon 20%",
    menu: [
      { id: "b1", name: "Bakso Spesial (10 pcs)", desc: "Bakso urat + tahu + bihun + kuah", price: 20000, image: "/menu/bakso-mangkok.jpg", popular: true },
      { id: "b2", name: "Mie Bakso (8 pcs)", desc: "Mie kuning + bakso + pangsit", price: 18000, image: "/menu/bakso-mangkok.jpg", popular: true },
      { id: "b3", name: "Bakso Urat Spesial", desc: "12 pcs bakso urat besar", price: 25000, image: "/menu/bakso-mangkok.jpg" },
      { id: "b4", name: "Pangsit Goreng (6 pcs)", desc: "Crispy pangsit goreng", price: 10000, image: "/menu/bakso-mangkok.jpg" },
      { id: "b5", name: "Es Teh Manis", desc: "Gelas besar", price: 5000, image: "/menu/es-teh-gelas.jpg" },
    ],
  },
  {
    id: "kfc",
    name: "CFD Fried Chicken",
    category: "Ayam",
    tags: ["Halal", "Promo"],
    cover: "/merchants/kfc.jpg",
    logoColor: "from-red-600 to-rose-700",
    rating: 4.7,
    eta: "20 menit",
    distanceKm: 1.4,
    promo: "Paket Hemat",
    menu: [
      { id: "f1", name: "Ayam Goreng (2 pcs) + Nasi", desc: "2 ayam + nasi + minum", price: 28000, image: "/menu/fried-chicken.jpg", popular: true },
      { id: "f2", name: "Bucket Ayam (6 pcs)", desc: "6 ayam goreng crispy", price: 65000, image: "/menu/fried-chicken.jpg", popular: true },
      { id: "f3", name: "Ayam Fillet Saus Keju", desc: "Fillet + saus keju + nasi", price: 25000, image: "/menu/fried-chicken.jpg" },
      { id: "f4", name: "Kentang Goreng", desc: "French fries besar", price: 12000, image: "/menu/fried-chicken.jpg" },
      { id: "f5", name: "Es Teh/Cola", desc: "Minuman dingin", price: 7000, image: "/menu/es-teh-gelas.jpg" },
    ],
  },
];

export const MERCHANT_CATEGORIES = [
  { id: "all", label: "Semua", icon: "UtensilsCrossed" },
  { id: "Promo", label: "Promo", icon: "Tag" },
  { id: "Terdekat", label: "Terdekat", icon: "MapPin" },
  { id: "Favorit", label: "Favorit", icon: "Star" },
  { id: "Baru", label: "Baru", icon: "Sparkles" },
  { id: "Halal", label: "Halal", icon: "BadgeCheck" },
];
