"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { Button, TextArea } from "../ui";
import type { ExerciseProps } from "./types";
import type { GuidedExercise, GuidedStep } from "@/lib/guided";
import { requestNotificationPermission } from "@/lib/native";
import { useApp } from "@/lib/store";
import { cn, formatClock } from "@/lib/utils";

type Answers = Record<string, string | string[]>;

export default function Guided({
  def,
  onDone,
  setProgress,
}: ExerciseProps & { def: GuidedExercise }) {
  const addReminder = useApp((s) => s.addReminder);
  const [index, setIndex] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Answers>({});
  const advancing = useRef(false);
  const step = index >= 0 ? def.steps[index] : null;

  useEffect(() => {
    setProgress(index < 0 ? 0 : (index / def.steps.length) * 100);
  }, [index, def.steps.length, setProgress]);

  const finish = (final: Answers) => {
    if (def.id === "futureme") scheduleFutureMe(final, addReminder);
    onDone(summarise(def, final));
  };

  const next = (final = answers) => {
    if (index >= def.steps.length - 1) finish(final);
    else setIndex(index + 1);
    advancing.current = false;
  };

  const set = (key: string, value: string | string[]) => setAnswers((a) => ({ ...a, [key]: value }));

  if (!step) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="mt-2 text-lg leading-relaxed">{def.intro}</p>
        <p className="mt-4 text-sm text-muted">
          Every question is optional. Skip anything, stop any time — your answers stay on this device.
        </p>
        <div className="mt-auto pt-8">
          <Button block size="lg" onClick={() => setIndex(0)}>
            Let&apos;s start
          </Button>
        </div>
      </div>
    );
  }

  const value = "key" in step ? answers[step.key] : undefined;
  const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value && String(value).trim());

  return (
    <div className="flex flex-1 flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Step {index + 1} of {def.steps.length}
          </p>
          <StepView step={step} value={value} onChange={set} onAutoNext={(v) => {
            // Single choices advance automatically for a snappier feel.
            if ("key" in step && !advancing.current) {
              advancing.current = true;
              const final = { ...answers, [step.key]: v };
              setAnswers(final);
              setTimeout(() => next(final), 260);
            }
          }} />
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto flex gap-3 pt-8">
        {index > 0 && (
          <Button variant="ghost" size="lg" onClick={() => setIndex(index - 1)}>
            Back
          </Button>
        )}
        {step.type === "timer" || step.type === "info" ? (
          <Button block size="lg" onClick={() => next()}>
            {index === def.steps.length - 1 ? "Finish" : "Continue"}
          </Button>
        ) : (
          <Button block size="lg" variant={hasValue ? "primary" : "soft"} onClick={() => next()}>
            {hasValue ? (index === def.steps.length - 1 ? "Finish" : "Next") : "Skip this one"}
          </Button>
        )}
      </div>
    </div>
  );
}

