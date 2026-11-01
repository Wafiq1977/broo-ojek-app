"use client";

import { motion } from "framer-motion";

interface BrooMapProps {
  stage: "form" | "searching" | "assigned" | "arrived" | "done";
  vehicleType?: "motor" | "mobil";
  className?: string;
}

// Bojonegoro city center coordinates
const BJN_LAT = -7.1500;
const BJN_LNG = 111.8817;
const BJN_ZOOM = 15;

/**
 * BrooMap — REAL map of Bojonegoro using OpenStreetMap embed (no API key needed).
 * Base: live OSM tiles via iframe. Overlay: animated route + driver marker (SVG).
 */
export default function BrooMap({ stage, vehicleType = "motor", className }: BrooMapProps) {
  // route overlay waypoints (pickup -> destination) within the overlay box
  // these animate the driver marker from bottom-left to top-right
  const bbox = `${BJN_LNG - 0.008}%2C${BJN_LAT - 0.008}%2C${BJN_LNG + 0.008}%2C${BJN_LAT + 0.008}`;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${BJN_LAT}%2C${BJN_LNG}`;

  return (
    <div className={`relative overflow-hidden bg-[#e8e4dc] ${className ?? ""}`}>
      {/* Real OpenStreetMap of Bojonegoro */}
      <iframe
        title="Peta Bojonegoro"
        src={osmSrc}
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
        loading="lazy"
      />
      {/* subtle top fade for label readability */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/25 to-transparent" />

      {/* Route overlay SVG (driver marker animation) */}
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {/* route line (orange dashed) */}
        <motion.path
          d="M 70 190 Q 130 150 180 150 T 300 70"
          fill="none"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          opacity={0.92}
        />
        {/* route glow */}
        <path
          d="M 70 190 Q 130 150 180 150 T 300 70"
          fill="none"
          stroke="#F97316"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* pickup marker */}
        <g transform="translate(70 190)">
          <circle r="12" fill="#10b981" opacity="0.25" className="animate-pulse" />
          <circle r="8" fill="#10b981" stroke="#fff" strokeWidth="2.5" />
          <circle r="3" fill="#fff" />
        </g>

        {/* destination pin */}
        <g transform="translate(300 70)">
          <path
            d="M0 -14 C -7 -14 -11 -9 -11 -3 C -11 4 0 12 0 12 C 0 12 11 4 11 -3 C 11 -9 7 -14 0 -14 Z"
            fill="#F97316"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle r="3.5" cy="-3" fill="#fff" />
        </g>

        {/* moving driver marker */}
        {stage !== "form" && stage !== "searching" && (
          <motion.g
            initial={{ x: 70, y: 190 }}
            animate={{
              x: stage === "assigned" ? 180 : 300,
              y: stage === "assigned" ? 150 : 70,
            }}
            transition={{ duration: stage === "arrived" ? 1.6 : 1.2, ease: "easeInOut" }}
          >
            <circle r="17" fill="#F97316" opacity="0.2" />
            <circle r="13" fill="#fff" stroke="#F97316" strokeWidth="2.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="15">
              {vehicleType === "mobil" ? "🚗" : "🛵"}
            </text>
          </motion.g>
        )}
      </svg>

      {/* status chip */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
        {stage === "assigned" ? "Driver menuju jemput" : stage === "arrived" ? "Driver tiba di lokasi" : "Selesai"}
      </div>
    </div>
  );
}
