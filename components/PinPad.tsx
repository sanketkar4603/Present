"use client";

import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { PIN_LENGTH } from "@/lib/lock";
import { haptic } from "@/lib/native";
import { cn } from "@/lib/utils";

/**
 * Numeric keypad that calls `onComplete` once PIN_LENGTH digits are entered.
 * The parent decides what happens; pass `error` to shake and clear the dots.
 */
export default function PinPad({
  onComplete,
  error,
  disabled,
  label,
}: {
  onComplete: (pin: string) => void;
  error?: string | null;
  disabled?: boolean;
  label: string;
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!error) return;
    setShake(true);
    setPin("");
    const t = setTimeout(() => setShake(false), 450);
    return () => clearTimeout(t);
  }, [error]);

  const press = (d: string) => {
    if (disabled || pin.length >= PIN_LENGTH) return;
    haptic("soft");
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        onComplete(next);
        setPin("");
      }, 120);
    }
  };

  // Physical keyboards (and screen readers with a keyboard) work too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn("flex gap-4", shake && "animate-[shake_0.4s_ease-in-out]")}
        role="status"
        aria-label={`${label}. ${pin.length} of ${PIN_LENGTH} digits entered.`}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-4 w-4 rounded-full border-2 transition",
              i < pin.length ? "scale-110 border-lavender-500 bg-lavender-500" : "border-muted/50",
            )}
          />
        ))}
      </div>
      <p className="mt-3 h-5 text-sm font-semibold text-coral-500" aria-live="assertive">
        {error ?? ""}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <Key key={d} onClick={() => press(d)} disabled={disabled}>
            {d}
          </Key>
        ))}
        <span />
        <Key onClick={() => press("0")} disabled={disabled}>
          0
        </Key>
        <button
          type="button"
          onClick={() => setPin((p) => p.slice(0, -1))}
          aria-label="Delete last digit"
          className="grid h-16 w-16 place-items-center rounded-full text-muted transition active:scale-90"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
}

function Key({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 font-display text-2xl font-bold transition active:scale-90 active:bg-lavender-200 disabled:opacity-40 dark:active:bg-midnight-400"
    >
      {children}
    </button>
  );
}
