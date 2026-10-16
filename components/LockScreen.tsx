"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Mascot from "./Mascot";
import PinPad from "./PinPad";
import { Button, Modal, TextInput } from "./ui";
import { verifyPin } from "@/lib/lock";
import { haptic } from "@/lib/native";
import { useApp } from "@/lib/store";

const MAX_TRIES = 5;
const COOLDOWN_MS = 30_000;

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const lock = useApp((s) => s.settings.lock);
  const name = useApp((s) => s.profile.companionName);
  const resetAll = useApp((s) => s.resetAll);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [forgot, setForgot] = useState(false);
  const [confirm, setConfirm] = useState("");

  const coolingDown = now < cooldownUntil;
  useEffect(() => {
    if (!coolingDown) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [coolingDown]);

  if (!lock) return null;

  const check = async (pin: string) => {
    if (await verifyPin(pin, lock)) {
      haptic("success");
      onUnlock();
      return;
    }
    const n = tries + 1;
    setTries(n);
    if (n >= MAX_TRIES) {
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      setNow(Date.now());
      setTries(0);
      setError("Too many tries — take a breath and try again in 30s.");
    } else {
      setError(`Not quite. ${MAX_TRIES - n} ${MAX_TRIES - n === 1 ? "try" : "tries"} left before a short pause.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-between overflow-y-auto bg-bg px-6 py-10" role="dialog" aria-modal="true" aria-label="App locked">
      <div className="flex flex-col items-center text-center">
        <Mascot size={110} mood="calm" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Enter your PIN — {name} kept your journal safe.</p>
      </div>

      <PinPad
        label="Enter PIN"
        onComplete={check}
        error={coolingDown ? `Paused for ${Math.ceil((cooldownUntil - now) / 1000)}s` : error}
        disabled={coolingDown}
      />

      <div className="flex flex-col items-center gap-3 text-sm">
        <Link href="/support" className="font-semibold text-coral-500 underline">
          Need help right now? Get support
        </Link>
        <button onClick={() => setForgot(true)} className="text-muted underline">
          Forgot PIN?
        </button>
      </div>

      <Modal open={forgot} onClose={() => setForgot(false)} title="Forgot PIN">
        <h2 className="font-display text-xl font-bold">Forgot your PIN?</h2>
        <p className="mt-2 text-muted">
          Your data only lives on this phone and there&apos;s no account to recover it from. The only way in is to erase everything and start fresh. If you have a backup file, you can restore it afterwards in Settings.
        </p>
        <label htmlFor="erase" className="mb-1.5 mt-4 block text-sm font-semibold">
          Type <span className="font-mono">erase</span> to confirm
        </label>
        <TextInput id="erase" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="soft" onClick={() => setForgot(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={confirm.trim().toLowerCase() !== "erase"}
            onClick={() => {
              resetAll();
              setForgot(false);
              // With no profile left, the app shell routes to onboarding.
              onUnlock();
            }}
          >
            Erase & restart
          </Button>
        </div>
      </Modal>
    </div>
  );
}
