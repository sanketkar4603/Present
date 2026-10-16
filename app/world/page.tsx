"use client";

import { useState } from "react";
import Island from "@/components/Island";
import { Card, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
import {
  ACHIEVEMENTS,
  COLLECTIBLES,
  STAGE_NAMES,
  companionStage,
  gentleRhythm,
  levelProgress,
} from "@/lib/gamification";
import { useApp } from "@/lib/store";
import { cn, dayKey, formatDay } from "@/lib/utils";

export default function World() {
  const xp = useApp((s) => s.xp);
  const items = useApp((s) => s.items);
  const achievements = useApp((s) => s.achievements);
  const activeDays = useApp((s) => s.activeDays);
  const completions = useApp((s) => s.completions);
  const companionName = useApp((s) => s.profile.companionName);
  const showStreaks = useApp((s) => s.settings.showStreaks);
  const [selected, setSelected] = useState<string | null>(null);

  const lvl = levelProgress(xp);
  const stage = companionStage(lvl.level);
  const today = dayKey();
  const rhythm = gentleRhythm(activeDays, today);
  const days = Array.from({ length: 28 }).map((_, i) => dayKey(Date.now() - (27 - i) * 86400000));
  const daySet = new Set(activeDays);
  const realWorld = completions.filter((c) => c.realWorld).length;
  const selectedItem = COLLECTIBLES.find((c) => c.id === selected);

  return (
    <div>
      <PageHeader title="My World" subtitle={`${companionName}'s island grows when you live a little.`} />

      <div className="mt-3">
        <Island items={items} level={lvl.level} />
      </div>

      <Card className="mt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Level {lvl.level}</p>
            <p className="font-display text-2xl font-extrabold">{lvl.name}</p>
          </div>
          <p className="text-right text-sm text-muted">
            {companionName} is a <span className="font-semibold text-ink">{STAGE_NAMES[stage]}</span>
            <br />
            {xp} XP total
          </p>
        </div>
        <ProgressBar value={lvl.pct} className="mt-3" label="Level progress" />
        <p className="mt-2 text-sm text-muted">
          {lvl.nextName ? `${lvl.toNext} XP until ${lvl.nextName}.` : "You've reached the top. The island is yours."} Levels come from exploring and reflecting — never from how you feel.
        </p>
      </Card>

      <SectionTitle>Days you showed up</SectionTitle>
      <Card>
        <div className="grid grid-cols-7 gap-1.5" role="img" aria-label={`Active on ${days.filter((d) => daySet.has(d)).length} of the last 28 days`}>
          {days.map((d) => (
            <div
              key={d}
              className={cn(
                "aspect-square rounded-lg",
                daySet.has(d) ? "bg-gradient-to-br from-mint-300 to-mint-400" : "bg-surface-2",
                d === today && "ring-2 ring-lavender-400",
              )}
              title={d}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          {showStreaks
            ? `Current rhythm: ${rhythm.days} day${rhythm.days === 1 ? "" : "s"}${rhythm.paused ? " (resting today — rest days pause it, they don't break it)" : ""}.`
            : `${activeDays.length} days total · ${realWorld} real-world experiences.`}{" "}
          Gaps are normal. Life happens offline too — that&apos;s literally the point.
        </p>
      </Card>

      <SectionTitle action={<span className="text-sm text-muted">{items.length}/{COLLECTIBLES.length}</span>}>Collectibles</SectionTitle>
      <div className="grid grid-cols-4 gap-2.5">
        {COLLECTIBLES.map((c) => {
          const have = items.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => setSelected(selected === c.id ? null : c.id)}
              aria-pressed={selected === c.id}
              aria-label={have ? c.name : `Locked: ${c.hint}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-3xl border text-3xl transition",
                have ? "border-line bg-surface hover:scale-105" : "border-dashed border-line bg-surface-2/60",
                selected === c.id && "ring-2 ring-lavender-400",
              )}
            >
              <span className={cn(!have && "opacity-30 grayscale")} aria-hidden>
                {have ? c.emoji : "❔"}
              </span>
            </button>
          );
        })}
      </div>
      {selectedItem && (
        <p className="mt-3 rounded-3xl bg-surface-2 p-4 text-sm animate-rise">
          {items.includes(selectedItem.id) ? (
            <>
              <span className="font-semibold">
                {selectedItem.emoji} {selectedItem.name}
              </span>{" "}
              — living on your island.
            </>
          ) : (
            <>
              <span className="font-semibold">Still hidden.</span> How to find it: {selectedItem.hint}.
            </>
          )}
        </p>
      )}

      <SectionTitle action={<span className="text-sm text-muted">{achievements.length}/{ACHIEVEMENTS.length}</span>}>Achievements</SectionTitle>
      <ul className="space-y-2">
        {ACHIEVEMENTS.map((a) => {
          const got = achievements.find((x) => x.id === a.id);
          return (
            <li key={a.id} className={cn("flex items-center gap-3 rounded-3xl border border-line p-3.5", got ? "bg-surface" : "bg-surface-2/50")}>
              <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl", got ? "bg-butter-200 dark:bg-butter-400/20" : "bg-surface-2 grayscale opacity-40")} aria-hidden>
                {a.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", !got && "text-muted")}>{a.title}</p>
                <p className="text-sm text-muted">{a.description}</p>
              </div>
              {got && <span className="shrink-0 text-xs font-semibold text-mint-600 dark:text-mint-300">{formatDay(got.at)}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
