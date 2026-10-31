"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBroo } from "@/lib/store";
import BottomNav from "./BottomNav";
import HomeScreen from "./screens/HomeScreen";
import BookingScreen from "./screens/BookingScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ChatScreen from "./screens/ChatScreen";
import DriverRegisterInfo from "./DriverRegisterInfo";
import OrderFlow from "./OrderFlow";
import ChatDetailOverlay from "./ChatDetailOverlay";
import { ProfileSheet, NotificationsSheet, ApplySuccessModal } from "./Overlays";

export default function AppShell() {
  const activeTab = useBroo((s) => s.activeTab);
  const modal = useBroo((s) => s.modal);
  const draft = useBroo((s) => s.draft);
  const chatOpen = useBroo((s) => s.chatOpen);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
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
          </motion.div>
        </AnimatePresence>

        {/* modals */}
        <AnimatePresence>
          {modal === "profile" && <ProfileSheet key="profile" />}
          {modal === "notifications" && <NotificationsSheet key="notif" />}
          {modal === "driver-info" && <DriverRegisterInfo key="driver" />}
          {modal === "driver-apply-success" && <ApplySuccessModal key="ok" />}
        </AnimatePresence>

        {/* order flow drawer */}
        <AnimatePresence>{draft && <OrderFlow key="order" />}</AnimatePresence>

        {/* chat overlay (global) */}
        <AnimatePresence>{chatOpen && <ChatDetailOverlay key="chat" />}</AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
