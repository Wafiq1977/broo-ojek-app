import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ServiceId, OrderType, Merchant, MenuItem } from "./broo-data";

export type AppPhase = "splash" | "onboarding" | "app";
export type Tab = "home" | "booking" | "history" | "chat" | "admin";
export type Modal =
  | null
  | "driver-info"
  | "order-flow"
  | "profile"
  | "notifications"
  | "driver-apply-success"
  | "merchant-detail"
  | "merchant-list";

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
  paymentMethod: "cash" | "qris";
  note?: string;
  scheduledAt?: string; // ISO for booking
  // food order extras
  merchantId?: string;
  merchantName?: string;
  cartItems?: CartItem[];
  cartTotal?: number;
}

export interface CartItem {
  item: MenuItem;
  qty: number;
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
  // promo popup — session only (resets each app open, not persisted)
  homePromoSeen: boolean;
  // order tracking minimized (so user can access navbar)
  orderMinimized: boolean;

  // user
  user: BrooUser | null;
  isRegistered: boolean;

  // navigation
  activeTab: Tab;
  modal: Modal;
  chatOpen: ChatOpen | null;

  // order draft
  draft: OrderDraft | null;

  // makanbro
  activeMerchant: Merchant | null;
  cart: CartItem[];
  cartMerchantId: string | null;

  // refresh trigger for lists
  historyNonce: number;
  chatNonce: number;

  // actions
  setPhase: (p: AppPhase) => void;
  markHomePromoSeen: () => void;
  minimizeOrder: () => void;
  expandOrder: () => void;
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
  // merchant/cart
  openMerchant: (m: Merchant) => void;
  closeMerchant: () => void;
  addToCart: (item: MenuItem) => void;
  decFromCart: (itemId: string) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
}

function cartAdd(cart: CartItem[], item: MenuItem, merchantId: string): CartItem[] {
  const existing = cart.find((c) => c.item.id === item.id);
  if (existing) {
    return cart.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
  }
  return [...cart, { item, qty: 1 }];
}

function cartDec(cart: CartItem[], itemId: string): CartItem[] {
  const existing = cart.find((c) => c.item.id === itemId);
  if (!existing) return cart;
  if (existing.qty <= 1) return cart.filter((c) => c.item.id !== itemId);
  return cart.map((c) => (c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c));
}

export const useBroo = create<BrooState>()(
  persist(
    (set) => ({
      phase: "splash",
      homePromoSeen: false,
      orderMinimized: false,
      user: null,
      isRegistered: false,
      activeTab: "home",
      modal: null,
      chatOpen: null,
      draft: null,
      activeMerchant: null,
      cart: [],
      cartMerchantId: null,
      historyNonce: 0,
      chatNonce: 0,

      setPhase: (p) => set({ phase: p }),
      markHomePromoSeen: () => set({ homePromoSeen: true }),
      minimizeOrder: () => set({ orderMinimized: true }),
      expandOrder: () => set({ orderMinimized: false }),
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
          activeMerchant: null,
          cart: [],
          cartMerchantId: null,
          homePromoSeen: false,
          orderMinimized: false,
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
      openMerchant: (m) => set({ activeMerchant: m, modal: "merchant-detail" }),
      closeMerchant: () => set({ activeMerchant: null, modal: null }),
      addToCart: (item) =>
        set((s) => ({
          cart: cartAdd(s.cart, item, s.activeMerchant?.id || ""),
          cartMerchantId: s.cartMerchantId || s.activeMerchant?.id || null,
        })),
      decFromCart: (itemId) =>
        set((s) => ({ cart: cartDec(s.cart, itemId) })),
      removeCartItem: (itemId) =>
        set((s) => ({ cart: s.cart.filter((c) => c.item.id !== itemId) })),
      clearCart: () => set({ cart: [], cartMerchantId: null }),
    }),
    {
      name: "broo-app",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        isRegistered: s.isRegistered,
      }),
    }
  )
);

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((a, c) => a + c.qty, 0);
}
export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((a, c) => a + c.qty * c.item.price, 0);
}