function StepView({
  step,
  value,
  onChange,
  onAutoNext,
}: {
  step: GuidedStep;
  value: string | string[] | undefined;
  onChange: (key: string, v: string | string[]) => void;
  onAutoNext: (v: string) => void;
}) {
  switch (step.type) {
    case "info":
      return (
        <div className="mt-6 text-center">
          {step.emoji && <div className="text-6xl animate-float" aria-hidden>{step.emoji}</div>}
          <h2 className="mt-5 font-display text-2xl font-bold">{step.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted">{step.body}</p>
        </div>
      );
    case "text":
      return (
        <div className="mt-2">
          <h2 className="font-display text-2xl font-bold leading-snug">{step.title}</h2>
          {step.body && <p className="mt-1 text-muted">{step.body}</p>}
          <TextArea
            className="mt-5"
            rows={4}
            autoFocus
            aria-label={step.title}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(step.key, e.target.value)}
            placeholder={step.placeholder}
            maxLength={1500}
          />
          {step.hint && <p className="mt-2 text-sm text-muted">💡 {step.hint}</p>}
        </div>
      );
    case "choice": {
      const selected = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <div className="mt-2">
          <h2 className="font-display text-2xl font-bold leading-snug">{step.title}</h2>
          {step.body && <p className="mt-1 text-muted">{step.body}</p>}
          <div
            role={step.multi ? "group" : "radiogroup"}
            aria-label={step.title}
            className={cn(
              "mt-5 grid gap-2.5",
              step.columns === 3 ? "grid-cols-3" : step.columns === 2 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {step.options.map((o) => {
              const on = selected.includes(o.id);
              return (
                <button
                  key={o.id}
                  role={step.multi ? "checkbox" : "radio"}
                  aria-checked={on}
                  onClick={() => {
                    if (step.multi) {
                      onChange(step.key, on ? selected.filter((x) => x !== o.id) : [...selected, o.id]);
                    } else {
                      onChange(step.key, o.id);
                      onAutoNext(o.id);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-3xl border text-left font-semibold transition active:scale-[0.98]",
                    step.columns === 3 ? "flex-col justify-center p-3 text-center text-sm" : "p-4",
                    on ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line bg-surface hover:border-lavender-300",
                  )}
                >
                  {o.emoji && <span className={step.columns === 3 ? "text-3xl" : "text-2xl"} aria-hidden>{o.emoji}</span>}
                  <span className="flex-1">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "checklist": {
      const selected = (value as string[]) ?? [];
      return (
        <div className="mt-2">
          <h2 className="font-display text-2xl font-bold">{step.title}</h2>
          {step.body && <p className="mt-1 text-muted">{step.body}</p>}
          <ul className="mt-5 space-y-2">
            {step.items.map((it) => {
              const on = selected.includes(it.id);
              return (
                <li key={it.id}>
                  <button
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => onChange(step.key, on ? selected.filter((x) => x !== it.id) : [...selected, it.id])}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-3xl border p-3.5 text-left font-semibold transition",
                      on ? "border-mint-400 bg-mint-200/60 dark:bg-mint-600/20" : "border-line bg-surface",
                    )}
                  >
                    <span className="text-2xl" aria-hidden>{it.emoji}</span>
                    <span className="flex-1">{it.label}</span>
                    <span className={cn("grid h-6 w-6 place-items-center rounded-full border-2", on ? "border-mint-500 bg-mint-500 text-white" : "border-line")} aria-hidden>
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    case "timer":
      return <TimerStep key={step.title} step={step} />;
  }
}

function TimerStep({ step }: { step: Extract<GuidedStep, { type: "timer" }> }) {
  const [left, setLeft] = useState(step.seconds);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, paused]);
  const pct = ((step.seconds - left) / step.seconds) * 100;
  return (
    <div className="mt-4 flex flex-col items-center text-center">
      <div className="relative grid h-40 w-40 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-2)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#a68cf3"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="text-5xl" aria-hidden>{left <= 0 ? "✓" : step.emoji}</span>
      </div>
      <p className="mt-2 font-mono text-sm text-muted">{left > 0 ? formatClock(left) : "Take your time"}</p>
      <h2 className="mt-4 font-display text-2xl font-bold">{step.title}</h2>
      <p className="mt-2 max-w-sm text-muted">{step.body}</p>
      {left > 0 && (
        <button onClick={() => setPaused((p) => !p)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-600 dark:text-lavender-300">
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />} {paused ? "Resume" : "Pause"}
        </button>
      )}
    </div>
  );
}

function labelFor(step: GuidedStep, id: string): string {
  if (step.type === "choice") return step.options.find((o) => o.id === id)?.label ?? id;
  if (step.type === "checklist") return step.items.find((o) => o.id === id)?.label ?? id;
  return id;
}

function summarise(def: GuidedExercise, answers: Answers): string | undefined {
  const lines: string[] = [];
  for (const step of def.steps) {
    if (!("key" in step)) continue;
    const v = answers[step.key];
    if (!v || (Array.isArray(v) && !v.length) || (typeof v === "string" && !v.trim())) continue;
    const text = Array.isArray(v) ? v.map((id) => labelFor(step, id)).join(", ") : step.type === "text" ? v.trim() : labelFor(step, v);
    lines.push(`${step.title}\n→ ${text}`);
  }
  return lines.length ? lines.join("\n\n") : undefined;
}

function scheduleFutureMe(answers: Answers, addReminder: (text: string, dueAt: number) => void) {
  const def = { water: "Put a glass of water by the bed", clothes: "Lay out tomorrow's clothes", reply: "Reply to that one message", tidy: "Do a 10-minute tidy", bed: "Go to bed 20 minutes earlier", outside: "Step outside first thing", snack: "Prep a snack or lunch", top1: "Write down tomorrow's top 1 task" } as Record<string, string>;
  const action = (answers.custom as string)?.trim() || def[answers.action as string];
  const when = answers.reminder as string;
  if (!action || !when || when === "none") return;
  const due = new Date();
  if (when === "hour") due.setHours(due.getHours() + 1);
  if (when === "evening") {
    due.setHours(20, 0, 0, 0);
    if (due.getTime() < Date.now()) due.setDate(due.getDate() + 1);
  }
  if (when === "morning") {
    due.setDate(due.getDate() + 1);
    due.setHours(9, 0, 0, 0);
  }
  addReminder(action, due.getTime());
  // Ask in context: they just chose to be reminded. In-app reminders work either way.
  void requestNotificationPermission();
}
