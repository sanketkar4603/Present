"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button, Modal, TextArea } from "./ui";
import { QUESTS } from "@/lib/content";
import { useApp } from "@/lib/store";

export default function QuestCard() {
  const quest = useApp((s) => s.quest);
  const swapQuest = useApp((s) => s.swapQuest);
  const completeQuest = useApp((s) => s.completeQuest);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!quest) return null;
  const q = QUESTS.find((x) => x.id === quest.questId) ?? QUESTS[0];

  return (
    <section
      aria-labelledby="quest-title"
      className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-midnight-500 via-lavender-600 to-lavender-500 p-5 text-white shadow-[0_20px_40px_-20px_rgba(54,40,101,0.9)]"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 text-[7rem] opacity-20" aria-hidden>
        {q.emoji}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-lavender-200">Today&apos;s Reality Quest</p>
      {quest.done ? (
        <div className="relative">
          <h2 id="quest-title" className="mt-2 font-display text-2xl font-extrabold leading-tight">
            Quest complete ✓
          </h2>
          <p className="mt-1 text-lavender-100">
            &ldquo;{q.title}&rdquo; — done in real life. A fresh one shows up tomorrow.
          </p>
        </div>
      ) : (
        <div className="relative">
          <h2 id="quest-title" className="mt-2 font-display text-2xl font-extrabold leading-tight">
            <span aria-hidden>{q.emoji} </span>
            {q.title}
          </h2>
          <p className="mt-1 text-lavender-100">{q.detail}</p>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="mint" onClick={() => setOpen(true)}>
              I did it
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={swapQuest}
              disabled={quest.swaps >= 2}
              aria-label={`Show a different quest. ${2 - quest.swaps} swaps left.`}
            >
              <RefreshCw size={16} aria-hidden /> {quest.swaps >= 2 ? "No swaps left" : "Not today"}
            </Button>
          </div>
          <p className="mt-3 text-xs text-lavender-200">+40 XP · Counts as a real-world experience</p>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Quest reflection">
        <div className="text-4xl" aria-hidden>{q.emoji}</div>
        <h2 className="mt-2 font-display text-2xl font-extrabold">You did the thing.</h2>
        <p className="mt-1 text-muted">What did you notice? Totally optional — but reflections earn a little bonus.</p>
        <TextArea className="mt-4" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. The air smelled like rain and I didn't think about emails once." maxLength={800} />
        <Button
          block
          size="lg"
          className="mt-4"
          onClick={() => {
            setOpen(false);
            completeQuest(note);
            setNote("");
          }}
        >
          Complete quest
        </Button>
      </Modal>
    </section>
  );
}
