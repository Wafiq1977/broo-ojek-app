"use client";

import { motion } from "framer-motion";
import { BrooIcon } from "./BrooIcon";

interface ServiceIconProps {
  icon: string;
  gradient: string; // tailwind gradient classes — used to derive text color
  size?: number;
  className?: string;
  glow?: boolean;
}

// Map gradient classes -> solid text color class (the icon's brand color)
const GRAD_TO_TEXT: Record<string, string> = {
  "from-orange-400 to-orange-600": "text-orange-500",
  "from-amber-400 to-orange-500": "text-amber-500",
  "from-rose-400 to-red-500": "text-rose-500",
  "from-emerald-400 to-green-600": "text-emerald-500",
  "from-violet-400 to-purple-600": "text-violet-500",
};

/**
 * Standalone colored service icon — NO background box/wrapper.
 * Just the Lucide icon itself in the brand color, like Grab's launcher icons.
 * Bold, filled-look (fill = 15% brand color, stroke = full brand color).
 */
export function ServiceIcon({
  icon,
  gradient,
  size = 56,
  className = "",
  glow = false,
}: ServiceIconProps) {
  const textCls = GRAD_TO_TEXT[gradient] || "text-primary";
  return (
    <div
      className={`relative grid place-items-center ${glow ? "drop-shadow-[0_4px_12px_rgba(249,115,22,0.3)]" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <BrooIcon
        name={icon}
        className={`${textCls} transition-transform`}
        style={{ width: size * 0.78, height: size * 0.78 }}
        strokeWidth={2}
        fill="currentColor"
        fillOpacity={0.15}
      />
    </div>
  );
}

/** Small standalone colored icon (for lists, chips) */
export function ServiceIconMini({
  icon,
  gradient,
  className = "",
}: {
  icon: string;
  gradient: string;
  className?: string;
}) {
  const textCls = GRAD_TO_TEXT[gradient] || "text-primary";
  return (
    <BrooIcon
      name={icon}
      className={`${textCls} ${className}`}
      strokeWidth={2.2}
      fill="currentColor"
      fillOpacity={0.15}
    />
  );
}

/** Wave toggle indicator for active state (kept for compat) */
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
