"use client";

import { motion } from "framer-motion";
import { BrooIcon } from "./BrooIcon";

interface BrooMapProps {
  stage: "form" | "searching" | "assigned" | "arrived" | "done";
  vehicleType?: "motor" | "mobil";
  className?: string;
}

/**
 * BrooMap — stylized but realistic navigation map (self-contained, no network).
 * Shows streets, blocks, park, water, a route line from pickup to destination,
 * pickup marker, destination pin, and a moving driver marker along the route.
 */
export default function BrooMap({ stage, vehicleType = "motor", className }: BrooMapProps) {
  // route path (pickup -> destination). Coordinate space 0..400 (w) x 0..240 (h)
  const route = "M 70 190 Q 110 150 150 160 T 230 120 Q 270 100 300 70";

  return (
    <div className={`relative overflow-hidden bg-[#e8e4dc] ${className ?? ""}`}>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* base land */}
        <rect width="400" height="240" fill="#e9e5dd" />

        {/* water area (river) */}
        <path
          d="M -10 240 Q 80 180 140 220 Q 200 255 280 200 Q 340 165 410 220 L 410 250 L -10 250 Z"
          fill="#bfe0e8"
          opacity="0.9"
        />
        <path
          d="M -10 240 Q 80 180 140 220 Q 200 255 280 200 Q 340 165 410 220"
          fill="none"
          stroke="#9fcad6"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* park / green blocks */}
        <rect x="20" y="20" width="60" height="50" rx="6" fill="#cfe8c2" />
        <rect x="290" y="150" width="70" height="55" rx="6" fill="#cfe8c2" />

        {/* building blocks (subtle) */}
        {[
          [100, 30, 30, 22],
          [140, 25, 26, 28],
          [175, 35, 32, 20],
          [220, 28, 24, 30],
          [255, 40, 30, 22],
          [300, 30, 28, 26],
          [340, 35, 30, 24],
          [95, 75, 26, 24],
          [130, 80, 30, 20],
          [180, 78, 28, 26],
          [250, 80, 30, 24],
          [290, 95, 26, 22],
          [330, 90, 30, 26],
          [20, 90, 30, 24],
          [60, 95, 26, 22],
          [20, 130, 26, 26],
          [60, 135, 30, 22],
          [330, 200, 26, 22],
          [120, 200, 24, 20],
          [160, 195, 26, 22],
          [200, 180, 24, 20],
        ].map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx="3"
            fill="#dcd7cc"
            stroke="#c9c3b6"
            strokeWidth="0.5"
          />
        ))}

        {/* street grid — minor */}
        <g stroke="#f4f1ea" strokeWidth="6" strokeLinecap="round">
          <line x1="0" y1="60" x2="400" y2="60" />
          <line x1="0" y1="115" x2="400" y2="115" />
          <line x1="0" y1="170" x2="400" y2="170" />
          <line x1="90" y1="0" x2="90" y2="240" />
          <line x1="190" y1="0" x2="190" y2="240" />
          <line x1="280" y1="0" x2="280" y2="240" />
        </g>
        <g stroke="#eae5da" strokeWidth="3" strokeLinecap="round">
          <line x1="0" y1="30" x2="400" y2="30" />
          <line x1="0" y1="90" x2="400" y2="90" />
          <line x1="0" y1="145" x2="400" y2="145" />
          <line x1="0" y1="200" x2="400" y2="200" />
          <line x1="40" y1="0" x2="40" y2="240" />
          <line x1="140" y1="0" x2="140" y2="240" />
          <line x1="235" y1="0" x2="235" y2="240" />
          <line x1="335" y1="0" x2="335" y2="240" />
        </g>

        {/* main road (thicker, lighter) */}
        <path
          d="M 70 190 Q 110 150 150 160 T 230 120 Q 270 100 300 70"
          fill="none"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 70 190 Q 110 150 150 160 T 230 120 Q 270 100 300 70"
          fill="none"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* route line (orange) */}
        <motion.path
          d={route}
          fill="none"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: stage === "form" ? 0.3 : 0 }}
          animate={{ pathLength: stage === "arrived" || stage === "done" ? 1 : stage === "assigned" ? 0.65 : 0.35 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* destination pin (top of route) */}
        <g transform="translate(300 70)">
          <circle r="11" fill="#F97316" opacity="0.25" />
          <path
            d="M0 -14 C -7 -14 -11 -9 -11 -3 C -11 4 0 12 0 12 C 0 12 11 4 11 -3 C 11 -9 7 -14 0 -14 Z"
            fill="#F97316"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle r="3.5" cy="-3" fill="#fff" />
        </g>

        {/* pickup marker (start of route) */}
        <g transform="translate(70 190)">
          <circle r="12" fill="#10b981" opacity="0.25" />
          <circle r="8" fill="#10b981" stroke="#fff" strokeWidth="2.5" />
          <circle r="3" fill="#fff" />
        </g>

        {/* moving driver marker — animate along route waypoints */}
        {stage !== "form" && stage !== "searching" && (
          <motion.g
            initial={{ x: 70, y: 190 }}
            animate={{
              x: stage === "assigned" ? 215 : 300,
              y: stage === "assigned" ? 125 : 70,
            }}
            transition={{ duration: stage === "arrived" ? 1.6 : 1.2, ease: "easeInOut" }}
          >
            {/* driver halo */}
            <circle r="17" fill="#F97316" opacity="0.18" />
            <circle r="13" fill="#fff" stroke="#F97316" strokeWidth="2.5" />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="15"
            >
              {vehicleType === "mobil" ? "🚗" : "🛵"}
            </text>
          </motion.g>
        )}
      </svg>

      {/* top fade for readability when overlaid */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/10 to-transparent" />
    </div>
  );
}
