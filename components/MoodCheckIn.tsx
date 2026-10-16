"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Chip, Button, TextArea } from "./ui";
import { EXERCISE_MAP, MOODS, MOOD_RECOMMENDATIONS, MOOD_TAGS } from "@/lib/content";
import { haptic } from "@/lib/native";
import { detectCrisis } from "@/lib/safety";
import { useApp } from "@/lib/store";
import type { MoodId } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

export default function MoodCheckIn() {
  const moods = useApp((s) => s.moods);
  const logMood = useApp((s) => s.logMood);
  const latest = moods[0];
  const recent = latest && Date.now() - latest.at < 3 * 3600000;

  const [selected, setSelected] = useState<MoodId | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<MoodId | null>(null);
  const [again, setAgain] = useState(false);
  const [crisis, setCrisis] = useState(false);

  const save = () => {
    if (!selected) return;
    logMood(selected, tags, note);
    setCrisis(detectCrisis(note));
    setSaved(selected);
    setSelected(null);
    setTags([]);
    setNote("");
    setAgain(false);
  };

  if (saved) {
    const m = MOODS.find((x) => x.id === saved)!;
    return (
      <Card className="animate-rise">
        <div className="flex items-start gap-3">
          <span className="text-4xl animate-pop" aria-hidden>{m.emoji}</span>
          <div>
            <p className="font-display text-lg font-bold">Checked in: {m.label}</p>
            <p className="mt-1 text-[15px] text-muted">{m.reply}</p>
          </div>
        </div>
        {crisis && <CrisisNudge />}
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Might help right now</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOOD_RECOMMENDATIONS[saved].map((id) => (
            <Link
              key={id}
              href={`/exercise/${id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3.5 py-2 text-sm font-semibold transition hover:border-lavender-400"
            >
              <span aria-hidden>{EXERCISE_MAP[id].emoji}</span>
              {EXERCISE_MAP[id].title}
            </Link>
          ))}
        </div>
        <button onClick={() => setSaved(null)} className="mt-4 text-sm font-semibold text-lavender-600 dark:text-lavender-300">
          Done
        </button>
      </Card>
    );
  }

  if (recent && !again && !selected) {
    const m = MOODS.find((x) => x.id === latest.mood)!;
    return (
      <Card className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>{m.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold">You checked in as {m.label.toLowerCase()}</p>
          <p className="text-sm text-muted">at {formatTime(latest.at)}. Things change — that&apos;s normal.</p>
        </div>
        <Button size="sm" variant="soft" onClick={() => setAgain(true)}>
          Update
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-xl font-bold">Where&apos;s your head at right now?</h2>
      <p className="mt-1 text-sm text-muted">No right answer. Every mood is welcome here.</p>

      <div className="relative mt-5">
        <div className="absolute inset-x-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-lavender-400 via-butter-300 to-mint-300 opacity-40" aria-hidden />
        <div role="radiogroup" aria-label="Mood" className="relative flex justify-between">
          {MOODS.map((m) => {
            const on = selected === m.id;
            return (
              <button
                key={m.id}
                role="radio"
                aria-checked={on}
                aria-label={m.label}
                onClick={() => {
                  haptic("soft");
                  setSelected(m.id);
                }}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full border-2 bg-surface text-2xl transition sm:h-12 sm:w-12",
                  on ? "scale-125 border-lavender-500 shadow-lg" : "border-line hover:scale-110",
                )}
              >
                <span aria-hidden>{m.emoji}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between px-1 text-[11px] font-semibold text-muted" aria-hidden>
          <span>heavy</span>
          <span>bright</span>
        </div>
      </div>

      {selected && (
        <div className="mt-5 animate-rise">
          <p className="text-center font-display text-lg font-bold">
            {MOODS.find((m) => m.id === selected)!.label}
          </p>
          <p className="mb-2 mt-4 text-sm font-semibold">What&apos;s it about? <span className="font-normal text-muted">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((t) => (
              <Chip key={t} active={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>
                {t}
              </Chip>
            ))}
          </div>
          <label htmlFor="mood-note" className="mb-2 mt-4 block text-sm font-semibold">
            Anything to add? <span className="font-normal text-muted">(private, optional)</span>
          </label>
          <TextArea id="mood-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A word, a sentence, a vibe…" maxLength={500} />
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button block onClick={save}>
              Save check-in
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function CrisisNudge() {
  return (
    <div className="mt-4 rounded-3xl border border-coral-300 bg-coral-200/40 p-4 text-sm dark:bg-coral-600/15">
      <p className="font-semibold">It sounds like things might be really hard right now.</p>
      <p className="mt-1 text-muted">
        You don&apos;t have to handle this alone. Talking to a real person can help — crisis lines are free and confidential.
      </p>
      <Link href="/support" className="mt-3 inline-flex font-semibold text-coral-600 underline dark:text-coral-300">
        See support options →
      </Link>
    </div>
  );
}
