"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button, Modal, TextArea, TextInput } from "../ui";
import type { ExerciseProps } from "./types";
import { useApp } from "@/lib/store";
import { cn, formatDay } from "@/lib/utils";

const TO_IDEAS = ["Someone I miss", "Past me", "Future me", "Someone who hurt me", "My body", "A friend", "The universe"];

export default function UnsentMessage({ onDone, setProgress }: ExerciseProps) {
  const unsent = useApp((s) => s.unsent);
  const saveUnsent = useApp((s) => s.saveUnsent);
  const deleteUnsent = useApp((s) => s.deleteUnsent);

  const [editingId, setEditingId] = useState<string | undefined>();
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [releasing, setReleasing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setProgress(text.trim() ? Math.min(90, 20 + text.length / 6) : 10);
  }, [text, setProgress]);

  const save = () => {
    saveUnsent({ id: editingId, to: to.trim() || "Someone", text: text.trim() });
    onDone();
  };

  const letGo = () => {
    setReleasing(true);
    if (editingId) deleteUnsent(editingId);
    setTimeout(() => onDone(), 1600);
  };

  if (releasing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-6xl animate-drift" aria-hidden>✉️</div>
        <h2 className="mt-10 font-display text-2xl font-bold">Released.</h2>
        <p className="mt-2 max-w-xs text-muted">Gone, not saved anywhere. Sometimes the writing was the point.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-3xl bg-butter-200/60 p-4 text-sm dark:bg-butter-400/10">
        🔒 <span className="font-semibold">This never gets sent.</span> Not to anyone, not ever. It stays on this device until you delete it.
      </div>

      <label htmlFor="unsent-to" className="mb-1.5 mt-5 block text-sm font-semibold">To</label>
      <TextInput id="unsent-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Who's it for?" maxLength={60} />
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
        {TO_IDEAS.map((t) => (
          <button key={t} onClick={() => setTo(t)} className="shrink-0 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink">
            {t}
          </button>
        ))}
      </div>

      <label htmlFor="unsent-text" className="mb-1.5 mt-5 block text-sm font-semibold">Say the thing</label>
      <TextArea
        id="unsent-text"
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="The thing you never got to say, or the thing you'd say if there were no consequences…"
        maxLength={5000}
        className="font-[450]"
      />
      <p className="mt-1 text-right text-xs text-muted">{text.length}/5000</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="soft" size="lg" disabled={!text.trim()} onClick={letGo}>
          Let it go 🕊️
        </Button>
        <Button size="lg" disabled={!text.trim()} onClick={save}>
          {editingId ? "Save changes" : "Keep privately"}
        </Button>
      </div>

      {unsent.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Your unsent messages</p>
          <ul className="space-y-2">
            {unsent.map((m) => (
              <li key={m.id} className={cn("rounded-3xl border border-line bg-surface p-4", editingId === m.id && "border-lavender-400")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">To: {m.to}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setTo(m.to);
                        setText(m.text);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      aria-label="Revise"
                      className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(m.id)} aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted hover:text-coral-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted">{m.text}</p>
                <p className="mt-1 text-xs text-muted">{formatDay(m.updatedAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Delete message">
        <h2 className="font-display text-xl font-bold">Delete this message?</h2>
        <p className="mt-1 text-muted">It&apos;ll be gone for good — there&apos;s no copy anywhere else.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="soft" onClick={() => setConfirmDelete(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmDelete) deleteUnsent(confirmDelete);
              if (editingId === confirmDelete) {
                setEditingId(undefined);
                setText("");
                setTo("");
              }
              setConfirmDelete(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
