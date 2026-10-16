"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { X } from "lucide-react";
import Breathing from "./Breathing";
import ColourHunt from "./ColourHunt";
import Completion from "./Completion";
import DigitalDetox from "./DigitalDetox";
import Grounding from "./Grounding";
import Guided from "./Guided";
import ParkingLot from "./ParkingLot";
import RealityBingo from "./RealityBingo";
import UnsentMessage from "./UnsentMessage";
import Unstuck from "./Unstuck";
import type { ExerciseProps } from "./types";
import { Button, LinkButton, ProgressBar } from "@/components/ui";
import { EXERCISE_MAP, isExerciseId } from "@/lib/content";
import { GUIDED } from "@/lib/guided";
import type { ExerciseId } from "@/lib/types";

const CUSTOM: Partial<Record<ExerciseId, React.ComponentType<ExerciseProps>>> = {
  grounding: Grounding,
  unstuck: Unstuck,
  breathing: Breathing,
  colours: ColourHunt,
  parking: ParkingLot,
  detox: DigitalDetox,
  bingo: RealityBingo,
  unsent: UnsentMessage,
};

/** Exercises that start immediately (no intro screen) — the stuck-in-my-head reset is one tap. */
const INSTANT: ExerciseId[] = ["grounding", "unstuck", "bingo"];

export default function ExerciseScreen({ id }: { id: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "active" | "complete">(
    isExerciseId(id) && INSTANT.includes(id) ? "active" : "intro",
  );
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<string | undefined>();
  const onDone = useCallback((s?: string) => {
    setSummary(s);
    setPhase("complete");
    setProgress(100);
  }, []);

  if (!isExerciseId(id)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl" aria-hidden>🌫️</div>
        <h1 className="mt-4 font-display text-2xl font-bold">This exercise floated away.</h1>
        <p className="mt-2 text-muted">We couldn&apos;t find it. Try one from Explore instead.</p>
        <LinkButton href="/explore" className="mt-6">
          Go to Explore
        </LinkButton>
      </div>
    );
  }

  const meta = EXERCISE_MAP[id];
  const Custom = CUSTOM[id];
  const guided = GUIDED[id];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-4">
      <header className="flex items-center gap-3">
        <button
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          aria-label="Stop and leave this exercise"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
        >
          <X size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            <span aria-hidden>{meta.emoji} </span>
            {meta.title}
          </p>
          <ProgressBar value={progress} className="mt-1.5 h-1.5" label={`${meta.title} progress`} />
        </div>
      </header>

      <div className="mt-6 flex flex-1 flex-col">
        {phase === "intro" && (
          <div className="flex flex-1 flex-col animate-rise">
            <div className={`grid h-48 place-items-center rounded-4xl bg-gradient-to-br text-7xl ${meta.gradient}`} aria-hidden>
              <span className="animate-float">{meta.emoji}</span>
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold">{meta.title}</h1>
            <p className="mt-2 text-lg text-muted">{meta.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-surface-2 px-3 py-1.5">⏱ {meta.durationLabel}</span>
              <span className="rounded-full bg-butter-200/70 px-3 py-1.5 text-coral-600 dark:bg-butter-400/15 dark:text-butter-300">+{meta.xp} XP</span>
              {meta.realWorld && <span className="rounded-full bg-mint-200/70 px-3 py-1.5 text-mint-600 dark:bg-mint-600/20 dark:text-mint-300">🌍 Real world</span>}
            </div>
            <p className="mt-6 text-sm text-muted">You can skip steps or stop any time. Leaving early is never a fail.</p>
            <div className="mt-auto pt-8">
              <Button block size="lg" onClick={() => setPhase("active")}>
                Begin
              </Button>
            </div>
          </div>
        )}

        {phase === "active" && Custom && <Custom onDone={onDone} setProgress={setProgress} />}
        {phase === "active" && !Custom && guided && <Guided def={guided} onDone={onDone} setProgress={setProgress} />}

        {phase === "complete" && <Completion exerciseId={id} summary={summary} outro={guided?.outro} />}
      </div>

      {phase !== "complete" && id !== "grounding" && id !== "unstuck" && (
        <p className="mt-6 text-center text-xs text-muted">
          Overwhelmed?{" "}
          <Link href="/exercise/grounding" className="font-semibold text-lavender-600 underline dark:text-lavender-300">
            Try a grounding reset
          </Link>{" "}
          ·{" "}
          <Link href="/support" className="font-semibold text-lavender-600 underline dark:text-lavender-300">
            Get support
          </Link>
        </p>
      )}
    </div>
  );
}
