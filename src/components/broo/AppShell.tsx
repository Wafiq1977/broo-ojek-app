"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import BottomNav from "./BottomNav";
import HomeScreen from "./screens/HomeScreen";
import BookingScreen from "./screens/BookingScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ChatScreen from "./screens/ChatScreen";
import AdminScreen from "./screens/AdminScreen";
import DriverRegisterInfo from "./DriverRegisterInfo";
import OrderFlow from "./OrderFlow";
import MerchantDetail from "./MerchantDetail";
import MerchantListOverlay from "./MerchantListOverlay";
import ChatDetailOverlay from "./ChatDetailOverlay";
import MoreServicesOverlay from "./MoreServicesOverlay";
import PromoPopup from "./PromoPopup";
import { ProfileSheet, NotificationsSheet, ApplySuccessModal } from "./Overlays";
import { BrooIcon } from "./BrooIcon";

export default function AppShell() {
  const activeTab = useBroo((s) => s.activeTab);
  const modal = useBroo((s) => s.modal);
  const draft = useBroo((s) => s.draft);
  const chatOpen = useBroo((s) => s.chatOpen);
  const homePromoSeen = useBroo((s) => s.homePromoSeen);
  const orderMinimized = useBroo((s) => s.orderMinimized);
  const expandOrder = useBroo((s) => s.expandOrder);

  const showPromo = !homePromoSeen;
  const promoActive = showPromo && activeTab === "home";
  // OrderFlow always mounted but hidden when minimized (preserves tracking state)
  const showOrderFlow = draft;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden isolate">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0"
          >
            {activeTab === "home" && <HomeScreen />}
            {activeTab === "booking" && <BookingScreen />}
            {activeTab === "history" && <HistoryScreen />}
            {activeTab === "chat" && <ChatScreen />}
            {activeTab === "admin" && <AdminScreen />}
          </motion.div>
        </AnimatePresence>

        {/* modals */}
        <AnimatePresence>
          {modal === "profile" && <ProfileSheet key="profile" />}
          {modal === "notifications" && <NotificationsSheet key="notif" />}
          {modal === "driver-info" && <DriverRegisterInfo key="driver" />}
          {modal === "driver-apply-success" && <ApplySuccessModal key="ok" />}
          {modal === "merchant-list" && <MerchantListOverlay key="mlist" />}
          {modal === "merchant-detail" && <MerchantDetail key="merchant" />}
          {modal === "more-services" && <MoreServicesOverlay key="more" />}
        </AnimatePresence>

        {/* order flow — always mounted, hidden via CSS when minimized to preserve state */}
        <AnimatePresence>
          {showOrderFlow && (
            <div key="order-wrap" className={orderMinimized ? "pointer-events-none opacity-0" : ""}>
              <OrderFlow />
            </div>
          )}
        </AnimatePresence>

        {/* chat overlay (global) */}
        <AnimatePresence>{chatOpen && <ChatDetailOverlay key="chat" />}</AnimatePresence>

        {/* promo popup — fullscreen, hides navbar entirely while active */}
        <AnimatePresence>
          {promoActive && <PromoPopup key="promo" />}
        </AnimatePresence>
      </div>

      {/* minimized order bar — floats above navbar, always clickable */}
      <AnimatePresence>
        {draft && orderMinimized && !promoActive && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={expandOrder}
            className="absolute bottom-16 left-3 right-3 z-40 flex items-center gap-3 rounded-2xl bg-broo-gradient p-3 text-white shadow-broo-lg tap-scale"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
              <BrooIcon name="Navigation" className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-bold">Pesanan aktif</p>
              <p className="text-[10px] text-white/80">Driver dalam perjalanan — ketuk untuk lihat</p>
            </div>
            <BrooIcon name="ChevronUp" className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navbar — hidden entirely when promo popup is active */}
      <AnimatePresence>
        {!promoActive && (
          <motion.div
            key="navbar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
