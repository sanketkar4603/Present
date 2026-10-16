"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Lock, RefreshCw, Trash2 } from "lucide-react";
import { CrisisNudge } from "@/components/MoodCheckIn";
import { Button, Card, Chip, EmptyState, LinkButton, Modal, PageHeader, TextArea, TextInput } from "@/components/ui";
import { EXERCISE_MAP, JOURNAL_TAGS, MOODS, REFLECTION_PROMPTS } from "@/lib/content";
import { detectCrisis } from "@/lib/safety";
import { useApp } from "@/lib/store";
import { cn, dayKey, formatDay, formatTime, startOfWeek, timeOfDay } from "@/lib/utils";

const TABS = [
  { id: "moods", label: "Moods" },
  { id: "reflections", label: "Reflections" },
  { id: "wins", label: "Wins" },
  { id: "unsent", label: "Unsent" },
  { id: "insights", label: "Weekly" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <Journal />
    </Suspense>
  );
}

function Journal() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get("tab") as TabId) || "moods";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initial) ? initial : "moods");

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="Your private corner."
        right={
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted">
            <Lock size={12} aria-hidden /> On this device only
          </span>
        }
      />
      <div role="tablist" aria-label="Journal sections" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              router.replace(`/journal?tab=${t.id}`, { scroll: false });
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === t.id ? "bg-ink text-bg" : "bg-surface text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5" role="tabpanel">
        {tab === "moods" && <MoodsTab />}
        {tab === "reflections" && <ReflectionsTab />}
        {tab === "wins" && <WinsTab />}
        {tab === "unsent" && <UnsentTab />}
        {tab === "insights" && <InsightsTab />}
      </div>
    </div>
  );
}

