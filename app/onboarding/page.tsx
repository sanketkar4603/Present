"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Mascot from "@/components/Mascot";
import { Button, TextInput } from "@/components/ui";
import { EXERCISES, FEELINGS, GOALS, SESSION_LENGTHS } from "@/lib/content";
import { useApp } from "@/lib/store";
import { recommendFor } from "@/lib/recommend";
import type { AgeRange, FeelingId, GoalId, SessionLength } from "@/lib/types";
import { cn } from "@/lib/utils";

const AGES: { id: AgeRange; label: string }[] = [
  { id: "16-17", label: "16–17" },
  { id: "18-24", label: "18–24" },
  { id: "25-28", label: "25–28" },
  { id: "29+", label: "29+" },
  { id: "skip", label: "Rather not say" },
];

const TOTAL = 6;

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const loadDemo = useApp((s) => s.loadDemo);
  const existing = useApp((s) => s.profile);
  const alreadyOnboarded = Boolean(existing.onboardedAt);
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<GoalId[]>(existing.goals);
  const [feeling, setFeeling] = useState<FeelingId | undefined>(existing.feeling);
  const [length, setLength] = useState<SessionLength>(existing.sessionLength);
  const [name, setName] = useState(existing.name);
  const [age, setAge] = useState<AgeRange>(existing.ageRange);
  const [companionName, setCompanionName] = useState(existing.companionName);

  const journey = useMemo(() => recommendFor(goals, feeling, length).slice(0, 3), [goals, feeling, length]);

  const next = () => setStep((s) => Math.min(TOTAL - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    completeOnboarding({
      name: name.trim(),
      goals,
      feeling,
      sessionLength: length,
      ageRange: age,
      companionName: companionName.trim() || "Nimbus",
    });
    router.replace("/");
  };

  const demo = () => {
    loadDemo();
    router.replace("/");
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">
      <div className="flex h-10 items-center gap-3">
        {step > 0 ? (
          <button onClick={back} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-surface-2">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <span className="h-10 w-10" />
        )}
        {step > 0 && (
          <div className="flex flex-1 gap-1.5" aria-label={`Step ${step} of ${TOTAL - 1}`}>
            {Array.from({ length: TOTAL - 1 }).map((_, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full transition", i < step ? "bg-lavender-500" : "bg-surface-2")} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28 }}
          className="flex flex-1 flex-col"
        >
          {step === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Mascot size={170} mood="happy" />
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-lavender-600 dark:text-lavender-300">PRESENT</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">
                Hey, you&apos;re here.
                <br />
                That&apos;s a good start.
              </h1>
              <p className="mt-4 max-w-xs text-muted">Stop living in your head. Start living your life. Two minutes to set up — every question is skippable.</p>
              <div className="mt-10 w-full space-y-3">
                <Button block size="lg" onClick={next}>
                  Let&apos;s go
                </Button>
                {!alreadyOnboarded && (
                  <Button block size="lg" variant="soft" onClick={demo}>
                    Just look around (demo mode)
                  </Button>
                )}
              </div>
              <p className="mt-6 text-xs text-muted">
                Everything stays on this device. PRESENT is a wellness tool, not medical care.
              </p>
            </div>
          )}

          {step === 1 && (
            <Question title="What do you want help with?" subtitle="Pick as many as feel true. No wrong answers.">
              <div className="space-y-2.5">
                {GOALS.map((g) => {
                  const on = goals.includes(g.id);
                  return (
                    <OptionRow
                      key={g.id}
                      emoji={g.emoji}
                      label={g.label}
                      selected={on}
                      onClick={() => setGoals(on ? goals.filter((x) => x !== g.id) : [...goals, g.id])}
                    />
                  );
                })}
              </div>
              <Footer onSkip={() => { setGoals([]); next(); }} onNext={next} canNext={goals.length > 0} />
            </Question>
          )}

          {step === 2 && (
            <Question title="How do you usually feel?" subtitle="Lately, most days. This just helps us suggest things — it's not a label.">
              <div className="grid grid-cols-2 gap-2.5">
                {FEELINGS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFeeling(f.id)}
                    aria-pressed={feeling === f.id}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-3xl border p-4 text-left font-semibold transition active:scale-[0.98]",
                      feeling === f.id ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line bg-surface",
                    )}
                  >
                    <span className="text-3xl" aria-hidden>{f.emoji}</span>
                    {f.label}
                  </button>
                ))}
              </div>
              <Footer onSkip={() => { setFeeling(undefined); next(); }} onNext={next} canNext={Boolean(feeling)} />
            </Question>
          )}

          {step === 3 && (
            <Question title="How long do you usually have?" subtitle="We'll match exercises to your time. You can always do more or less.">
              <div className="space-y-2.5">
                {SESSION_LENGTHS.map((s) => (
                  <OptionRow
                    key={s.value}
                    emoji={s.value === 30 ? "⚡" : s.value === 120 ? "☕" : s.value === 300 ? "🌿" : "🌊"}
                    label={s.label}
                    hint={s.hint}
                    selected={length === s.value}
                    onClick={() => setLength(s.value)}
                  />
                ))}
              </div>
              <Footer onNext={next} canNext />
            </Question>
          )}

          {step === 4 && (
            <Question title="A couple of basics" subtitle="Both optional. Your age range only sets safer defaults — like keeping AI chat off for under-18s unless you switch it on.">
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="name">What should we call you?</label>
              <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="A name, a nickname, anything" maxLength={30} autoComplete="given-name" />
              <p className="mb-2 mt-6 text-sm font-semibold">Age range</p>
              <div className="flex flex-wrap gap-2">
                {AGES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAge(a.id)}
                    aria-pressed={age === a.id}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                      age === a.id ? "border-lavender-500 bg-lavender-500 text-white" : "border-line bg-surface",
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 rounded-3xl bg-surface-2 p-4 text-sm text-muted">
                🔒 Stored only on this device. We never sell data, show ads, or use your entries to train AI.
              </div>
              <Footer onNext={next} canNext nextLabel={name || age !== "skip" ? "Continue" : "Skip"} />
            </Question>
          )}

          {step === 5 && (
            <div className="flex flex-1 flex-col pt-4">
              <div className="flex flex-col items-center text-center">
                <Mascot size={150} mood="proud" />
                <h1 className="mt-5 font-display text-3xl font-extrabold">Meet your companion</h1>
                <p className="mt-2 max-w-xs text-muted">
                  A tiny cloud who grows as you do real-life things. Never sulks if you take a break. Promise.
                </p>
              </div>
              <label htmlFor="cname" className="mb-1.5 mt-6 block text-sm font-semibold">Give them a name</label>
              <TextInput id="cname" value={companionName} onChange={(e) => setCompanionName(e.target.value)} maxLength={20} />

              <div className="mt-6 rounded-4xl border border-line bg-surface p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-300">Your starter journey</p>
                <ol className="mt-3 space-y-3">
                  {journey.map((id, i) => {
                    const e = EXERCISES.find((x) => x.id === id)!;
                    return (
                      <li key={id} className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface-2 text-xl" aria-hidden>{e.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-semibold">{i + 1}. {e.title}</div>
                          <div className="truncate text-sm text-muted">{e.tagline}</div>
                        </div>
                      </li>
                    );
                  })}
                  <li className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint-200 text-xl dark:bg-mint-600/30" aria-hidden>🗺️</span>
                    <div>
                      <div className="font-semibold">+ one Reality Quest a day</div>
                      <div className="text-sm text-muted">Small missions out in the actual world.</div>
                    </div>
                  </li>
                </ol>
              </div>
              <div className="mt-auto pt-6">
                <Button block size="lg" onClick={finish}>
                  Start my journey
                </Button>
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function Question({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col pt-6">
      <h1 className="font-display text-3xl font-extrabold leading-tight">{title}</h1>
      {subtitle && <p className="mb-6 mt-2 text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}

function OptionRow({
  emoji,
  label,
  hint,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-3xl border p-4 text-left transition active:scale-[0.99]",
        selected ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line bg-surface hover:border-lavender-300",
      )}
    >
      <span className="text-2xl" aria-hidden>{emoji}</span>
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-full border-2 transition",
          selected ? "border-lavender-500 bg-lavender-500 text-white" : "border-line",
        )}
        aria-hidden
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}

function Footer({ onNext, onSkip, canNext, nextLabel = "Continue" }: { onNext: () => void; onSkip?: () => void; canNext: boolean; nextLabel?: string }) {
  return (
    <div className="mt-auto flex gap-3 pt-8">
      {onSkip && (
        <Button variant="ghost" size="lg" onClick={onSkip}>
          Skip
        </Button>
      )}
      <Button block size="lg" onClick={onNext} disabled={!canNext}>
        {nextLabel}
      </Button>
    </div>
  );
}
