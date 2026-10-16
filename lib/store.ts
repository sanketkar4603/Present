"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BINGO_POOL, EXERCISE_MAP, QUESTS } from "./content";
import { DAILY_XP_CAP, computeStats, levelFor, newUnlocks } from "./gamification";
import { guessRegion } from "./safety";
import { buildDemoState } from "./sample";
import type {
  AfterFeeling,
  BingoState,
  ChatMessage,
  Completion,
  ExerciseId,
  JournalEntry,
  MoodEntry,
  MoodId,
  ParkedThought,
  ParkingBucket,
  Profile,
  QuestState,
  Reminder,
  Reward,
  Settings,
  UnsentMessage,
} from "./types";
import { dayKey, seeded, shuffle, uid } from "./utils";

export interface Toast {
  id: string;
  text: string;
  emoji?: string;
}

export interface Celebration extends Reward {
  title: string;
}

export interface PersistedState {
  profile: Profile;
  settings: Settings;
  xp: number;
  xpByDay: Record<string, number>;
  completions: Completion[];
  moods: MoodEntry[];
  journal: JournalEntry[];
  unsent: UnsentMessage[];
  parked: ParkedThought[];
  reminders: Reminder[];
  chat: ChatMessage[];
  quest: QuestState | null;
  bingo: BingoState | null;
  bingoLines: number;
  items: string[];
  achievements: { id: string; at: number }[];
  activeDays: string[];
  lastVisit: number | null;
  welcomedBack: boolean;
  demo: boolean;
  detoxBest: number;
}

