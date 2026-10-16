"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button, TextInput } from "../ui";
import type { ExerciseProps } from "./types";
import { haptic } from "@/lib/native";
import { cn } from "@/lib/utils";

const SENSES = [
  {
    count: 5,
    sense: "see",
    emoji: "👀",
    prompt: "Look around. Find five things you can see.",
    examples: "A shadow, a colour, something tiny, something far away…",
    alt: "Can't see much right now? Notice five things you can hear or feel instead.",
    color: "from-lavender-300 to-lavender-400",
  },
  {
    count: 4,
    sense: "feel",
    emoji: "✋",
    prompt: "Notice four things you can feel physically.",
    examples: "Your feet on the floor, fabric on your skin, the air temperature…",
    alt: "Prefer not to focus on your body? Touch four nearby objects and notice their texture.",
    color: "from-mint-300 to-mint-400",
  },
  {
    count: 3,
    sense: "hear",
    emoji: "👂",
    prompt: "Listen for three things you can hear.",
    examples: "Traffic, a fridge hum, your own breathing, birds…",
    alt: "Can't hear much? Notice three things you can see moving, or three thoughts passing by like clouds.",
    color: "from-butter-300 to-coral-300",
  },
  {
    count: 2,
    sense: "smell",
    emoji: "👃",
    prompt: "Find two things you can smell.",
    examples: "Your sleeve, a drink, the air near a window…",
    alt: "Nothing to smell? Remember two smells you love — fresh bread, rain, a favourite candle.",
    color: "from-coral-300 to-coral-400",
  },
  {
    count: 1,
    sense: "taste",
    emoji: "👅",
    prompt: "Notice one thing you can taste.",
    examples: "Toothpaste, your last drink, or just the taste of your mouth.",
    alt: "Can't taste anything? Take a sip of water, or name a taste you're looking forward to.",
    color: "from-lavender-400 to-mint-300",
  },
];

export default function Grounding({ onDone, setProgress }: ExerciseProps) {
  const [stage, setStage] = useState(0);
  const [tapped, setTapped] = useState(0);
  const [useAlt, setUseAlt] = useState(false);
  const [names, setNames] = useState<string[][]>(SENSES.map(() => []));
  const [draft, setDraft] = useState("");

  const s = SENSES[stage];
  const total = SENSES.reduce((a, x) => a + x.count, 0);
  const doneBefore = SENSES.slice(0, stage).reduce((a, x) => a + x.count, 0);

  useEffect(() => {
    setProgress(((doneBefore + tapped) / total) * 100);
  }, [doneBefore, tapped, total, setProgress]);

  const tap = (label?: string) => {
    if (tapped >= s.count) return;
    // Unnamed taps keep a slot so names line up with their circles.
    const nextNames = names.map((arr, i) => (i === stage ? [...arr, label ?? ""] : arr));
    setNames(nextNames);
    const nextTapped = tapped + 1;
    haptic(nextTapped >= s.count ? "success" : "tap");
    setTapped(nextTapped);
    setDraft("");
    if (nextTapped >= s.count) {
      setTimeout(() => {
        if (stage === SENSES.length - 1) {
          const summary = SENSES.map((x, i) => {
            const named = nextNames[i].filter(Boolean);
            return named.length ? `${x.emoji} ${named.join(", ")}` : null;
          })
            .filter(Boolean)
            .join("\n");
          onDone(summary ? `Things I noticed:\n${summary}` : undefined);
        } else {
          setStage(stage + 1);
          setTapped(0);
          setUseAlt(false);
        }
      }, 650);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex flex-1 flex-col"
        >
          <div className="text-center">
            <div className={cn("mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br text-5xl shadow-lg", s.color)} aria-hidden>
              {s.emoji}
            </div>
            <p className="mt-5 font-display text-6xl font-extrabold text-lavender-600 dark:text-lavender-300" aria-hidden>
              {s.count}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold" aria-live="polite">
              {useAlt ? s.alt : s.prompt}
            </h2>
            {!useAlt && <p className="mt-2 text-sm text-muted">{s.examples}</p>}
          </div>

          <div className="my-8 flex flex-wrap justify-center gap-3" aria-label={`${tapped} of ${s.count} found`}>
            {Array.from({ length: s.count }).map((_, i) => {
              const done = i < tapped;
              const label = names[stage][i];
              return (
                <button
                  key={i}
                  onClick={() => !done && tap()}
                  disabled={done}
                  aria-label={done ? `Found ${i + 1}${label ? `: ${label}` : ""}` : `Tap when you've found number ${i + 1}`}
                  className={cn(
                    "grid h-16 min-w-16 place-items-center rounded-full border-2 px-3 text-sm font-semibold transition-all",
                    done
                      ? "scale-105 border-transparent bg-gradient-to-br from-mint-300 to-mint-400 text-midnight-800 shadow-md"
                      : "border-dashed border-lavender-300 bg-surface text-muted hover:scale-105 hover:border-lavender-500",
                    i === tapped && "animate-pulse",
                  )}
                >
                  {done ? label || "✓" : i + 1}
                </button>
              );
            })}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) tap(draft.trim());
            }}
          >
            <TextInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Name it (optional)"
              aria-label={`Name something you can ${s.sense}`}
              maxLength={40}
            />
            <Button type="submit" variant="soft" disabled={!draft.trim()}>
              Add
            </Button>
          </form>

          <button onClick={() => setUseAlt((v) => !v)} className="mx-auto mt-5 text-sm font-semibold text-lavender-600 underline-offset-4 hover:underline dark:text-lavender-300">
            {useAlt ? "Back to the original prompt" : `Can't ${s.sense} anything right now?`}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
