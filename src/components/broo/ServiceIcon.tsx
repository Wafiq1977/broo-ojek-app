"use client";

import { motion } from "framer-motion";
import { BrooIcon } from "./BrooIcon";

interface ServiceIconProps {
  icon: string;
  gradient: string; // tailwind gradient classes e.g. "from-orange-400 to-orange-600"
  size?: number; // px, default 62
  className?: string;
  glow?: boolean;
}

/**
 * Premium 3D service icon — bold white Lucide icon on a rich gradient tile
 * with strong gloss highlight, inner ring, depth shadow, and subtle inner glow.
 * Modern app-icon aesthetic (Grab/Gojek style).
 */
export function ServiceIcon({
  icon,
  gradient,
  size = 64,
  className = "",
  glow = false,
}: ServiceIconProps) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${gradient} ${glow ? "shadow-broo-primary" : "shadow-broo"} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* top gloss highlight (bright) */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-white/55 via-white/15 to-transparent" />
      {/* inner ring */}
      <span className="pointer-events-none absolute inset-0 rounded-[1.4rem] ring-1 ring-inset ring-white/35" />
      {/* bottom depth shadow */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
      {/* subtle inner glow behind icon */}
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="h-1/2 w-1/2 rounded-full bg-white/15 blur-md" />
      </span>
      {/* the icon — bold white stroke */}
      <BrooIcon
        name={icon}
        className="relative text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]"
        style={{ width: size * 0.5, height: size * 0.5 }}
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </div>
  );
}

/** Small square icon tile (for category chips, lists) */
export function ServiceIconMini({
  icon,
  gradient,
  className = "",
}: {
  icon: string;
  gradient: string;
  className?: string;
}) {
  return (
    <div
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient} text-white shadow-broo ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
      <BrooIcon
        name={icon}
        className="relative h-[18px] w-[18px] drop-shadow-sm"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </div>
  );
}

/** Wave toggle indicator for active state (liquid shimmer) */
export function WaveIndicator({
  active,
  className = "",
}: {
  active: boolean;
  className?: string;
}) {
  if (!active) return null;
  return (
    <motion.span
      layoutId="wave-indicator"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-xl bg-broo-gradient shadow-broo-primary ${className}`}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    >
      <span className="broo-wave-shimmer" />
    </motion.span>
  );
}
