"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "What we store",
    body: "Your onboarding answers, mood check-ins, journal entries, unsent messages, parked thoughts, reminders, progress and companion chats. In this version, all of it is saved in your browser's local storage on this device — not on our servers.",
  },
  {
    title: "What leaves your device",
    body: "Only companion chat messages, and only if you switch AI chat on. They're sent through our server to an AI provider to generate a reply, along with the goals and latest mood label you chose to share. Messages that look like a crisis are never sent — you get support options straight away instead. API keys live on the server, never in the app.",
  },
  {
    title: "What we never do",
    body: "No ads. No selling or sharing data. No using your journal or chats to train AI models or for marketing. No public profiles, leaderboards or sharing of sensitive entries.",
  },
  {
    title: "Young people",
    body: "If you tell us you're under 18, AI chat stays off unless you turn it on, the companion is instructed to be extra careful, and youth support lines are shown first.",
  },
  {
    title: "Your controls",
    body: "Export everything as a JSON file and restore it on another device, delete individual entries, clear your chat, or wipe all data at once from Settings. Deleting is permanent because there's no other copy. An optional PIN lock keeps casual peekers out of a shared phone (only a salted hash of the PIN is stored, and it isn't included in exports).",
  },
  {
    title: "Notifications",
    body: "Off by default. If you turn on the daily check-in or ask for a Future-Me reminder, the notification is scheduled on your phone itself — no server, no push service, no tracking. There's never more than one daily nudge, and never guilt-trip wording.",
  },
  {
    title: "Not medical care",
    body: "PRESENT is a wellness and self-awareness tool. It doesn't diagnose or treat anything, and the AI companion isn't a therapist. If you're struggling, please reach out to a professional or a crisis line.",
  },
];

export default function Privacy() {
  const router = useRouter();
  return (
    <div className="pb-10 pt-4">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> Back
      </button>
      <h1 className="mt-3 font-display text-3xl font-extrabold">Privacy, in plain words</h1>
      <p className="mt-2 text-muted">Short version: your inner world stays yours.</p>
      <div className="mt-6 space-y-3">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-4xl border border-line bg-surface p-5">
            <h2 className="font-display text-lg font-bold">{s.title}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