function ConfirmDelete({ id, onCancel, onConfirm }: { id: string | null; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={Boolean(id)} onClose={onCancel} title="Delete entry">
      <h2 className="font-display text-xl font-bold">Delete this entry?</h2>
      <p className="mt-1 text-muted">It only lives on this device, so it&apos;ll be gone for good.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="soft" onClick={onCancel}>
          Keep
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------- Moods ---------------------------------- */

function MoodsTab() {
  const moods = useApp((s) => s.moods);
  const deleteMood = useApp((s) => s.deleteMood);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const days = Array.from({ length: 14 }).map((_, i) => dayKey(Date.now() - (13 - i) * 86400000));
  const byDay = new Map<string, (typeof moods)[number]>();
  for (const m of [...moods].reverse()) byDay.set(dayKey(m.at), m);

  if (!moods.length) {
    return (
      <EmptyState
        emoji="🌤️"
        title="No check-ins yet"
        body="Check in from Home whenever you like. Over time you'll see your own weather patterns."
        action={<LinkButton href="/">Check in now</LinkButton>}
      />
    );
  }

  const grouped = new Map<string, typeof moods>();
  for (const m of moods) {
    const k = formatDay(m.at);
    grouped.set(k, [...(grouped.get(k) ?? []), m]);
  }

  return (
    <div>
      <Card>
        <p className="text-sm font-semibold">Last 14 days</p>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((d) => {
            const m = byDay.get(d);
            const meta = m && MOODS.find((x) => x.id === m.mood);
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <div
                  className="grid aspect-square w-full place-items-center rounded-2xl text-lg"
                  style={{ background: meta ? `${meta.color}33` : "var(--surface-2)" }}
                  title={meta ? `${d}: ${meta.label}` : d}
                >
                  <span aria-hidden>{meta?.emoji ?? ""}</span>
                </div>
                <span className="text-[10px] text-muted">{new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Shows your latest check-in each day. Weather changes — so do moods.</p>
      </Card>

      {[...grouped.entries()].map(([day, list]) => (
        <section key={day} className="mt-5">
          <h3 className="mb-2 px-1 text-sm font-bold text-muted">{day}</h3>
          <ul className="space-y-2">
            {list.map((m) => {
              const meta = MOODS.find((x) => x.id === m.mood)!;
              return (
                <li key={m.id} className="flex gap-3 rounded-3xl border border-line bg-surface p-4">
                  <span className="text-3xl" aria-hidden>{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {meta.label} <span className="font-normal text-muted">· {formatTime(m.at)}</span>
                    </p>
                    {m.tags.length > 0 && <p className="text-sm text-muted">#{m.tags.join(" #")}</p>}
                    {m.note && <p className="mt-1 whitespace-pre-wrap text-[15px]">{m.note}</p>}
                  </div>
                  <button onClick={() => setToDelete(m.id)} aria-label="Delete check-in" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2">
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <ConfirmDelete
        id={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteMood(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}

/* ---------------------------- Reflections ------------------------------- */

function ReflectionsTab() {
  const journal = useApp((s) => s.journal);
  const addJournal = useApp((s) => s.addJournal);
  const deleteJournal = useApp((s) => s.deleteJournal);
  const [promptIdx, setPromptIdx] = useState(() => new Date().getDate() % REFLECTION_PROMPTS.length);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [crisis, setCrisis] = useState(false);
  const entries = journal.filter((j) => j.kind !== "win");
  const prompt = REFLECTION_PROMPTS[promptIdx];

  const save = () => {
    if (!text.trim()) return;
    setCrisis(detectCrisis(text));
    addJournal({ kind: "reflection", title: prompt, text: text.trim(), tags });
    setText("");
    setTags([]);
  };

  return (
    <div>
      <Card>
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-lg font-bold">{prompt}</p>
          <button onClick={() => setPromptIdx((promptIdx + 1) % REFLECTION_PROMPTS.length)} aria-label="Different prompt" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink">
            <RefreshCw size={16} />
          </button>
        </div>
        <TextArea className="mt-3" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write as much or as little as you like…" maxLength={5000} aria-label={prompt} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {JOURNAL_TAGS.map((t) => (
            <Chip key={t} active={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} className="px-3 py-1.5 text-xs">
              #{t}
            </Chip>
          ))}
        </div>
        <Button block className="mt-4" onClick={save} disabled={!text.trim()}>
          Save reflection
        </Button>
        {crisis && <CrisisNudge />}
      </Card>

      {entries.length === 0 ? (
        <div className="mt-5">
          <EmptyState emoji="📓" title="Nothing written yet" body="Reflections from exercises and quests land here too — only if you choose to save them." />
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {entries.map((j) => (
            <li key={j.id} className="rounded-3xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted">
                    {formatDay(j.at)} · {formatTime(j.at)}
                    {j.kind === "exercise" && j.exerciseId && j.exerciseId !== "touch-grass" ? ` · ${EXERCISE_MAP[j.exerciseId].emoji} exercise` : ""}
                    {j.kind === "quest" ? " · 🗺️ real-world" : ""}
                  </p>
                  {j.title && <p className="mt-0.5 font-semibold">{j.title}</p>}
                </div>
                <button onClick={() => setToDelete(j.id)} aria-label="Delete entry" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2">
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed">{j.text}</p>
              {j.tags.length > 0 && <p className="mt-2 text-xs text-muted">#{j.tags.join(" #")}</p>}
            </li>
          ))}
        </ul>
      )}
      <ConfirmDelete
        id={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteJournal(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}

/* -------------------------------- Wins ---------------------------------- */

function WinsTab() {
  const journal = useApp((s) => s.journal);
  const addJournal = useApp((s) => s.addJournal);
  const deleteJournal = useApp((s) => s.deleteJournal);
  const [text, setText] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const wins = journal.filter((j) => j.kind === "win");

  return (
    <div>
      <Card>
        <p className="font-display text-lg font-bold">Log a small win 🏆</p>
        <p className="text-sm text-muted">Got out of bed? Replied to the email? Drank water? Counts.</p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addJournal({ kind: "win", text: text.trim(), tags: [] });
            setText("");
          }}
        >
          <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="Today I…" maxLength={280} aria-label="Your win" />
          <Button type="submit" disabled={!text.trim()}>
            Add
          </Button>
        </form>
      </Card>
      {wins.length === 0 ? (
        <div className="mt-5">
          <EmptyState emoji="🫙" title="Your wins jar is empty (for now)" body="Small wins are easy to forget. Drop them here so future-you can find them on a harder day." />
        </div>
      ) : (
        <ul className="mt-5 grid gap-2.5">
          {wins.map((w, i) => (
            <li
              key={w.id}
              className={cn(
                "flex items-start gap-3 rounded-3xl p-4",
                ["bg-butter-200/70 dark:bg-butter-400/10", "bg-mint-200/60 dark:bg-mint-600/15", "bg-lavender-100 dark:bg-midnight-500"][i % 3],
              )}
            >
              <span className="text-xl" aria-hidden>✨</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{w.text}</p>
                <p className="text-xs text-muted">{formatDay(w.at)}</p>
              </div>
              <button onClick={() => setToDelete(w.id)} aria-label="Delete win" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface/60">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDelete
        id={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteJournal(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}

/* ------------------------------- Unsent --------------------------------- */

function UnsentTab() {
  const unsent = useApp((s) => s.unsent);
  return (
    <div>
      <p className="mb-4 rounded-3xl bg-surface-2 p-4 text-sm text-muted">
        🔒 Unsent messages are never sent anywhere. Revise or delete them in the Unsent Message exercise.
      </p>
      {unsent.length === 0 ? (
        <EmptyState emoji="✉️" title="No unsent messages" body="Got something you can't say out loud? Write it here. Nobody will ever see it." action={<LinkButton href="/exercise/unsent">Write one</LinkButton>} />
      ) : (
        <>
          <ul className="space-y-2.5">
            {unsent.map((m) => (
              <li key={m.id} className="rounded-3xl border border-line bg-surface p-4">
                <p className="text-sm font-semibold">To: {m.to}</p>
                <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[15px] text-muted">{m.text}</p>
                <p className="mt-1 text-xs text-muted">{formatDay(m.updatedAt)}</p>
              </li>
            ))}
          </ul>
          <LinkButton href="/exercise/unsent" variant="soft" block className="mt-4">
            Write, revise or delete
          </LinkButton>
        </>
      )}
    </div>
  );
}

/* ------------------------------ Insights -------------------------------- */

function InsightsTab() {
  const moods = useApp((s) => s.moods);
  const completions = useApp((s) => s.completions);
  const journal = useApp((s) => s.journal);

  const data = useMemo(() => {
    const weekStart = startOfWeek().getTime();
    const lastWeekStart = weekStart - 7 * 86400000;
    const wMoods = moods.filter((m) => m.at >= weekStart);
    const lMoods = moods.filter((m) => m.at >= lastWeekStart && m.at < weekStart);
    const wDone = completions.filter((c) => c.at >= weekStart);
    const counts = MOODS.map((m) => ({ ...m, n: wMoods.filter((x) => x.mood === m.id).length })).filter((m) => m.n > 0);
    const tagCounts = new Map<string, number>();
    for (const m of wMoods) for (const t of m.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    for (const j of journal.filter((x) => x.at >= weekStart)) for (const t of j.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const helped = new Map<string, number>();
    for (const c of completions) {
      if ((c.feeling === "lighter" || c.feeling === "calmer") && c.exerciseId !== "quest" && c.exerciseId !== "touch-grass") {
        helped.set(c.exerciseId, (helped.get(c.exerciseId) ?? 0) + 1);
      }
    }
    const topHelped = [...helped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const times = new Map<string, number>();
    for (const m of wMoods) {
      const t = timeOfDay(new Date(m.at));
      times.set(t, (times.get(t) ?? 0) + 1);
    }
    const busiestTime = [...times.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      wMoods,
      lMoods,
      wDone,
      counts,
      topTags,
      topHelped,
      busiestTime,
      realWorld: wDone.filter((c) => c.realWorld).length,
      wins: journal.filter((j) => j.kind === "win" && j.at >= weekStart).length,
    };
  }, [moods, completions, journal]);

  if (!data.wMoods.length && !data.wDone.length) {
    return (
      <EmptyState
        emoji="🔭"
        title="Your week is just getting started"
        body="Check in or try an exercise or two, and this page will reflect your week back to you — patterns, not labels."
        action={<LinkButton href="/explore">Find something to try</LinkButton>}
      />
    );
  }

  const max = Math.max(1, ...data.counts.map((c) => c.n));

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-lavender-100 to-mint-200/50 dark:from-midnight-500 dark:to-midnight-600">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lavender-600 dark:text-lavender-300">This week, so far</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini value={data.wMoods.length} label="check-ins" />
          <Mini value={data.wDone.length} label="activities" />
          <Mini value={data.realWorld} label="real-world" />
        </div>
        <p className="mt-4 text-[15px]">
          {data.wMoods.length > data.lMoods.length && data.lMoods.length > 0
            ? "You checked in with yourself more often than last week. That's real self-awareness."
            : data.realWorld > 0
              ? `You got out into real life ${data.realWorld} time${data.realWorld === 1 ? "" : "s"} this week. That's the good stuff.`
              : "You showed up for yourself this week. That counts, whatever it looked like."}
        </p>
      </Card>

      {data.counts.length > 0 && (
        <Card>
          <p className="font-semibold">Your weather this week</p>
          <ul className="mt-3 space-y-2">
            {data.counts.map((m) => (
              <li key={m.id} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0">
                  {m.emoji} {m.label}
                </span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full" style={{ width: `${(m.n / max) * 100}%`, background: m.color }} />
                </span>
                <span className="w-5 text-right font-semibold">{m.n}</span>
              </li>
            ))}
          </ul>
          {data.busiestTime && <p className="mt-3 text-sm text-muted">You tended to check in during the {data.busiestTime}.</p>}
        </Card>
      )}

      {data.topTags.length > 0 && (
        <Card>
          <p className="font-semibold">What came up most</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.topTags.map(([t, n]) => (
              <span key={t} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">
                #{t} <span className="text-muted">×{n}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {data.topHelped.length > 0 && (
        <Card>
          <p className="font-semibold">What seemed to help you</p>
          <p className="text-sm text-muted">Based on times you said you felt lighter or calmer afterwards.</p>
          <ul className="mt-3 space-y-2">
            {data.topHelped.map(([id, n]) => {
              const e = EXERCISE_MAP[id as keyof typeof EXERCISE_MAP];
              if (!e) return null;
              return (
                <li key={id}>
                  <Link href={`/exercise/${id}`} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3 py-2.5 text-sm font-semibold hover:bg-lavender-100 dark:hover:bg-midnight-500">
                    <span aria-hidden>{e.emoji}</span>
                    <span className="flex-1">{e.title}</span>
                    <span className="text-muted">helped {n}×</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <p className="px-2 text-center text-xs text-muted">
        Patterns, not labels. This is a mirror, not a diagnosis — and you know yourself better than any chart does.
      </p>
    </div>
  );
}

function Mini({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-surface/70 p-3">
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
