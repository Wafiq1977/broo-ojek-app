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
 * Professional service icon: Lucide icon on a gradient tile with gloss + inner ring.
 * Replaces childish emoji with smooth, realistic, professional iconography.
 */
export function ServiceIcon({
  icon,
  gradient,
  size = 62,
  className = "",
  glow = false,
}: ServiceIconProps) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} shadow-broo ${glow ? "shadow-broo-primary" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* gloss highlight (top half) */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
      {/* inner ring */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
      <BrooIcon
        name={icon}
        className="relative text-white drop-shadow-sm"
        style={{ width: size * 0.45, height: size * 0.45 }}
        strokeWidth={2}
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
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
      <BrooIcon name={icon} className="relative h-[18px] w-[18px]" strokeWidth={2.1} />
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
