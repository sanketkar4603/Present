"use client";

import Link from "next/link";
import { Clock, Footprints } from "lucide-react";
import type { ExerciseMeta } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function ExerciseCard({
  exercise,
  done,
  compact,
}: {
  exercise: ExerciseMeta;
  done?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/exercise/${exercise.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-4xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
        compact ? "w-56 shrink-0" : "",
      )}
    >
      <div
        className={cn(
          "mb-3 grid h-24 place-items-center rounded-3xl bg-gradient-to-br text-5xl",
          exercise.gradient,
        )}
        aria-hidden
      >
        <span className="transition group-hover:scale-110 group-hover:animate-bob">{exercise.emoji}</span>
      </div>
      <h3 className="font-display text-[17px] font-bold leading-snug">{exercise.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{exercise.tagline}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1">
          <Clock size={12} aria-hidden /> {exercise.durationLabel}
        </span>
        {exercise.realWorld && (
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-200/70 px-2.5 py-1 text-mint-600 dark:bg-mint-600/20 dark:text-mint-300">
            <Footprints size={12} aria-hidden /> Real world
          </span>
        )}
        <span className="rounded-full bg-butter-200/70 px-2.5 py-1 text-coral-600 dark:bg-butter-400/15 dark:text-butter-300">
          +{exercise.xp} XP
        </span>
        {done && <span className="text-mint-600 dark:text-mint-300">✓ done today</span>}
      </div>
    </Link>
  );
}
