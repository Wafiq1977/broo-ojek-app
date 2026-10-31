import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Broo — Ojek Online dari Rakyat untuk Rakyat",
  description:
    "Broo: aplikasi ojek online tanpa potongan biaya. MotorBro, MobilBro, MakanBro, TitipBro, TolongBro. Lebih murah untuk kamu, lebih adil untuk driver.",
  keywords: [
    "Broo",
    "ojek online",
    "antar makanan",
    "jastip",
    "MotorBro",
    "MobilBro",
    "MakanBro",
    "TitipBro",
    "TolongBro",
  ],
  authors: [{ name: "Broo" }],
  applicationName: "Broo",
  icons: {
    icon: "/broo-logo.png",
    apple: "/broo-logo.png",
  },
  openGraph: {
    title: "Broo — Ojek Online dari Rakyat untuk Rakyat",
    description:
      "Tanpa potongan biaya. Lebih murah untuk kamu, 100% untuk driver.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
