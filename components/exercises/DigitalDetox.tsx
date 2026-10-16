"use client";

import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Button, Chip, TextArea } from "../ui";
import type { ExerciseProps } from "./types";
import { haptic } from "@/lib/native";
import { useApp } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

const OPTIONS = [
  { min: 2, needs: 0 },
  { min: 5, needs: 2 },
  { min: 10, needs: 5 },
  { min: 15, needs: 10 },
  { min: 20, needs: 10 },
];

const NOTICES = [
  "It felt weird at first",
  "I noticed sounds",
  "My mind wandered",
  "I felt calmer",
  "I really wanted to check my phone",
  "Time felt slower",
  "I noticed my surroundings",
  "I got bored (that's good!)",
];

function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 1.3);
    });
    navigator.vibrate?.([120, 80, 120]);
  } catch {
    /* sound is a nice-to-have */
  }
}

export default function DigitalDetox({ onDone, setProgress }: ExerciseProps) {
  const best = useApp((s) => s.detoxBest);
  const recordDetox = useApp((s) => s.recordDetox);
  const [minutes, setMinutes] = useState(2);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const [phase, setPhase] = useState<"choose" | "running" | "reflect">("choose");
  const [actualMin, setActualMin] = useState(0);
  const [notices, setNotices] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== "running" || !endAt) return;
    const tick = () => {
      const remaining = Math.max(0, (endAt - Date.now()) / 1000);
      setLeft(remaining);
      setProgress(100 - (remaining / (minutes * 60)) * 100);
      if (remaining <= 0) {
        chime();
        haptic("success");
        recordDetox(minutes);
        setActualMin(minutes);
        setPhase("reflect");
      }
    };
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [phase, endAt, minutes, recordDetox, setProgress]);

  if (phase === "choose") {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-center text-6xl" aria-hidden>📵</div>
        <h2 className="mt-4 text-center font-display text-2xl font-bold">A tiny phone-free challenge</h2>
        <p className="mt-1 text-center text-muted">
          Start the timer, then put your phone face-down (or in another room). We&apos;ll chime when time&apos;s up. Totally voluntary — stop whenever.
        </p>
        <p className="mb-2 mt-8 text-sm font-semibold">How long?</p>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((o) => {
            const locked = best < o.needs;
            return (
              <Chip
                key={o.min}
                active={minutes === o.min}
                disabled={locked}
                onClick={() => setMinutes(o.min)}
                className={cn(locked && "cursor-not-allowed opacity-50")}
                aria-label={locked ? `${o.min} minutes, unlocks after a ${o.needs}-minute session` : `${o.min} minutes`}
              >
                {locked && <Lock size={12} aria-hidden />}
                {o.min} min
              </Chip>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">Longer sessions unlock as you go. Starting small is the whole strategy.</p>
        <div className="mt-6 rounded-3xl bg-surface-2 p-4 text-sm">
          <p className="font-semibold">While you&apos;re away, maybe:</p>
          <p className="mt-1 text-muted">Look out a window · stretch · make a drink · just sit. Boredom is allowed.</p>
        </div>
        <div className="mt-auto pt-6">
          <Button
            block
            size="lg"
            onClick={() => {
              startRef.current = Date.now();
              setEndAt(Date.now() + minutes * 60000);
              setLeft(minutes * 60);
              setPhase("running");
            }}
          >
            Start {minutes}-minute detox
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "running") {
    return (
      <div className="-mx-5 -mb-8 flex flex-1 flex-col items-center justify-center rounded-t-4xl bg-gradient-to-b from-midnight-600 to-midnight-800 px-6 pb-10 text-center text-white">
        <div className="text-6xl animate-float" aria-hidden>🌙</div>
        <p className="mt-6 font-display text-6xl font-extrabold tabular-nums" aria-live="off">
          {formatClock(left)}
        </p>
        <h2 className="mt-4 font-display text-2xl font-bold">Put your phone down.</h2>
        <p className="mt-2 max-w-xs text-lavender-200">We&apos;ll be right here. Go notice what&apos;s happening around you.</p>
        <Button
          variant="ghost"
          className="mt-12 text-lavender-200 hover:bg-white/10"
          onClick={() => {
            const mins = Math.floor((Date.now() - startRef.current) / 60000);
            if (mins > 0) recordDetox(Math.min(mins, minutes));
            setActualMin((Date.now() - startRef.current) / 60000);
            setPhase("reflect");
          }}
        >
          End early (that&apos;s okay)
        </Button>
      </div>
    );
  }

  const fullTime = actualMin >= minutes;
  return (
    <div className="flex flex-1 flex-col">
      <div className="text-center text-5xl animate-pop" aria-hidden>{fullTime ? "🏆" : "🌱"}</div>
      <h2 className="mt-3 text-center font-display text-2xl font-bold">
        {fullTime ? `${minutes} minutes, phone-free.` : "Even a little bit counts."}
      </h2>
      <p className="mt-1 text-center text-muted">What did you notice when you stopped scrolling?</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {NOTICES.map((n) => (
          <Chip key={n} active={notices.includes(n)} onClick={() => setNotices(notices.includes(n) ? notices.filter((x) => x !== n) : [...notices, n])}>
            {n}
          </Chip>
        ))}
      </div>
      <TextArea className="mt-4" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else? (optional)" maxLength={600} />
      <div className="mt-auto pt-6">
        <Button
          block
          size="lg"
          onClick={() =>
            onDone(
              [`Phone-free for ${actualMin >= 1 ? `${Math.round(actualMin)} min` : "under a minute"}.`, notices.length ? `Noticed: ${notices.join(", ")}.` : "", note.trim()]
                .filter(Boolean)
                .join("\n"),
            )
          }
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
