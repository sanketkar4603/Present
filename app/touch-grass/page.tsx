"use client";

import { useState } from "react";
import { ArrowLeft, Shuffle } from "lucide-react";
import Link from "next/link";
import { Button, Modal, TextArea } from "@/components/ui";
import { TOUCH_GRASS } from "@/lib/content";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TouchGrass() {
  const completeTouchGrass = useApp((s) => s.completeTouchGrass);
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TOUCH_GRASS.length));
  const [going, setGoing] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const a = TOUCH_GRASS[index];

  const shuffle = () => {
    let next = index;
    while (next === index) next = Math.floor(Math.random() * TOUCH_GRASS.length);
    setIndex(next);
    setGoing(false);
  };

  return (
    <div className="pt-4">
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> Explore
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold">Touch Grass mode 🌱</h1>
      <p className="mt-1 text-muted">One activity. Out there, not in here. Come back after if you want — or don&apos;t.</p>

      <div
        className={cn(
          "mt-6 overflow-hidden rounded-4xl bg-gradient-to-br p-6 text-center shadow-lg transition",
          going ? "from-mint-400 to-mint-300 text-midnight-800" : "from-mint-300 via-butter-200 to-lavender-200 text-midnight-800",
        )}
      >
        <div className="text-7xl animate-float" aria-hidden>{a.emoji}</div>
        <h2 className="mt-4 font-display text-2xl font-extrabold">{a.title}</h2>
        <p className="mt-2 opacity-80">{a.detail}</p>
        <p className="mt-3 text-sm font-semibold opacity-70">About {a.minutes} min</p>
        {going ? (
          <div className="mt-6 animate-rise">
            <p className="font-display text-lg font-bold">Go on then. Phone in pocket. 🫡</p>
            <Button block size="lg" className="mt-4" onClick={() => setOpen(true)}>
              I&apos;m back — I did it
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
            <Button size="lg" onClick={() => setGoing(true)}>
              I&apos;m going
            </Button>
            <Button size="lg" variant="soft" onClick={shuffle} aria-label="Show a different activity">
              <Shuffle size={18} aria-hidden />
            </Button>
          </div>
        )}
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-bold">All outside activities</h2>
      <ul className="grid grid-cols-2 gap-2.5">
        {TOUCH_GRASS.map((t, i) => (
          <li key={t.id}>
            <button
              onClick={() => {
                setIndex(i);
                setGoing(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-3xl border p-3 text-left text-sm font-semibold transition",
                i === index ? "border-mint-500 bg-mint-200/60 dark:bg-mint-600/20" : "border-line bg-surface",
              )}
            >
              <span className="text-xl" aria-hidden>{t.emoji}</span>
              {t.title}
            </button>
          </li>
        ))}
      </ul>

      <Modal open={open} onClose={() => setOpen(false)} title="Touch grass reflection">
        <div className="text-4xl" aria-hidden>{a.emoji}</div>
        <h2 className="mt-2 font-display text-2xl font-extrabold">Welcome back, outdoorsy legend.</h2>
        <p className="mt-1 text-muted">What was it like out there? (optional)</p>
        <TextArea className="mt-4" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. The grass was cold and slightly wet. 10/10." maxLength={600} />
        <Button
          block
          size="lg"
          className="mt-4"
          onClick={() => {
            setOpen(false);
            completeTouchGrass(a.title, note);
            setNote("");
            setGoing(false);
          }}
        >
          Log it
        </Button>
      </Modal>
    </div>
  );
}
