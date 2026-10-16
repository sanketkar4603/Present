"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button, Modal } from "../ui";
import { useApp } from "@/lib/store";

export default function RestoreBackup() {
  const importData = useApp((s) => s.importData);
  const toast = useApp((s) => s.toast);
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ data: unknown; summary: string } | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as Record<string, unknown>;
      if (data.app !== "PRESENT") throw new Error("not ours");
      const count = (k: string) => (Array.isArray(data[k]) ? (data[k] as unknown[]).length : 0);
      const when = typeof data.exportedAt === "string" ? new Date(data.exportedAt).toLocaleDateString() : "an earlier date";
      setPending({
        data,
        summary: `From ${when}: ${count("moods")} check-ins, ${count("journal")} journal entries, ${count("completions")} activities.`,
      });
    } catch {
      toast("That file isn't a PRESENT backup.", "⚠️");
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  return (
    <>
      <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-hidden tabIndex={-1} />
      <Button variant="soft" onClick={() => input.current?.click()}>
        <Upload size={16} aria-hidden /> Restore from a backup
      </Button>
      <Modal open={Boolean(pending)} onClose={() => setPending(null)} title="Restore backup">
        <h2 className="font-display text-xl font-bold">Restore this backup?</h2>
        <p className="mt-1 text-muted">{pending?.summary}</p>
        <p className="mt-3 rounded-2xl bg-butter-200/60 p-3 text-sm dark:bg-butter-400/10">
          This replaces what&apos;s currently on this device. Your PIN lock and chat consent here stay as they are.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="soft" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const ok = pending && importData(pending.data);
              setPending(null);
              toast(ok ? "Welcome back — everything's restored." : "Couldn't restore that file.", ok ? "📦" : "⚠️");
            }}
          >
            Restore
          </Button>
        </div>
      </Modal>
    </>
  );
}
