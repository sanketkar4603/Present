"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button, TextArea } from "../ui";
import type { ExerciseProps } from "./types";
import { requestNotificationPermission } from "@/lib/native";
import { useApp } from "@/lib/store";
import type { ParkingBucket } from "@/lib/types";
import { cn, formatDay } from "@/lib/utils";

const BUCKETS: { id: ParkingBucket; label: string; emoji: string; blurb: string }[] = [
  { id: "control", label: "Something I can control", emoji: "🎮", blurb: "There's an action in here somewhere." },
  { id: "cannot", label: "Something I can't control", emoji: "🌧️", blurb: "Like the weather. Real, but not yours to steer." },
  { id: "info", label: "I need more information", emoji: "🔎", blurb: "Can't decide until you know more." },
];

export default function ParkingLot({ onDone, setProgress }: ExerciseProps) {
  const parked = useApp((s) => s.parked);
  const addParked = useApp((s) => s.addParked);
  const resolveParked = useApp((s) => s.resolveParked);
  const deleteParked = useApp((s) => s.deleteParked);
  const addReminder = useApp((s) => s.addReminder);

  const [step, setStep] = useState<"write" | "sort" | "next" | "parked">("write");
  const [thought, setThought] = useState("");
  const [bucket, setBucket] = useState<ParkingBucket | null>(null);
  const [nextStep, setNextStep] = useState("");
  const [remind, setRemind] = useState(false);

  useEffect(() => {
    setProgress({ write: 10, sort: 40, next: 70, parked: 100 }[step]);
  }, [step, setProgress]);

  const park = () => {
    if (!bucket) return;
    addParked(thought.trim(), bucket, nextStep.trim() || undefined);
    if (remind && nextStep.trim()) {
      const due = new Date();
      due.setHours(due.getHours() + 3);
      addReminder(nextStep.trim(), due.getTime());
      void requestNotificationPermission();
    }
    setStep("parked");
  };

  if (step === "write") {
    return (
      <div className="flex flex-1 flex-col">
        <h2 className="font-display text-2xl font-bold">What thought keeps circling?</h2>
        <p className="mt-1 text-muted">Write it out exactly how it sounds in your head. It&apos;s safe here.</p>
        <TextArea className="mt-5" rows={4} autoFocus value={thought} onChange={(e) => setThought(e.target.value)} placeholder="e.g. What if I fail the presentation tomorrow?" maxLength={400} />
        <ParkedList items={parked} onResolve={resolveParked} onDelete={deleteParked} />
        <div className="mt-auto pt-6">
          <Button block size="lg" disabled={!thought.trim()} onClick={() => setStep("sort")}>
            Drive it to the lot
          </Button>
        </div>
      </div>
    );
  }

  if (step === "sort") {
    return (
      <div className="flex flex-1 flex-col">
        <div className="rounded-3xl bg-surface-2 p-4 text-[15px] italic">&ldquo;{thought}&rdquo;</div>
        <h2 className="mt-6 font-display text-2xl font-bold">Which parking bay does it go in?</h2>
        <div role="radiogroup" className="mt-4 space-y-2.5">
          {BUCKETS.map((b) => (
            <button
              key={b.id}
              role="radio"
              aria-checked={bucket === b.id}
              onClick={() => setBucket(b.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-3xl border p-4 text-left transition",
                bucket === b.id ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line bg-surface",
              )}
            >
              <span className="text-3xl" aria-hidden>{b.emoji}</span>
              <span>
                <span className="block font-semibold">{b.label}</span>
                <span className="block text-sm text-muted">{b.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Not sure? Pick the closest. Thoughts are messy — that&apos;s fine.</p>
        <div className="mt-auto pt-6">
          <Button block size="lg" disabled={!bucket} onClick={() => setStep("next")}>
            Next
          </Button>
        </div>
      </div>
    );
  }

  if (step === "next") {
    return (
      <div className="flex flex-1 flex-col">
        {bucket === "control" && (
          <>
            <h2 className="font-display text-2xl font-bold">Nice — there&apos;s something you can do.</h2>
            <p className="mt-1 text-muted">You don&apos;t have to solve it all. What&apos;s the very next tiny step?</p>
            <TextArea className="mt-5" rows={3} value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="e.g. Run through my slides once out loud after dinner." maxLength={300} />
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="h-5 w-5 accent-lavender-500" />
              Remind me in the app in 3 hours
            </label>
          </>
        )}
        {bucket === "cannot" && (
          <>
            <h2 className="font-display text-2xl font-bold">Some things just aren&apos;t yours to steer.</h2>
            <p className="mt-2 text-muted">
              That doesn&apos;t make the worry silly — it means more thinking probably won&apos;t change the outcome. You&apos;re allowed to park it and come back if anything changes.
            </p>
            <div className="mt-5 rounded-3xl bg-surface-2 p-4 text-sm">
              <p className="font-semibold">Is there a small piece you <em>can</em> influence?</p>
              <p className="mt-1 text-muted">Like how you look after yourself while you wait. Optional:</p>
              <TextArea className="mt-3" rows={2} value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="e.g. Get a decent sleep so I'm ready either way." maxLength={300} />
            </div>
            <Link href="/exercise/grounding" className="mt-4 text-sm font-semibold text-lavender-600 dark:text-lavender-300">
              Or do a quick grounding reset after this →
            </Link>
          </>
        )}
        {bucket === "info" && (
          <>
            <h2 className="font-display text-2xl font-bold">Your brain is guessing without data.</h2>
            <p className="mt-1 text-muted">What do you need to find out — and who or where could you find it from?</p>
            <TextArea className="mt-5" rows={3} value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="e.g. Ask my tutor what the marking criteria are." maxLength={300} />
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="h-5 w-5 accent-lavender-500" />
              Remind me in the app in 3 hours
            </label>
          </>
        )}
        <div className="mt-auto pt-6">
          <Button block size="lg" onClick={park}>
            Park it 🅿️
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="relative mt-6 h-40 w-full">
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 w-16 rounded-t-xl border-x-2 border-t-2 border-dashed border-lavender-300" />
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-5xl animate-pop" aria-hidden>
          🚗
        </div>
      </div>
      <h2 className="mt-6 font-display text-3xl font-extrabold">Parked.</h2>
      <p className="mt-2 max-w-sm text-muted">
        The thought is safe in the lot. If it drives back in later, you can tell it: &ldquo;You&apos;re parked. I&apos;ll check on you when I&apos;m ready.&rdquo;
      </p>
      <div className="mt-auto w-full pt-8">
        <Button
          block
          size="lg"
          onClick={() =>
            onDone(
              `Parked thought: ${thought.trim()}\nBay: ${BUCKETS.find((b) => b.id === bucket)?.label}${nextStep.trim() ? `\nNext step: ${nextStep.trim()}` : ""}`,
            )
          }
        >
          Finish
        </Button>
      </div>
    </div>
  );
}

function ParkedList({
  items,
  onResolve,
  onDelete,
}: {
  items: { id: string; text: string; bucket: ParkingBucket; nextStep?: string; at: number; resolved?: boolean }[];
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Already in the lot</p>
      <ul className="space-y-2">
        {items.slice(0, 5).map((p) => (
          <li key={p.id} className={cn("flex items-start gap-3 rounded-3xl border border-line bg-surface p-3", p.resolved && "opacity-55")}>
            <span className="text-xl" aria-hidden>{BUCKETS.find((b) => b.id === p.bucket)?.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-semibold", p.resolved && "line-through")}>{p.text}</p>
              {p.nextStep && <p className="text-xs text-muted">→ {p.nextStep}</p>}
              <p className="text-xs text-muted">{formatDay(p.at)}</p>
            </div>
            <button onClick={() => onResolve(p.id)} aria-label={p.resolved ? "Mark as still parked" : "Mark as sorted"} className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-mint-600">
              <Check size={15} />
            </button>
            <button onClick={() => onDelete(p.id)} aria-label="Remove from lot" className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted">
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