interface Actions {
  completeOnboarding: (p: Partial<Profile>) => Reward;
  updateProfile: (p: Partial<Profile>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  touchVisit: () => void;

  logMood: (mood: MoodId, tags: string[], note?: string) => Reward;
  deleteMood: (id: string) => void;
  completeExercise: (
    id: ExerciseId,
    opts: { feeling?: AfterFeeling; note?: string; summary?: string; save?: boolean },
  ) => Reward;
  completeTouchGrass: (title: string, note?: string) => Reward;

  ensureDaily: () => void;
  swapQuest: () => void;
  completeQuest: (note?: string) => Reward;
  toggleBingo: (index: number) => void;

  addJournal: (e: Omit<JournalEntry, "id" | "at">) => Reward;
  deleteJournal: (id: string) => void;

  saveUnsent: (m: { id?: string; to: string; text: string }) => string;
  deleteUnsent: (id: string) => void;

  addParked: (text: string, bucket: ParkingBucket, nextStep?: string) => void;
  resolveParked: (id: string) => void;
  deleteParked: (id: string) => void;

  addReminder: (text: string, dueAt: number) => void;
  completeReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  addChat: (m: Omit<ChatMessage, "id" | "at">) => void;
  clearChat: () => void;

  recordDetox: (minutes: number) => void;

  loadDemo: () => void;
  resetAll: () => void;
  /** Restore from an export file. Returns false if the file isn't a PRESENT backup. */
  importData: (raw: unknown) => boolean;

  toast: (text: string, emoji?: string) => void;
  dismissToast: (id: string) => void;
  celebrate: (c: Celebration) => void;
  dismissCelebration: () => void;
}

interface Transient {
  toasts: Toast[];
  celebration: Celebration | null;
}

export type AppState = PersistedState & Actions & Transient;

export const defaultProfile = (): Profile => ({
  name: "",
  goals: [],
  sessionLength: 120,
  ageRange: "skip",
  companionName: "Nimbus",
  region: guessRegion(),
});

export const defaultSettings = (): Settings => ({
  theme: "system",
  reducedMotion: false,
  largeText: false,
  showStreaks: false,
  aiConsent: false,
  reminderFrequency: "off",
  haptics: true,
  dailyNotify: false,
  dailyNotifyTime: "19:30",
  lock: null,
});

export const initialState = (): PersistedState => ({
  profile: defaultProfile(),
  settings: defaultSettings(),
  xp: 0,
  xpByDay: {},
  completions: [],
  moods: [],
  journal: [],
  unsent: [],
  parked: [],
  reminders: [],
  chat: [],
  quest: null,
  bingo: null,
  bingoLines: 0,
  items: [],
  achievements: [],
  activeDays: [],
  lastVisit: null,
  welcomedBack: false,
  demo: false,
  detoxBest: 0,
});

function pickQuest(day: string, exclude: string[] = [], salt = 0): string {
  const rand = seeded(`quest-${day}-${salt}`);
  const pool = QUESTS.filter((q) => !exclude.includes(q.id));
  return pool[Math.floor(rand() * pool.length)].id;
}

function makeBingo(day: string): BingoState {
  const cells = shuffle(BINGO_POOL, seeded(`bingo-${day}`))
    .slice(0, 9)
    .map((c) => c.id);
  return { day, cells, marked: [], lineRewarded: false };
}

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function bingoHasLine(marked: number[]): boolean {
  return LINES.some((line) => line.every((i) => marked.includes(i)));
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      /**
       * Central reward function. Applies the daily XP soft-cap, marks today as a
       * "day you showed up", and checks for level-ups, items and achievements.
       */
      const grant = (
        rawXp: number,
        mutate?: (s: PersistedState) => Partial<PersistedState>,
        announce: { title: string; mode: "toast" | "celebrate" | "silent" } = { title: "", mode: "toast" },
      ): Reward => {
        const state = get();
        const today = dayKey();
        const changes = mutate ? mutate(state) : {};
        const merged: PersistedState = { ...state, ...changes };

        const earnedToday = merged.xpByDay[today] ?? 0;
        const xp = Math.max(0, Math.min(rawXp, DAILY_XP_CAP - earnedToday));
        const capped = rawXp > 0 && xp < rawXp;
        const prevLevel = levelFor(state.xp);
        const newXp = merged.xp + xp;
        const activeDays = merged.activeDays.includes(today) ? merged.activeDays : [...merged.activeDays, today];

        const xpByDay: Record<string, number> = {};
        const cutoff = dayKey(Date.now() - 14 * 86400000);
        for (const [k, v] of Object.entries(merged.xpByDay)) if (k >= cutoff) xpByDay[k] = v;
        xpByDay[today] = earnedToday + xp;

        const snapshot = { ...merged, xp: newXp, activeDays };
        const stats = computeStats({
          xp: newXp,
          completions: snapshot.completions,
          moods: snapshot.moods,
          journal: snapshot.journal,
          activeDays,
          bingoLines: snapshot.bingoLines,
          unsentCount: snapshot.unsent.length,
          welcomedBack: snapshot.welcomedBack,
          onboarded: Boolean(snapshot.profile.onboardedAt),
        });
        const unlocks = newUnlocks(
          stats,
          snapshot.items,
          snapshot.achievements.map((a) => a.id),
        );
        const level = levelFor(newXp);
        const reward: Reward = {
          xp,
          capped,
          levelUp: level > prevLevel ? level : undefined,
          items: unlocks.items,
          achievements: unlocks.achievements,
        };
        const now = Date.now();
        set({
          ...changes,
          xp: newXp,
          xpByDay,
          activeDays,
          items: [...snapshot.items, ...unlocks.items],
          achievements: [...snapshot.achievements, ...unlocks.achievements.map((id) => ({ id, at: now }))],
        });

        const hasNews = Boolean(reward.levelUp || reward.items.length || reward.achievements.length);
        if (announce.mode === "celebrate" || (announce.mode === "toast" && hasNews)) {
          set({ celebration: { ...reward, title: announce.title || "Nice one" } });
        } else if (announce.mode === "toast") {
          if (xp > 0) get().toast(`+${xp} XP`, "✨");
          else if (capped) get().toast("XP is resting for today. Go enjoy the real thing.", "🌙");
        }
        return reward;
      };

      return {
        ...initialState(),
        toasts: [],
        celebration: null,

        completeOnboarding: (p) => {
          const today = dayKey();
          const { quest, bingo, profile } = get();
          set({
            profile: { ...profile, ...p, onboardedAt: profile.onboardedAt ?? Date.now() },
            quest: quest?.day === today ? quest : { day: today, questId: pickQuest(today), swaps: 0, done: false },
            bingo: bingo?.day === today ? bingo : makeBingo(today),
            lastVisit: Date.now(),
          });
          return grant(10, undefined, { title: "", mode: "silent" });
        },

        updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
        updateSettings: (s) => set({ settings: { ...get().settings, ...s } }),

        touchVisit: () => {
          const { lastVisit, profile } = get();
          const now = Date.now();
          if (profile.onboardedAt && lastVisit && now - lastVisit > 3 * 86400000) {
            set({ welcomedBack: true, lastVisit: now });
            get().toast("Welcome back. No catching up needed — you're right on time.", "🏡");
            grant(0, undefined, { title: "Welcome back", mode: "toast" });
          } else {
            set({ lastVisit: now });
          }
        },

        logMood: (mood, tags, note) => {
          const today = dayKey();
          const todays = get().moods.filter((m) => dayKey(m.at) === today).length;
          // Check-ins are rewarded for showing up, never for which mood was picked.
          const xp = todays < 3 ? 5 + (note?.trim() ? 5 : 0) : 0;
          return grant(
            xp,
            (s) => ({
              moods: [{ id: uid(), at: Date.now(), mood, tags, note: note?.trim() || undefined }, ...s.moods],
            }),
            { title: "Checked in", mode: "toast" },
          );
        },

        deleteMood: (id) => set({ moods: get().moods.filter((m) => m.id !== id) }),

        completeExercise: (id, { feeling, note, summary, save }) => {
          const meta = EXERCISE_MAP[id];
          const reflection = note?.trim();
          const xp = meta.xp + (reflection ? 5 : 0);
          return grant(
            xp,
            (s) => {
              const completion: Completion = {
                id: uid(),
                exerciseId: id,
                at: Date.now(),
                xp,
                feeling,
                realWorld: meta.realWorld,
              };
              const text = [summary, reflection].filter(Boolean).join("\n\n");
              const journal =
                save && text
                  ? [
                      {
                        id: uid(),
                        at: Date.now(),
                        kind: "exercise" as const,
                        title: meta.title,
                        text,
                        tags: [],
                        exerciseId: id,
                      },
                      ...s.journal,
                    ]
                  : s.journal;
              return { completions: [completion, ...s.completions], journal };
            },
            { title: meta.title, mode: "silent" },
          );
        },

        completeTouchGrass: (title, note) =>
          grant(
            25,
            (s) => ({
              completions: [
                { id: uid(), exerciseId: "touch-grass", at: Date.now(), xp: 25, realWorld: true },
                ...s.completions,
              ],
              journal: note?.trim()
                ? [
                    { id: uid(), at: Date.now(), kind: "quest" as const, title, text: note.trim(), tags: [], exerciseId: "touch-grass" as const },
                    ...s.journal,
                  ]
                : s.journal,
            }),
            { title: "You touched grass", mode: "celebrate" },
          ),

        ensureDaily: () => {
          const today = dayKey();
          const { quest, bingo } = get();
          const patch: Partial<PersistedState> = {};
          if (!quest || quest.day !== today) patch.quest = { day: today, questId: pickQuest(today), swaps: 0, done: false };
          if (!bingo || bingo.day !== today) patch.bingo = makeBingo(today);
          if (Object.keys(patch).length) set(patch);
        },

        swapQuest: () => {
          const { quest } = get();
          if (!quest || quest.done || quest.swaps >= 2) return;
          const next = pickQuest(quest.day, [quest.questId], quest.swaps + 1);
          set({ quest: { ...quest, questId: next, swaps: quest.swaps + 1 } });
        },

        completeQuest: (note) => {
          const { quest } = get();
          if (!quest || quest.done) return { xp: 0, capped: false, items: [], achievements: [] };
          const q = QUESTS.find((x) => x.id === quest.questId);
          return grant(
            40 + (note?.trim() ? 5 : 0),
            (s) => ({
              quest: { ...quest, done: true },
              completions: [
                { id: uid(), exerciseId: "quest", at: Date.now(), xp: 40, realWorld: true },
                ...s.completions,
              ],
              journal: note?.trim()
                ? [{ id: uid(), at: Date.now(), kind: "quest" as const, title: q?.title ?? "Reality Quest", text: note.trim(), tags: [] }, ...s.journal]
                : s.journal,
            }),
            { title: "Quest complete", mode: "celebrate" },
          );
        },

        toggleBingo: (index) => {
          const { bingo } = get();
          if (!bingo) return;
          const marked = bingo.marked.includes(index)
            ? bingo.marked.filter((i) => i !== index)
            : [...bingo.marked, index];
          const adding = marked.length > bingo.marked.length;
          const line = bingoHasLine(marked);
          if (line && !bingo.lineRewarded) {
            grant(
              EXERCISE_MAP.bingo.xp + 5,
              (s) => ({
                bingo: { ...bingo, marked, lineRewarded: true },
                bingoLines: s.bingoLines + 1,
                completions: [
                  { id: uid(), exerciseId: "bingo", at: Date.now(), xp: EXERCISE_MAP.bingo.xp, realWorld: true },
                  ...s.completions,
                ],
              }),
              { title: "BINGO!", mode: "celebrate" },
            );
            return;
          }
          if (adding) {
            grant(5, () => ({ bingo: { ...bingo, marked } }), { title: "", mode: "toast" });
          } else {
            set({ bingo: { ...bingo, marked } });
          }
        },

        addJournal: (e) => {
          const today = dayKey();
          const todays = get().journal.filter((j) => dayKey(j.at) === today && j.kind !== "exercise").length;
          const xp = todays < 3 ? (e.kind === "win" ? 5 : 10) : 0;
          return grant(
            xp,
            (s) => ({ journal: [{ ...e, id: uid(), at: Date.now() }, ...s.journal] }),
            { title: e.kind === "win" ? "Win saved" : "Reflection saved", mode: "toast" },
          );
        },

        deleteJournal: (id) => set({ journal: get().journal.filter((j) => j.id !== id) }),

        saveUnsent: ({ id, to, text }) => {
          const now = Date.now();
          if (id && get().unsent.some((m) => m.id === id)) {
            set({ unsent: get().unsent.map((m) => (m.id === id ? { ...m, to, text, updatedAt: now } : m)) });
            return id;
          }
          const newId = uid();
          set({ unsent: [{ id: newId, to, text, createdAt: now, updatedAt: now }, ...get().unsent] });
          return newId;
        },
        deleteUnsent: (id) => set({ unsent: get().unsent.filter((m) => m.id !== id) }),

        addParked: (text, bucket, nextStep) =>
          set({ parked: [{ id: uid(), at: Date.now(), text, bucket, nextStep }, ...get().parked] }),
        resolveParked: (id) =>
          set({ parked: get().parked.map((p) => (p.id === id ? { ...p, resolved: !p.resolved } : p)) }),
        deleteParked: (id) => set({ parked: get().parked.filter((p) => p.id !== id) }),

        addReminder: (text, dueAt) =>
          set({ reminders: [...get().reminders, { id: uid(), text, dueAt, done: false }].sort((a, b) => a.dueAt - b.dueAt) }),
        completeReminder: (id) => set({ reminders: get().reminders.map((r) => (r.id === id ? { ...r, done: true } : r)) }),
        deleteReminder: (id) => set({ reminders: get().reminders.filter((r) => r.id !== id) }),

        addChat: (m) => set({ chat: [...get().chat, { ...m, id: uid(), at: Date.now() }].slice(-100) }),
        clearChat: () => set({ chat: [] }),

        recordDetox: (minutes) => set({ detoxBest: Math.max(get().detoxBest, minutes) }),

        loadDemo: () => {
          const demo = buildDemoState();
          set({ ...initialState(), ...demo, settings: get().settings, demo: true });
          get().ensureDaily();
        },

        importData: (raw) => {
          if (!raw || typeof raw !== "object" || (raw as { app?: unknown }).app !== "PRESENT") return false;
          const d = raw as Partial<PersistedState>;
          const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
          const base = initialState();
          const current = get();
          set({
            ...base,
            profile: { ...base.profile, ...(d.profile ?? {}), onboardedAt: d.profile?.onboardedAt ?? Date.now() },
            // Keep this device's lock + consent choices; take display preferences from the backup.
            settings: { ...current.settings, ...(d.settings ?? {}), lock: current.settings.lock, aiConsent: current.settings.aiConsent },
            xp: typeof d.xp === "number" && d.xp >= 0 ? d.xp : 0,
            completions: arr(d.completions, []),
            moods: arr(d.moods, []),
            journal: arr(d.journal, []),
            unsent: arr(d.unsent, []),
            parked: arr(d.parked, []),
            reminders: arr(d.reminders, []),
            chat: arr(d.chat, []),
            items: arr(d.items, []),
            achievements: arr(d.achievements, []),
            activeDays: arr(d.activeDays, []),
            lastVisit: Date.now(),
            demo: false,
          });
          get().ensureDaily();
          return true;
        },

        resetAll: () => {
          set({ ...initialState(), toasts: [], celebration: null });
        },

        toast: (text, emoji) => {
          const id = uid();
          set({ toasts: [...get().toasts, { id, text, emoji }].slice(-3) });
          setTimeout(() => get().dismissToast(id), 3200);
        },
        dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
        celebrate: (c) => set({ celebration: c }),
        dismissCelebration: () => set({ celebration: null }),
      };
    },
    {
      name: "present-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Deep-merge nested objects so settings added in later versions get their defaults.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          ...p,
          profile: { ...current.profile, ...(p.profile ?? {}) },
          settings: { ...current.settings, ...(p.settings ?? {}) },
        };
      },
      partialize: (s): PersistedState => {
        const { toasts: _t, celebration: _c, ...rest } = s;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (typeof v !== "function") out[k] = v;
        return out as unknown as PersistedState;
      },
    },
  ),
);

export function exportData(): string {
  const s = useApp.getState();
  const data: Partial<PersistedState> & { exportedAt: string; app: string } = {
    app: "PRESENT",
    exportedAt: new Date().toISOString(),
    profile: s.profile,
    settings: { ...s.settings, lock: null },
    xp: s.xp,
    completions: s.completions,
    moods: s.moods,
    journal: s.journal,
    unsent: s.unsent,
    parked: s.parked,
    reminders: s.reminders,
    chat: s.chat,
    items: s.items,
    achievements: s.achievements,
    activeDays: s.activeDays,
  };
  return JSON.stringify(data, null, 2);
}
