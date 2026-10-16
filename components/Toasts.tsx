"use client";

import { useApp } from "@/lib/store";

export default function Toasts() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 safe-top-offset z-[70] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold shadow-lg animate-rise"
        >
          {t.emoji && <span aria-hidden>{t.emoji}</span>}
          {t.text}
        </button>
      ))}
    </div>
  );
}
