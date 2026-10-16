"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "../ui";
import type { ExerciseProps } from "./types";
import { haptic } from "@/lib/native";
import { KIND_LABEL, getSubtle, pickUnstuck, setSubtle as saveSubtle, type UnstuckActivity } from "@/lib/unstuck";
import { cn } from "@/lib/utils";

const R = 54;
const CIRC = 2 * Math.PI * R;

/** "I'm stuck in my head": a different tiny reset every time, with a reroll. */
export default function Unstuck({ onDone, setProgress }: ExerciseProps) {
  const router = useRouter();
  const [subtle, setSubtle] = useState(false);
  const [act, setAct] = useState<UnstuckActivity | null>(null);
  const [tried, setTried] = useState<UnstuckActivity[]>([]);
  const [left, setLeft] = useState<number | null>(null);
  const [phase, setPhase] = useState<"do" | "check">("do");

  // Picked on the client only: the choice is random and reads on-device history.
  useEffect(() => {
    const s = getSubtle();
    setSubtle(s);
    setAct(pickUnstuck({ subtle: s }));
  }, []);

  const running = left !== null && left > 0;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      const next = (left ?? 1) - 1;
      setLeft(next);
      if (next === 0) {
        haptic("success");
        setPhase("check");
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [left, running]);

  useEffect(() => {
    if (!act) return;
    if (phase === "check") setProgress(100);
    else if (act.seconds && left !== null) setProgress(((act.seconds - left) / act.seconds) * 100);
    else setProgress(5);
  }, [act, left, phase, setProgress]);

  const next = (opts: { subtle?: boolean; keepTried?: boolean } = {}) => {
    if (!act) return;
    const useSubtle = opts.subtle ?? subtle;
    haptic("tap");
    setAct(pickUnstuck({ subtle: useSubtle, exclude: [act.id, ...tried.map((a) => a.id)], lastKind: act.kind }));
    setLeft(null);
    setPhase("do");
  };

  const finish = () => {
    if (!act) return;
    setLeft(null);
    haptic("success");
    setPhase("check");
  };

  const allTried = act && !tried.some((a) => a.id === act.id) ? [...tried, act] : tried;

  if (!act) return <div className="flex-1" aria-busy="true" />;

  return (
    <div className="flex flex-1 flex-col">
      <AnimatePresence mode="wait">
        {phase === "do" ? (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-muted">
                <span aria-hidden>{KIND_LABEL[act.kind].emoji} </span>
                {KIND_LABEL[act.kind].label}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={subtle}
                onClick={() => {
                  const v = !subtle;
                  setSubtle(v);
                  saveSubtle(v);
                  if (v && !act.discreet) next({ subtle: true });
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  subtle ? "border-lavender-500 bg-lavender-500 text-white dark:border-lavender-300 dark:bg-lavender-300 dark:text-midnight-900" : "border-line bg-surface text-muted",
                )}
              >
                <span aria-hidden>🤫 </span>In public{subtle ? " · on" : ""}
              </button>
            </div>

            <div className="mt-6 text-center">
              {act.seconds && left !== null ? (
                <div className="relative mx-auto h-36 w-36" role="timer" aria-live="off" aria-label={`${left} seconds left`}>
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
                    <circle cx="60" cy="60" r={R} fill="none" strokeWidth="9" className="stroke-surface-2" />
                    <circle
                      cx="60"
                      cy="60"
                      r={R}
                      fill="none"
                      strokeWidth="9"
                      strokeLinecap="round"
                      className="stroke-coral-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (left / act.seconds)}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="text-3xl" aria-hidden>{act.emoji}</span>
                    <span className="absolute bottom-7 font-display text-lg font-extrabold tabular-nums">{left}s</span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-coral-300 to-butter-300 text-6xl shadow-lg" aria-hidden>
                  <span className="animate-float">{act.emoji}</span>
                </div>
              )}
              <h2 className="mt-5 font-display text-3xl font-extrabold">{act.title}</h2>
            </div>

            <ol className="mt-6 space-y-3">
              {act.steps.map((step, i) => (
                <li key={i} className="flex gap-3 rounded-3xl border border-line bg-surface p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lavender-100 text-sm font-bold text-lavender-700 dark:bg-midnight-500 dark:text-lavender-200">
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-snug">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-center text-sm text-muted">
              <span className="font-semibold">Why it works:</span> {act.why}
            </p>

            <div className="mt-auto space-y-2 pt-6">
              {act.href ? (
                <Button block size="lg" variant="coral" onClick={() => router.replace(act.href!)}>
                  Start it
                </Button>
              ) : act.seconds && left === null ? (
                <Button
                  block
                  size="lg"
                  variant="coral"
                  onClick={() => {
                    haptic("tap");
                    setLeft(act.seconds!);
                  }}
                >
                  Start · {act.seconds}s
                </Button>
              ) : (
                <Button block size="lg" variant={running ? "soft" : "coral"} onClick={finish}>
                  {running ? "I'm done early" : "Done"}
                </Button>
              )}
              <Button block variant="ghost" onClick={() => next()}>
                <Shuffle size={16} aria-hidden /> Give me a different one
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="check"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col text-center"
          >
            <div className="text-6xl" aria-hidden>
              {act.emoji}
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold">How&apos;s your head now?</h2>
            <p className="mt-2 text-muted">Any answer is fine. Sometimes it takes a couple of goes.</p>
            {allTried.length > 1 && (
              <p className="mt-4 text-sm text-muted">
                Tried so far: {allTried.map((a) => `${a.emoji} ${a.title}`).join(" · ")}
              </p>
            )}
            <div className="mt-auto space-y-2 pt-8">
              <Button
                block
                size="lg"
                onClick={() => onDone(`Unstuck reset — tried: ${allTried.map((a) => a.title).join(", ")}`)}
              >
                A bit better
              </Button>
              <Button
                block
                size="lg"
                variant="soft"
                onClick={() => {
                  setTried(allTried);
                  next();
                }}
              >
                Still stuck — one more
              </Button>
              {allTried.length >= 3 && (
                <div className="rounded-3xl border border-line bg-surface p-4 text-sm">
                  Still loud in there? That happens.{" "}
                  <Link href="/exercise/parking" className="font-semibold text-lavender-600 underline dark:text-lavender-300">
                    Park the thought
                  </Link>{" "}
                  or{" "}
                  <Link href="/companion" className="font-semibold text-lavender-600 underline dark:text-lavender-300">
                    talk it through
                  </Link>
                  .
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
