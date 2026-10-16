"use client";

import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button, TextInput } from "../ui";
import type { ExerciseProps } from "./types";
import { haptic } from "@/lib/native";
import { cn, dayKey, seeded } from "@/lib/utils";

const COLOURS = [
  { name: "Tomato red", hex: "#e8493a", hint: "Brake lights, apples, a stop sign, a mug…" },
  { name: "Sunflower yellow", hex: "#f6c23e", hint: "Road markings, a banana, a sticky note…" },
  { name: "Leaf green", hex: "#4caf6a", hint: "Plants, a recycling bin, an exit sign…" },
  { name: "Sky blue", hex: "#5aa9e6", hint: "Jeans, a water bottle, the actual sky…" },
  { name: "Lavender", hex: "#a68cf3", hint: "Flowers, a hoodie, a phone case…" },
  { name: "Rust orange", hex: "#d9772b", hint: "Bricks, autumn leaves, a traffic cone…" },
  { name: "Bubblegum pink", hex: "#f48fb1", hint: "A sweet wrapper, a sunset, a T-shirt…" },
  { name: "Ocean teal", hex: "#1f9e94", hint: "Packaging, tiles, a car, a door…" },
  { name: "Chocolate brown", hex: "#7a4f32", hint: "Wood, a coffee, a dog, shoes…" },
];
const TARGET = 5;

export default function ColourHunt({ onDone, setProgress }: ExerciseProps) {
  const [index, setIndex] = useState(() => Math.floor(seeded(`colour-${dayKey()}`)() * COLOURS.length));
  const [shuffles, setShuffles] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const c = COLOURS[index];

  useEffect(() => setProgress((found.length / TARGET) * 100), [found.length, setProgress]);

  const add = (label: string) => {
    if (found.length >= TARGET) return;
    const next = [...found, label];
    setFound(next);
    setDraft("");
    haptic(next.length >= TARGET ? "success" : "tap");
    if (next.length >= TARGET) {
      const named = next.filter(Boolean);
      setTimeout(
        () => onDone(`Colour: ${c.name}${named.length ? `\nFound: ${named.join(", ")}` : ""}`),
        700,
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center text-center">
        <div
          className="grid h-36 w-36 place-items-center rounded-full shadow-[0_18px_40px_-14px_rgba(0,0,0,0.45)] transition-colors duration-500"
          style={{ background: c.hex }}
          aria-hidden
        >
          <span className="font-display text-5xl font-extrabold text-white/90 drop-shadow">{found.length}</span>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-muted">Your colour</p>
        <h2 className="font-display text-3xl font-extrabold" aria-live="polite">
          {c.name}
        </h2>
        <p className="mt-2 max-w-xs text-muted">
          Look up and around. Find {TARGET} things this colour — close enough counts.
        </p>
        <p className="mt-1 text-sm text-muted">{c.hint}</p>
        {found.length === 0 && shuffles < 3 && (
          <button
            onClick={() => {
              setIndex((index + 1 + Math.floor(Math.random() * (COLOURS.length - 1))) % COLOURS.length);
              setShuffles(shuffles + 1);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-600 dark:text-lavender-300"
          >
            <Shuffle size={14} aria-hidden /> Different colour
          </button>
        )}
      </div>

      <div className="my-6 flex justify-center gap-2.5" aria-label={`${found.length} of ${TARGET} found`}>
        {Array.from({ length: TARGET }).map((_, i) => {
          const done = i < found.length;
          return (
            <button
              key={i}
              onClick={() => !done && add("")}
              disabled={done}
              aria-label={done ? `Found ${i + 1}${found[i] ? `: ${found[i]}` : ""}` : `Tap when you've found number ${i + 1}`}
              className={cn(
                "grid h-12 w-12 place-items-center rounded-full border-2 text-sm font-bold transition",
                done ? "scale-105 border-transparent text-white shadow-md" : "border-dashed border-line bg-surface text-muted",
              )}
              style={done ? { background: c.hex } : undefined}
            >
              {done ? "✓" : i + 1}
            </button>
          );
        })}
      </div>

      {found.some(Boolean) && (
        <p className="mb-3 text-center text-sm text-muted">Spotted: {found.filter(Boolean).join(" · ")}</p>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) add(draft.trim());
        }}
      >
        <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What did you find? (optional)" aria-label="Name what you found" maxLength={40} />
        <Button type="submit" variant="soft" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
      <p className="mt-auto pt-6 text-center text-xs text-muted">Tip: it&apos;s even better outside. Stay aware of where you&apos;re walking.</p>
    </div>
  );
}
