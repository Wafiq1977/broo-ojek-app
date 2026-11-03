"use client";

import { motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import { BrooIcon } from "./BrooIcon";
import { SERVICES } from "@/lib/broo-data";

// Services shown in the "Lainnya" bottom sheet
const MORE_SERVICES = SERVICES.filter(
  (s) => ["KirimBro", "BelanjaBro", "LaundryBro", "BensinBro", "SehatBro"].includes(s.id)
);

export default function MoreServicesOverlay() {
  const closeModal = useBroo((s) => s.closeModal);
  const startDraft = useBroo((s) => s.startDraft);

  const pickService = (id: typeof MORE_SERVICES[number]["id"]) => {
    startDraft({
      service: id,
      orderType: "now",
      pickup: "Lokasi kamu sekarang",
      destination: "",
      km: 0,
      paymentMethod: "cash",
    });
    closeModal();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
      className="absolute inset-0 z-[75] flex items-end bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-[2rem] bg-background p-5 pb-8 safe-bottom"
      >
        {/* handle */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />

        {/* header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <BrooIcon name="MoreHorizontal" className="h-5 w-5" />
          </div>
          <h3 className="text-base font-black text-foreground">Layanan Lainnya</h3>
        </div>

        {/* services grid */}
        <div className="grid grid-cols-4 gap-3">
          {MORE_SERVICES.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => pickService(s.id)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-broo`}>
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
                <BrooIcon name={s.icon} className="relative h-6 w-6" strokeWidth={2.2} />
              </div>
              <span className="text-[9px] font-bold leading-tight text-foreground text-center">
                {s.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* descriptions */}
        <div className="mt-4 space-y-2">
          {MORE_SERVICES.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2">
              <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${s.color} text-white`}>
                <BrooIcon name={s.icon} className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">{s.name} — {s.tagline}</p>
                <p className="text-[10px] text-muted-foreground">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={closeModal}
          className="mt-4 w-full rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground tap-scale"
        >
          Tutup
        </button>
      </motion.div>
    </motion.div>
  );
}
