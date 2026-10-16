"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Download, Moon, Monitor, Sun } from "lucide-react";
import LockSettings from "@/components/settings/LockSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import RestoreBackup from "@/components/settings/RestoreBackup";
import { Button, Card, Modal, TextInput, Toggle } from "@/components/ui";
import { shareTextFile } from "@/lib/native";
import { REGIONS } from "@/lib/safety";
import { exportData, useApp } from "@/lib/store";
import type { RegionId, Settings } from "@/lib/types";
import { clearUnstuck } from "@/lib/unstuck";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const settings = useApp((s) => s.settings);
  const profile = useApp((s) => s.profile);
  const demo = useApp((s) => s.demo);
  const updateSettings = useApp((s) => s.updateSettings);
  const updateProfile = useApp((s) => s.updateProfile);
  const clearChat = useApp((s) => s.clearChat);
  const resetAll = useApp((s) => s.resetAll);
  const toast = useApp((s) => s.toast);
  const [confirm, setConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const download = async () => {
    const filename = `present-export-${new Date().toISOString().slice(0, 10)}.json`;
    try {
      if (await shareTextFile(filename, exportData())) return;
    } catch {
      toast("Couldn't export right now. Please try again.", "⚠️");
      return;
    }
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast("Your data was exported.", "📦");
  };

  const wipe = () => {
    resetAll();
    try {
      localStorage.removeItem("present-v1");
      clearUnstuck();
    } catch {
      /* ignore */
    }
    setConfirm(false);
    router.replace("/onboarding");
  };

  const themes: { id: Settings["theme"]; label: string; Icon: typeof Sun }[] = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "Auto", Icon: Monitor },
  ];

  return (
    <div className="pb-8 pt-4">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> Back
      </button>
      <h1 className="mt-3 font-display text-3xl font-extrabold">Settings</h1>

      <Section title="You">
        <label htmlFor="s-name" className="mb-1.5 block text-sm font-semibold">Your name</label>
        <TextInput id="s-name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} maxLength={30} placeholder="Optional" />
        <label htmlFor="s-cname" className="mb-1.5 mt-4 block text-sm font-semibold">Companion&apos;s name</label>
        <TextInput id="s-cname" value={profile.companionName} onChange={(e) => updateProfile({ companionName: e.target.value || "Nimbus" })} maxLength={20} />
        <Link href="/onboarding" className="mt-4 inline-block text-sm font-semibold text-lavender-600 dark:text-lavender-300">
          Redo onboarding questions →
        </Link>
      </Section>

      <Section title="Look & feel">
        <p className="mb-2 text-sm font-semibold">Theme</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
          {themes.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="radio"
              aria-checked={settings.theme === id}
              onClick={() => updateSettings({ theme: id })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm font-semibold transition",
                settings.theme === id ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line",
              )}
            >
              <Icon size={18} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <div className="mt-2 divide-y divide-line">
          <Toggle checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} label="Reduce motion" description="Calmer screens: no floating, bouncing or confetti." />
          <Toggle checked={settings.largeText} onChange={(v) => updateSettings({ largeText: v })} label="Larger text" description="Bumps up text size across the app." />
        </div>
      </Section>

      <Section title="Progress & reminders">
        <div className="divide-y divide-line">
          <Toggle
            checked={settings.showStreaks}
            onChange={(v) => updateSettings({ showStreaks: v })}
            label="Show my rhythm (streaks)"
            description="Optional. Rest days pause it — they never break it."
          />
        </div>
        <p className="mb-2 mt-3 text-sm font-semibold">Gentle check-in nudges</p>
        <div className="flex gap-2">
          {(["off", "daily", "weekly"] as const).map((f) => (
            <button
              key={f}
              onClick={() => updateSettings({ reminderFrequency: f })}
              aria-pressed={settings.reminderFrequency === f}
              className={cn(
                "flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold capitalize transition",
                settings.reminderFrequency === f ? "border-lavender-500 bg-lavender-100 dark:bg-midnight-500" : "border-line",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          Nudges and Future-Me reminders appear inside the app when you open it. No guilt trips, no &ldquo;we miss you&rdquo; spam. Ever.
        </p>
      </Section>

      <Section title="Phone notifications & feel">
        <NotificationSettings />
      </Section>

      <Section title="Companion">
        <Toggle
          checked={settings.aiConsent}
          onChange={(v) => updateSettings({ aiConsent: v })}
          label="AI chat"
          description="Chat with your companion. Where replies are generated is explained on the Companion screen. History stays on this device."
        />
        <Button variant="soft" size="sm" className="mt-2" onClick={() => { clearChat(); toast("Conversation cleared.", "🧹"); }}>
          Clear conversation history
        </Button>
      </Section>

      <Section title="Support region">
        <label htmlFor="region" className="block text-sm text-muted">Used to show the right crisis lines and emergency number.</label>
        <select
          id="region"
          value={profile.region}
          onChange={(e) => updateProfile({ region: e.target.value as RegionId })}
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-surface px-3 font-semibold"
        >
          {(Object.keys(REGIONS) as RegionId[]).map((k) => (
            <option key={k} value={k}>
              {REGIONS[k].label}
            </option>
          ))}
        </select>
        <Link href="/support" className="mt-3 inline-block text-sm font-semibold text-lavender-600 dark:text-lavender-300">
          View support resources →
        </Link>
      </Section>

      <Section title="Privacy lock">
        <LockSettings />
      </Section>

      <Section title="Privacy & your data">
        <ul className="space-y-1.5 text-sm text-muted">
          <li>🔒 Journal entries, moods and progress are stored only in this browser.</li>
          <li>🚫 No ads, no selling data, no training AI on your entries.</li>
          <li>💬 AI chat (if on) is sent to generate a reply, then stored only here.</li>
        </ul>
        <Link href="/privacy" className="mt-3 inline-block text-sm font-semibold text-lavender-600 dark:text-lavender-300">
          Read the full privacy note →
        </Link>
        <div className="mt-4 grid gap-2">
          <Button variant="soft" onClick={download}>
            <Download size={16} aria-hidden /> Export my data (JSON)
          </Button>
          <RestoreBackup />
          <Button variant="danger" onClick={() => setConfirm(true)}>
            {demo ? "Leave demo & start fresh" : "Delete all my data"}
          </Button>
        </div>
      </Section>

      <p className="mt-8 text-center text-xs text-muted">
        PRESENT is a wellness and self-awareness tool. It doesn&apos;t diagnose or treat any condition and isn&apos;t a substitute for professional care.
      </p>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete all data">
        <h2 className="font-display text-xl font-bold">Delete everything?</h2>
        <p className="mt-1 text-muted">
          This permanently removes your journal, moods, progress, island and chats from this device. Consider exporting first.
        </p>
        <label htmlFor="confirm-delete" className="mb-1.5 mt-4 block text-sm font-semibold">
          Type <span className="font-mono">delete</span> to confirm
        </label>
        <TextInput id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="soft" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={confirmText.trim().toLowerCase() !== "delete"} onClick={wipe}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">{title}</h2>
      <Card>{children}</Card>
    </section>
  );
}
