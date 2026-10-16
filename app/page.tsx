"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BellRing, Check, Settings, X } from "lucide-react";
import ExerciseCard from "@/components/ExerciseCard";
import Mascot, { type MascotMood } from "@/components/Mascot";
import MoodCheckIn from "@/components/MoodCheckIn";
import QuestCard from "@/components/QuestCard";
import { Card, SectionTitle } from "@/components/ui";
import { COMPANION_LINES, EXERCISE_MAP, OFFLINE_ACTIONS, TIME_GREETINGS } from "@/lib/content";
import { companionStage, gentleRhythm, levelProgress } from "@/lib/gamification";
import { recommendNow } from "@/lib/recommend";
import { useApp } from "@/lib/store";
import type { MoodId } from "@/lib/types";
import { dayKey, pick, seeded, timeOfDay } from "@/lib/utils";

const MOOD_TO_MASCOT: Record<MoodId, MascotMood> = {
  stormy: "cozy",
  low: "cozy",
  foggy: "curious",
  restless: "curious",
  okay: "happy",
  calm: "calm",
  bright: "proud",
};

export default function Home() {
  const profile = useApp((s) => s.profile);
  const xp = useApp((s) => s.xp);
  const moods = useApp((s) => s.moods);
  const completions = useApp((s) => s.completions);
  const journal = useApp((s) => s.journal);
  const activeDays = useApp((s) => s.activeDays);
  const reminders = useApp((s) => s.reminders);
  const showStreaks = useApp((s) => s.settings.showStreaks);
  const demo = useApp((s) => s.demo);
  const nudgeFrequency = useApp((s) => s.settings.reminderFrequency);
  const completeReminder = useApp((s) => s.completeReminder);
  const deleteReminder = useApp((s) => s.deleteReminder);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const today = dayKey(now);
  const tod = timeOfDay(new Date(now));
  const rand = useMemo(() => seeded(today + tod), [today, tod]);
  const greeting = useMemo(() => pick(TIME_GREETINGS[tod], rand), [tod, rand]);
  const companionLine = useMemo(() => pick(COMPANION_LINES, seeded(today)), [today]);
  const offline = useMemo(() => pick(OFFLINE_ACTIONS, seeded("offline" + today)), [today]);

  const latestMood = moods[0]?.mood;
  const lvl = levelProgress(xp);
  const stage = companionStage(lvl.level);
  const mascotMood: MascotMood = tod === "night" ? "sleepy" : latestMood ? MOOD_TO_MASCOT[latestMood] : "happy";

  const doneToday = new Set(completions.filter((c) => dayKey(c.at) === today).map((c) => c.exerciseId));
  const picks = recommendNow(profile.goals, profile.feeling, profile.sessionLength, latestMood)
    .filter((id) => id !== "grounding" && id !== "unstuck")
    .slice(0, 4);
  const due = reminders.filter((r) => !r.done && r.dueAt <= now);
  const upcoming = reminders.filter((r) => !r.done && r.dueAt > now).slice(0, 2);

  const hour = new Date(now).getHours();
  const moment =
    (hour >= 21 || hour < 4) && !doneToday.has("winddown")
      ? { id: "winddown" as const, kicker: "It's getting late", line: "Close the tabs in your head before bed." }
      : hour >= 5 && hour < 10 && !doneToday.has("detox")
        ? { id: "detox" as const, kicker: "Morning", line: "Start the day with two phone-free minutes, before the feed gets you." }
        : null;

  const realWorld = completions.filter((c) => c.realWorld).length;
  const discoveries = journal.length;
  const rhythm = gentleRhythm(activeDays, today);
  const lastMoodAt = moods[0]?.at ?? 0;
  const nudge =
    nudgeFrequency === "daily" ? dayKey(lastMoodAt) !== today : nudgeFrequency === "weekly" ? now - lastMoodAt > 7 * 86400000 : false;

  return (
    <div>
      <header className="flex items-center justify-between gap-3 pb-1 pt-6">
        <div>
          <p className="text-sm font-semibold text-muted">
            {new Date(now).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-3xl font-extrabold">
            {greeting}
            {profile.name ? `, ${profile.name}` : ""}.
          </h1>
        </div>
        <Link href="/settings" aria-label="Settings" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-muted hover:text-ink">
          <Settings size={20} />
        </Link>
      </header>

      {demo && (
        <p className="mt-2 rounded-2xl bg-butter-200/70 px-4 py-2 text-xs font-semibold text-midnight-600 dark:bg-butter-400/15 dark:text-butter-200">
          Demo mode — exploring with sample data. Reset anytime in Settings.
        </p>
      )}

      {/* Companion */}
      <Link href="/world" className="mt-3 flex items-center gap-2 rounded-4xl p-1 transition hover:bg-surface/50" aria-label={`${profile.companionName} says: ${companionLine}. Open My World.`}>
        <Mascot size={92} mood={mascotMood} stage={stage} />
        <div className="relative flex-1 rounded-3xl rounded-bl-md border border-line bg-surface px-4 py-3 text-[15px] shadow-sm">
          <span className="block text-xs font-bold text-lavender-600 dark:text-lavender-300">{profile.companionName}</span>
          {companionLine}
        </div>
      </Link>

      {/* Quick reset */}
      <Link
        href="/exercise/unstuck"
        className="group mt-4 flex items-center justify-between gap-4 rounded-4xl bg-gradient-to-br from-coral-400 via-coral-400 to-butter-400 p-5 text-white shadow-[0_18px_36px_-18px_rgba(247,109,85,0.95)] transition active:scale-[0.98]"
      >
        <div>
          <p className="font-display text-2xl font-extrabold leading-tight">I&apos;m stuck in my head.</p>
          <p className="mt-1 text-sm font-medium text-white/85">One tap. Two minutes. Back to the room.</p>
        </div>
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/25 text-3xl transition group-hover:scale-110" aria-hidden>
          🫧
        </span>
      </Link>

      {/* Right-now suggestion based on the time of day */}
      {moment && (
        <Link
          href={`/exercise/${moment.id}`}
          className="mt-4 flex items-center gap-3 rounded-4xl border border-line bg-surface p-4 transition hover:border-lavender-300"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-2xl" aria-hidden>
            {EXERCISE_MAP[moment.id].emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-300">{moment.kicker}</span>
            <span className="block font-semibold">{EXERCISE_MAP[moment.id].title}</span>
            <span className="block text-sm text-muted">{moment.line}</span>
          </span>
          <span aria-hidden className="text-muted">→</span>
        </Link>
      )}

      {/* Reminders */}
      {due.map((r) => (
        <Card key={r.id} className="mt-4 flex items-center gap-3 border-lavender-300 animate-rise">
          <BellRing className="shrink-0 text-lavender-500" size={22} aria-hidden />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-300">Future-you asked for this</p>
            <p className="font-semibold">{r.text}</p>
          </div>
          <button onClick={() => completeReminder(r.id)} aria-label="Mark done" className="grid h-10 w-10 place-items-center rounded-full bg-mint-300 text-midnight-800">
            <Check size={18} />
          </button>
          <button onClick={() => deleteReminder(r.id)} aria-label="Dismiss reminder" className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted">
            <X size={18} />
          </button>
        </Card>
      ))}

      {nudge && (
        <p className="mt-4 rounded-2xl bg-lavender-100 px-4 py-2.5 text-sm font-medium dark:bg-midnight-500">
          🌱 Your {nudgeFrequency} nudge: check in whenever you&apos;re ready. Zero pressure.
        </p>
      )}

      <div className="mt-4">
        <MoodCheckIn />
      </div>

      <div className="mt-4">
        <QuestCard />
      </div>

      <SectionTitle action={<Link href="/explore" className="text-sm font-semibold text-lavender-600 dark:text-lavender-300">See all</Link>}>
        Picked for you
      </SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {picks.map((id) => (
          <ExerciseCard key={id} exercise={EXERCISE_MAP[id]} done={doneToday.has(id)} compact />
        ))}
      </div>

      <SectionTitle action={<Link href="/world" className="text-sm font-semibold text-lavender-600 dark:text-lavender-300">My World</Link>}>
        Your progress
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Stat emoji="🌍" value={realWorld} label="real-world experiences" />
        <Stat emoji="🫧" value={moods.length} label="emotional check-ins" />
        <Stat emoji="📓" value={discoveries} label="personal discoveries" />
        {showStreaks ? (
          <Stat emoji="🌱" value={rhythm.days} label={rhythm.paused ? "day rhythm (resting today)" : "day rhythm"} />
        ) : (
          <Stat emoji="📅" value={activeDays.length} label="days you showed up" />
        )}
      </div>
      <Card className="mt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            Level {lvl.level} · {lvl.name}
          </span>
          <span className="text-muted">{lvl.nextName ? `${lvl.toNext} XP to ${lvl.nextName}` : "Max level — legend"}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-lavender-400 to-mint-400" style={{ width: `${lvl.pct}%` }} />
        </div>
      </Card>

      {upcoming.length > 0 && (
        <p className="mt-3 px-1 text-sm text-muted">
          ⏰ Coming up: {upcoming.map((r) => r.text).join(" · ")}
        </p>
      )}

      {/* Leave with an offline action */}
      <div className="mt-7 rounded-4xl border border-dashed border-mint-400 bg-mint-200/30 p-5 dark:bg-mint-600/10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint-600 dark:text-mint-300">Before you go</p>
        <p className="mt-2 font-display text-lg font-bold">{offline}</p>
        <p className="mt-1 text-sm text-muted">The best part of this app happens when you close it.</p>
      </div>
    </div>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>{emoji}</span>
        <span className="font-display text-2xl font-extrabold">{value}</span>
      </div>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  );
}
