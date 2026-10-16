"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button, Chip } from "../ui";
import type { ExerciseProps } from "./types";
import { haptic } from "@/lib/native";
import { useApp } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

const DURATIONS = [
  { s: 30, label: "30 sec" },
  { s: 60, label: "1 min" },
  { s: 120, label: "2 min" },
];

type Phase = { label: string; secs: number; scale: number };

const PATTERNS: { id: string; label: string; hint: string; phases: Phase[] }[] = [
  {
    id: "calm",
    label: "Calm",
    hint: "In 4 · out 6",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Breathe out", secs: 6, scale: 0.55 },
    ],
  },
  {
    id: "even",
    label: "Even",
    hint: "In 4 · out 4",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Breathe out", secs: 4, scale: 0.55 },
    ],
  },
  {
    id: "box",
    label: "Box",
    hint: "In 4 · hold 4 · out 4 · hold 4",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Hold gently", secs: 4, scale: 1 },
      { label: "Breathe out", secs: 4, scale: 0.55 },
      { label: "Hold gently", secs: 4, scale: 0.55 },
    ],
  },
];

export default function Breathing({ onDone, setProgress }: ExerciseProps) {
  const reducedSetting = useApp((s) => s.settings.reducedMotion);
  const [duration, setDuration] = useState(60);
  const [patternId, setPatternId] = useState("calm");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [natural, setNatural] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(false);
  const last = useRef<number | null>(null);

  useEffect(() => {
    setReduced(reducedSetting || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [reducedSetting]);

  const pattern = PATTERNS.find((p) => p.id === patternId)!;
  const cycle = pattern.phases.reduce((a, p) => a + p.secs, 0);

  useEffect(() => {
    if (!running || paused) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (t: number) => {
      if (last.current != null) {
        const dt = (t - last.current) / 1000;
        setElapsed((e) => Math.min(duration, e + dt));
      }
      last.current = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, paused, duration]);

  useEffect(() => {
    setProgress(running ? (elapsed / duration) * 100 : 0);
    if (running && elapsed >= duration) {
      setRunning(false);
      onDone(`Breathed for ${formatClock(duration)} (${pattern.label.toLowerCase()} rhythm).`);
    }
  }, [elapsed, duration, running, setProgress, onDone, pattern.label]);

  // Where are we in the breathing cycle?
  let t = elapsed % cycle;
  let phase = pattern.phases[0];
  let phaseLeft = phase.secs;
  let phaseIndex = 0;
  for (const [i, p] of pattern.phases.entries()) {
    if (t < p.secs) {
      phase = p;
      phaseLeft = p.secs - t;
      phaseIndex = i;
      break;
    }
    t -= p.secs;
  }

  // A soft tick at each phase change, so you can follow along with eyes closed.
  const phaseKey = running && !paused && !natural ? `${Math.floor(elapsed / cycle)}:${phaseIndex}` : "";
  useEffect(() => {
    if (phaseKey) haptic("soft");
  }, [phaseKey]);

  if (!running) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mx-auto mt-4 grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-mint-300 via-lavender-300 to-lavender-400 opacity-90 shadow-[0_0_60px_rgba(166,140,243,0.5)] animate-float" aria-hidden>
          <span className="text-5xl">🫧</span>
        </div>
        <h2 className="mt-8 text-center font-display text-2xl font-bold">Follow the bubble.</h2>
        <p className="mt-1 text-center text-muted">Breathe in as it grows, out as it shrinks. Gentle is the goal — never force it.</p>

        <p className="mb-2 mt-8 text-sm font-semibold">How long?</p>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <Chip key={d.s} active={duration === d.s} onClick={() => setDuration(d.s)}>
              {d.label}
            </Chip>
          ))}
        </div>
        <p className="mb-2 mt-6 text-sm font-semibold">Rhythm</p>
        <div className="grid grid-cols-3 gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPatternId(p.id)}
              aria-pressed={patternId === p.id}
              className={cn(
                "rounded-3xl border p-3 text-left transition",
                patternId === p.id ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line bg-surface",
              )}
            >
              <span className="block font-semibold">{p.label}</span>
              <span className="block text-xs text-muted">{p.hint}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto pt-8">
          <Button
            block
            size="lg"
            onClick={() => {
              setElapsed(0);
              setRunning(true);
              setPaused(false);
              setNatural(false);
            }}
          >
            Start breathing
          </Button>
        </div>
      </div>
    );
  }

  const scale = natural ? 0.8 : phase.scale;
  const transitionSecs = natural ? 3 : phase.label.startsWith("Hold") ? 0.3 : phase.secs;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative mt-6 grid h-72 w-72 place-items-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-lavender-300/50" aria-hidden />
        <div
          className={cn(
            "h-full w-full rounded-full bg-gradient-to-br from-mint-300 via-lavender-300 to-lavender-500 shadow-[0_0_80px_rgba(166,140,243,0.55)]",
            natural && !reduced && "animate-float",
          )}
          style={{
            transform: reduced ? "scale(0.8)" : `scale(${paused ? 0.75 : scale})`,
            opacity: reduced ? (phase.scale === 1 ? 1 : 0.55) : 0.95,
            transition: `transform ${transitionSecs}s ease-in-out, opacity ${transitionSecs}s ease-in-out`,
          }}
          aria-hidden
        />
        <div className="absolute text-center text-midnight-800">
          <p className="font-display text-2xl font-extrabold" aria-live="polite">
            {paused ? "Paused" : natural ? "Breathe naturally" : phase.label}
          </p>
          {!paused && !natural && <p className="text-lg font-bold opacity-70">{Math.ceil(phaseLeft)}</p>}
        </div>
      </div>

      <p className="mt-6 font-mono text-sm text-muted" aria-label={`${formatClock(duration - elapsed)} remaining`}>
        {formatClock(duration - elapsed)} left
      </p>
      {natural && (
        <p className="mt-3 max-w-xs text-center text-sm text-muted">
          No counting. Breathe however feels comfortable — the timer just keeps you company.
        </p>
      )}

      <div className="mt-auto flex w-full flex-col gap-3 pt-8">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="soft" size="lg" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button variant="soft" size="lg" onClick={() => setNatural((n) => !n)}>
            {natural ? "Guide me again" : "Breathe naturally"}
          </Button>
        </div>
        <Button variant="ghost" onClick={() => onDone(`Breathed for ${formatClock(elapsed)}.`)}>
          That&apos;s enough for now — finish
        </Button>
        <p className="text-center text-xs text-muted">Feeling dizzy or uncomfortable? Stop and breathe normally. That&apos;s always okay.</p>
      </div>
    </div>
  );
}
