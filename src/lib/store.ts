import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ServiceId, OrderType } from "./broo-data";

export type AppPhase = "splash" | "promo" | "onboarding" | "auth" | "app";
export type Tab = "home" | "booking" | "history" | "chat";
export type Modal =
  | null
  | "driver-info"
  | "order-flow"
  | "profile"
  | "notifications"
  | "driver-apply-success";

export interface BrooUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  address?: string;
  provider: "phone" | "google";
}

export interface OrderDraft {
  service: ServiceId;
  orderType: OrderType;
  pickup: string;
  destination: string;
  detail?: string;
  km: number;
  paymentMethod: "cash" | "wallet" | "qris";
  note?: string;
  scheduledAt?: string; // ISO for booking
}

interface ChatOpen {
  conversationId: string;
  driverName: string;
  driverPhoto?: string;
  service: string;
}

interface BrooState {
  // lifecycle
  phase: AppPhase;
  promoSeen: boolean;

  // user
  user: BrooUser | null;
  isRegistered: boolean;

  // navigation
  activeTab: Tab;
  modal: Modal;
  chatOpen: ChatOpen | null;

  // order draft
  draft: OrderDraft | null;

  // refresh trigger for lists
  historyNonce: number;
  chatNonce: number;

  // actions
  setPhase: (p: AppPhase) => void;
  markPromoSeen: () => void;
  setUser: (u: BrooUser) => void;
  logout: () => void;
  setTab: (t: Tab) => void;
  openModal: (m: Modal) => void;
  closeModal: () => void;
  openChat: (c: ChatOpen) => void;
  closeChat: () => void;
  startDraft: (d: OrderDraft) => void;
  clearDraft: () => void;
  bumpHistory: () => void;
  bumpChat: () => void;
}

export const useBroo = create<BrooState>()(
  persist(
    (set) => ({
      phase: "splash",
      promoSeen: false,
      user: null,
      isRegistered: false,
      activeTab: "home",
      modal: null,
      chatOpen: null,
      draft: null,
      historyNonce: 0,
      chatNonce: 0,

      setPhase: (p) => set({ phase: p }),
      markPromoSeen: () => set({ promoSeen: true }),
      setUser: (u) => set({ user: u, isRegistered: true }),
      logout: () =>
        set({
          user: null,
          isRegistered: false,
          phase: "onboarding",
          activeTab: "home",
          modal: null,
          chatOpen: null,
          draft: null,
        }),
      setTab: (t) => set({ activeTab: t, modal: null }),
      openModal: (m) => set({ modal: m }),
      closeModal: () => set({ modal: null }),
      openChat: (c) => set({ chatOpen: c }),
      closeChat: () => set({ chatOpen: null }),
      startDraft: (d) => set({ draft: d, modal: "order-flow" }),
      clearDraft: () => set({ draft: null, modal: null }),
      bumpHistory: () => set((s) => ({ historyNonce: s.historyNonce + 1 })),
      bumpChat: () => set((s) => ({ chatNonce: s.chatNonce + 1 })),
    }),
    {
      name: "broo-app",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        promoSeen: s.promoSeen,
        user: s.user,
        isRegistered: s.isRegistered,
      }),
    }
  )
);
