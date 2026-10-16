"use client";

import { useState } from "react";
import PinPad from "../PinPad";
import { Modal, Toggle } from "../ui";
import { createLock, verifyPin } from "@/lib/lock";
import { haptic } from "@/lib/native";
import { useApp } from "@/lib/store";

type Flow = null | "create" | "confirm" | "disable";

export default function LockSettings() {
  const lock = useApp((s) => s.settings.lock);
  const updateSettings = useApp((s) => s.updateSettings);
  const toast = useApp((s) => s.toast);
  const [flow, setFlow] = useState<Flow>(null);
  const [first, setFirst] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setFlow(null);
    setFirst("");
    setError(null);
  };

  const onPin = async (pin: string) => {
    if (flow === "create") {
      setFirst(pin);
      setError(null);
      setFlow("confirm");
    } else if (flow === "confirm") {
      if (pin !== first) {
        setError("Those didn't match. Let's start again.");
        setFirst("");
        setFlow("create");
        return;
      }
      updateSettings({ lock: await createLock(pin) });
      haptic("success");
      toast("PIN lock is on.", "🔒");
      close();
    } else if (flow === "disable" && lock) {
      if (await verifyPin(pin, lock)) {
        updateSettings({ lock: null });
        toast("PIN lock is off.", "🔓");
        close();
      } else {
        setError("That PIN isn't right.");
      }
    }
  };

  return (
    <>
      <Toggle
        checked={Boolean(lock)}
        onChange={(on) => setFlow(on ? "create" : "disable")}
        label="PIN lock"
        description="Ask for a 4-digit PIN when the app opens or after 30 seconds away. Keeps casual peekers out — it isn't encryption."
      />
      <Modal open={flow !== null} onClose={close} title="PIN lock">
        <h2 className="text-center font-display text-xl font-bold">
          {flow === "create" ? "Choose a 4-digit PIN" : flow === "confirm" ? "Type it once more" : "Enter your current PIN"}
        </h2>
        <p className="mb-6 mt-1 text-center text-sm text-muted">
          {flow === "disable"
            ? "To turn the lock off."
            : "There's no way to recover a forgotten PIN — your data only lives on this device."}
        </p>
        <PinPad key={flow ?? "none"} label="PIN" onComplete={onPin} error={error} />
      </Modal>
    </>
  );
}
