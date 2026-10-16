"use client";

import { useEffect } from "react";
import { LinkButton } from "../ui";
import type { ExerciseProps } from "./types";
import { BINGO_POOL } from "@/lib/content";
import { haptic } from "@/lib/native";
import { bingoHasLine, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/** The bingo card lives all day; rewards are granted by the store when a line lands. */
export default function RealityBingo({ setProgress }: ExerciseProps) {
  const bingo = useApp((s) => s.bingo);
  const toggle = useApp((s) => s.toggleBingo);
  const ensureDaily = useApp((s) => s.ensureDaily);

  useEffect(() => ensureDaily(), [ensureDaily]);
  useEffect(() => setProgress(((bingo?.marked.length ?? 0) / 9) * 100), [bingo, setProgress]);

  if (!bingo) return null;
  const line = bingoHasLine(bingo.marked);

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-center font-display text-2xl font-bold">Today&apos;s card</h2>
      <p className="mt-1 text-center text-muted">
        Do these out in real life, then tap to mark. Get three in a row for a bingo. New card tomorrow.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2.5" role="grid" aria-label="Reality bingo card">
        {bingo.cells.map((id, i) => {
          const cell = BINGO_POOL.find((c) => c.id === id)!;
          const on = bingo.marked.includes(i);
          return (
            <button
              key={id}
              role="gridcell"
              aria-pressed={on}
              aria-label={`${cell.label}${on ? ", done" : ""}`}
              onClick={() => {
                haptic(on ? "soft" : "tap");
                toggle(i);
              }}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl border p-2 text-center text-[12px] font-semibold leading-tight transition active:scale-95",
                on
                  ? "border-transparent bg-gradient-to-br from-mint-300 to-mint-400 text-midnight-800 shadow-md"
                  : "border-line bg-surface hover:border-lavender-300",
              )}
            >
              <span className={cn("text-2xl", on && "animate-pop")} aria-hidden>
                {on ? "✓" : cell.emoji}
              </span>
              {cell.label}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm font-semibold" aria-live="polite">
        {line ? "🎯 Bingo! You collected real moments today." : `${bingo.marked.length} of 9 marked`}
      </p>
      <p className="mt-1 text-center text-xs text-muted">Honour system. Nobody&apos;s checking — this one&apos;s just for you.</p>
      <div className="mt-auto pt-6">
        <LinkButton href="/" block size="lg" variant={line ? "primary" : "soft"}>
          {line ? "Back home" : "I'll come back later"}
        </LinkButton>
      </div>
    </div>
  );
}
