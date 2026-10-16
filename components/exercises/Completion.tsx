"use client";

import Link from "next/link";
import { useState } from "react";
import Confetti from "../Confetti";
import Mascot from "../Mascot";
import RewardSummary from "../RewardSummary";
import { Button, LinkButton, TextArea, Toggle } from "../ui";
import { AFTER_FEELINGS, EXERCISE_MAP } from "@/lib/content";
import { companionStage, levelFor } from "@/lib/gamification";
import { haptic } from "@/lib/native";
import { detectCrisis } from "@/lib/safety";
import { useApp } from "@/lib/store";
import type { AfterFeeling, ExerciseId, Reward } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CrisisNudge } from "../MoodCheckIn";

/**
 * Shared ending for every exercise: a gentle reflection first, then the reward,
 * then an offline action to take the good stuff back out into the world.
 */
export default function Completion({
  exerciseId,
  summary,
  outro,
}: {
  exerciseId: ExerciseId;
  summary?: string;
  outro?: string;
}) {
  const meta = EXERCISE_MAP[exerciseId];
  const completeExercise = useApp((s) => s.completeExercise);
  const xp = useApp((s) => s.xp);
  const [feeling, setFeeling] = useState<AfterFeeling | undefined>();
  const [note, setNote] = useState("");
  const [save, setSave] = useState(Boolean(summary));
  const [reward, setReward] = useState<Reward | null>(null);
  const [crisis, setCrisis] = useState(false);

  const claim = () => {
    haptic("success");
    setCrisis(detectCrisis(`${summary ?? ""} ${note}`));
    setReward(completeExercise(exerciseId, { feeling, note, summary, save: save || Boolean(note.trim()) }));
  };

  if (reward) {
    return (
      <div className="relative flex flex-1 flex-col animate-rise">
        <Confetti />
        <div className="flex flex-col items-center pt-2 text-center">
          <Mascot size={130} mood="proud" stage={companionStage(levelFor(xp))} />
          <h1 className="mt-4 font-display text-3xl font-extrabold">Nice. That counted.</h1>
          {outro && <p className="mt-2 max-w-sm text-muted">{outro}</p>}
        </div>
        <div className="mt-6">
          <RewardSummary reward={reward} />
        </div>
        {crisis && <CrisisNudge />}
        <div className="mt-6 rounded-4xl border border-dashed border-mint-400 bg-mint-200/30 p-5 dark:bg-mint-600/10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint-600 dark:text-mint-300">Take it offline</p>
          <p className="mt-2 font-display text-lg font-bold">{meta.offline}</p>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
          <LinkButton href="/explore" variant="soft" size="lg">
            Another one
          </LinkButton>
          <LinkButton href="/" size="lg">
            Back home
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col animate-rise">
      <div className="pt-2 text-center">
        <div className="text-5xl animate-pop" aria-hidden>{meta.emoji}</div>
        <h1 className="mt-3 font-display text-3xl font-extrabold">You finished.</h1>
        <p className="mt-1 text-muted">Quick check — how do you feel now?</p>
      </div>
      <div role="radiogroup" aria-label="How do you feel now" className="mt-6 grid grid-cols-2 gap-2.5">
        {AFTER_FEELINGS.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={feeling === f.id}
            onClick={() => setFeeling(f.id)}
            className={cn(
              "flex items-center gap-2 rounded-3xl border p-4 text-left font-semibold transition active:scale-[0.98]",
              feeling === f.id ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line bg-surface",
            )}
          >
            <span className="text-2xl" aria-hidden>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>
      {feeling === "heavy" && (
        <div className="mt-4 rounded-3xl bg-surface-2 p-4 text-sm animate-rise">
          <p>That&apos;s okay. Not every exercise shifts things, and heavy feelings are allowed to stay a while.</p>
          <p className="mt-2 text-muted">
            If it&apos;s been heavy for a long time, talking to someone you trust — or a professional — can really help.{" "}
            <Link href="/support" className="font-semibold text-lavender-600 underline dark:text-lavender-300">
              Find support
            </Link>
          </p>
        </div>
      )}
      <label htmlFor="reflection" className="mb-2 mt-6 block text-sm font-semibold">
        Anything you noticed? <span className="font-normal text-muted">(optional · +5 XP for reflecting)</span>
      </label>
      <TextArea id="reflection" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="One thing that stood out…" maxLength={1000} />
      {summary && (
        <div className="mt-3 rounded-3xl border border-line px-4">
          <Toggle checked={save} onChange={setSave} label="Save this to my journal" description="Private, stays on this device." />
        </div>
      )}
      <div className="mt-auto pt-6">
        <Button block size="lg" onClick={claim}>
          Collect reward
        </Button>
      </div>
    </div>
  );
}
