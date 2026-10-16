"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import { Chip, PageHeader, SectionTitle } from "@/components/ui";
import { CATEGORIES, EXERCISES, EXERCISE_MAP, WEEKLY_ADVENTURES, type ExerciseCategory } from "@/lib/content";
import { recommendFor } from "@/lib/recommend";
import { useApp } from "@/lib/store";
import { cn, dayKey, startOfWeek, weekIndex } from "@/lib/utils";

export default function Explore() {
  const profile = useApp((s) => s.profile);
  const completions = useApp((s) => s.completions);
  const [cat, setCat] = useState<ExerciseCategory | "all">("all");
  const [fits, setFits] = useState(false);

  const today = dayKey();
  const doneToday = new Set(completions.filter((c) => dayKey(c.at) === today).map((c) => c.exerciseId));
  const weekStart = startOfWeek().getTime();
  const doneThisWeek = new Set(completions.filter((c) => c.at >= weekStart).map((c) => c.exerciseId));
  const adventure = WEEKLY_ADVENTURES[weekIndex() % WEEKLY_ADVENTURES.length];
  const adventureDone = adventure.exercises.filter((id) => doneThisWeek.has(id)).length;

  const forYou = useMemo(
    () => recommendFor(profile.goals, profile.feeling, profile.sessionLength).slice(0, 4),
    [profile.goals, profile.feeling, profile.sessionLength],
  );

  const list = EXERCISES.filter((e) => (cat === "all" || e.category === cat) && (!fits || e.seconds <= profile.sessionLength * 1.5));

  return (
    <div>
      <PageHeader title="Explore" subtitle="Exercises, mini-games and real-world challenges." />

      {/* Weekly adventure */}
      <section className="mt-3 overflow-hidden rounded-4xl bg-gradient-to-br from-lavender-500 to-coral-400 p-5 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">This week&apos;s adventure</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold">
          {adventure.emoji} {adventure.title}
        </h2>
        <p className="text-white/85">{adventure.blurb}</p>
        <ul className="mt-4 space-y-2">
          {adventure.exercises.map((id) => {
            const e = EXERCISE_MAP[id];
            const done = doneThisWeek.has(id);
            return (
              <li key={id}>
                <Link
                  href={`/exercise/${id}`}
                  className={cn("flex items-center gap-3 rounded-2xl bg-white/15 px-3 py-2.5 font-semibold transition hover:bg-white/25", done && "opacity-75")}
                >
                  <span aria-hidden>{e.emoji}</span>
                  <span className={cn("flex-1", done && "line-through")}>{e.title}</span>
                  <span aria-label={done ? "done this week" : "not done yet"}>{done ? "✓" : "→"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm font-semibold text-white/90">
          {adventureDone === 3 ? "Adventure complete. Legendary." : `${adventureDone}/3 done · no deadline, no pressure`}
        </p>
      </section>

      {/* Touch grass */}
      <Link
        href="/touch-grass"
        className="mt-4 flex items-center gap-4 rounded-4xl border border-mint-400 bg-mint-200/50 p-5 transition hover:bg-mint-200 dark:bg-mint-600/15 dark:hover:bg-mint-600/25"
      >
        <span className="text-4xl" aria-hidden>🌱</span>
        <span className="flex-1">
          <span className="block font-display text-lg font-bold">Touch Grass mode</span>
          <span className="block text-sm text-muted">Activities to do outside the app. Literally.</span>
        </span>
        <span aria-hidden className="text-xl">→</span>
      </Link>

      <SectionTitle>For you</SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {forYou.map((id) => (
          <ExerciseCard key={id} exercise={EXERCISE_MAP[id]} done={doneToday.has(id)} compact />
        ))}
      </div>

      <SectionTitle>Everything</SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} className="shrink-0">
            {c.label}
          </Chip>
        ))}
        <Chip active={fits} onClick={() => setFits(!fits)} className="shrink-0" emoji="⏱">
          Fits my time
        </Chip>
      </div>
      {list.length ? (
        <div className="mt-4 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          {list.map((e) => (
            <ExerciseCard key={e.id} exercise={e} done={doneToday.has(e.id)} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-3xl bg-surface-2 p-5 text-center text-sm text-muted">
          Nothing in this category fits your usual time. Turn off &ldquo;Fits my time&rdquo; to see everything.
        </p>
      )}
    </div>
  );
}
