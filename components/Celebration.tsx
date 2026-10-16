"use client";

import { useEffect, useState } from "react";
import Confetti from "./Confetti";
import RewardSummary from "./RewardSummary";
import { Button, Modal } from "./ui";
import { OFFLINE_ACTIONS } from "@/lib/content";
import { haptic } from "@/lib/native";
import { useApp } from "@/lib/store";

export default function Celebration() {
  const celebration = useApp((s) => s.celebration);
  const dismiss = useApp((s) => s.dismissCelebration);
  const [offline, setOffline] = useState(OFFLINE_ACTIONS[0]);
  useEffect(() => {
    if (celebration) haptic("success");
    if (celebration) setOffline(OFFLINE_ACTIONS[Math.floor(Math.random() * OFFLINE_ACTIONS.length)]);
  }, [celebration]);

  if (!celebration) return null;
  return (
    <Modal open onClose={dismiss} title={celebration.title}>
      <Confetti />
      <h2 className="mb-4 text-center font-display text-2xl font-extrabold">{celebration.title} 🎉</h2>
      <RewardSummary reward={celebration} />
      <p className="mt-5 rounded-3xl bg-surface-2 p-4 text-center text-sm">
        <span className="font-semibold">Offline side-quest:</span> {offline}
      </p>
      <Button block size="lg" className="mt-5" onClick={dismiss}>
        Nice
      </Button>
    </Modal>
  );
}
