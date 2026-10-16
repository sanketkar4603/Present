import type { Completion, ExerciseId, JournalEntry, MoodEntry } from "./types";
import { dayKey } from "./utils";

/* ------------------------------------------------------------------ */
/* Levels — based on exploration, never on mood.                       */
/* ------------------------------------------------------------------ */

export const LEVELS: { xp: number; name: string }[] = [
  { xp: 0, name: "Just Landed" },
  { xp: 60, name: "Noticer" },
  { xp: 160, name: "Wanderer" },
  { xp: 300, name: "Sky Watcher" },
  { xp: 480, name: "Grounded" },
  { xp: 720, name: "Explorer" },
  { xp: 1000, name: "Fully Present" },
  { xp: 1350, name: "Main Character" },
  { xp: 1800, name: "Lighthouse" },
  { xp: 2400, name: "Island Keeper" },
];

export function levelFor(xp: number): number {
  let lvl = 1;
  LEVELS.forEach((l, i) => {
    if (xp >= l.xp) lvl = i + 1;
  });
  return lvl;
}

export function levelProgress(xp: number) {
  const level = levelFor(xp);
  const current = LEVELS[level - 1];
  const next = LEVELS[level];
  if (!next) return { level, name: current.name, pct: 100, toNext: 0, nextName: null as string | null };
  const pct = Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100);
  return { level, name: current.name, pct, toNext: next.xp - xp, nextName: next.name };
}

/** Companion stage grows with level: wisp → puff → nimbus → cumulus. */
export function companionStage(level: number): 0 | 1 | 2 | 3 {
  if (level >= 7) return 3;
  if (level >= 5) return 2;
  if (level >= 3) return 1;
  return 0;
}

export const STAGE_NAMES = ["Wisp", "Puff", "Nimbus", "Cumulus"];

/** Daily XP soft cap: the goal is more time in real life, not more time in the app. */
export const DAILY_XP_CAP = 220;

/* ------------------------------------------------------------------ */
/* Stats derived from state                                            */
/* ------------------------------------------------------------------ */

export interface GameSnapshot {
  xp: number;
  completions: Completion[];
  moods: MoodEntry[];
  journal: JournalEntry[];
  activeDays: string[];
  bingoLines: number;
  unsentCount: number;
  welcomedBack: boolean;
  onboarded: boolean;
}

export interface Stats {
  count: (id: Completion["exerciseId"]) => number;
  distinctExercises: number;
  realWorld: number;
  quests: number;
  moods: number;
  moodNotes: number;
  wins: number;
  reflections: number;
  activeDays: number;
  level: number;
  bingoLines: number;
  welcomedBack: boolean;
  onboarded: boolean;
}

export function computeStats(s: GameSnapshot): Stats {
  const counts = new Map<string, number>();
  for (const c of s.completions) counts.set(c.exerciseId, (counts.get(c.exerciseId) ?? 0) + 1);
  const exerciseIds = new Set(
    s.completions.filter((c) => c.exerciseId !== "quest" && c.exerciseId !== "touch-grass").map((c) => c.exerciseId),
  );
  return {
    count: (id) => counts.get(id) ?? 0,
    distinctExercises: exerciseIds.size,
    realWorld: s.completions.filter((c) => c.realWorld).length,
    quests: counts.get("quest") ?? 0,
    moods: s.moods.length,
    moodNotes: s.moods.filter((m) => m.note && m.note.trim().length > 0).length,
    wins: s.journal.filter((j) => j.kind === "win").length,
    reflections: s.journal.filter((j) => j.kind === "reflection" || j.kind === "exercise").length,
    activeDays: s.activeDays.length,
    level: levelFor(s.xp),
    bingoLines: s.bingoLines,
    welcomedBack: s.welcomedBack,
    onboarded: s.onboarded,
  };
}

/* ------------------------------------------------------------------ */
/* Collectibles for the island                                          */
/* ------------------------------------------------------------------ */

export interface Collectible {
  id: string;
  name: string;
  emoji: string;
  hint: string;
  /** Position on the island, in % of the island scene. */
  x: number;
  y: number;
  size?: number;
  test: (s: Stats) => boolean;
}

const did = (id: ExerciseId) => (s: Stats) => s.count(id) > 0;

export const COLLECTIBLES: Collectible[] = [
  { id: "sprout", name: "First Sprout", emoji: "🌱", hint: "Arrive. (You did!)", x: 50, y: 62, test: (s) => s.onboarded },
  { id: "tulips", name: "Tiny Tulips", emoji: "🌷", hint: "Check in with your mood", x: 30, y: 66, size: 0.9, test: (s) => s.moods > 0 },
  { id: "pebbles", name: "Grounding Stones", emoji: "🪨", hint: "Complete a 5-4-3-2-1 Reality Reset", x: 66, y: 70, size: 0.8, test: did("grounding") },
  { id: "pond", name: "Breathing Pond", emoji: "🫧", hint: "Breathe with the bubble", x: 40, y: 72, test: did("breathing") },
  { id: "lantern", name: "Parking Lantern", emoji: "🏮", hint: "Park a thought in the Parking Lot", x: 78, y: 57, size: 0.9, test: did("parking") },
  { id: "tree", name: "Oak of Patience", emoji: "🌳", hint: "Complete 3 Reality Quests", x: 22, y: 50, size: 1.6, test: (s) => s.quests >= 3 },
  { id: "bench", name: "Sit-a-While Bench", emoji: "🪑", hint: "Finish a Digital Detox", x: 58, y: 58, test: did("detox") },
  { id: "kite", name: "Main Character Kite", emoji: "🪁", hint: "Go on a Main Character Walk", x: 74, y: 22, size: 1.1, test: did("walk") },
  { id: "mushrooms", name: "Feelings Mushrooms", emoji: "🍄", hint: "Decode an emotion", x: 16, y: 66, size: 0.8, test: did("emotion") },
  { id: "telescope", name: "Detective's Telescope", emoji: "🔭", hint: "Solve a case with Thought Detective", x: 84, y: 64, size: 0.9, test: did("detective") },
  { id: "mailbox", name: "Unsent Mailbox", emoji: "📮", hint: "Write an Unsent Message", x: 34, y: 56, size: 0.9, test: did("unsent") },
  { id: "bunting", name: "Bingo Bunting", emoji: "🎏", hint: "Get a line in Reality Bingo", x: 46, y: 44, size: 0.9, test: (s) => s.bingoLines > 0 },
  { id: "fireflies", name: "Fireflies", emoji: "✨", hint: "Do a Sleep Wind-Down", x: 28, y: 36, size: 0.9, test: did("winddown") },
  { id: "cat", name: "A Cat Who Visits", emoji: "🐈", hint: "Show up on 5 different days (any 5!)", x: 62, y: 66, size: 0.9, test: (s) => s.activeDays >= 5 },
  { id: "hammock", name: "Hammock", emoji: "🌴", hint: "Do a Body Check-In", x: 88, y: 50, size: 1.2, test: did("body") },
  { id: "flag", name: "Courage Flag", emoji: "🚩", hint: "Take on a Tiny Courage Quest", x: 54, y: 54, size: 0.9, test: did("courage") },
  { id: "sunflower", name: "Future Sunflower", emoji: "🌻", hint: "Do a Future-Me Check", x: 72, y: 64, test: did("futureme") },
  { id: "campfire", name: "Campfire", emoji: "🔥", hint: "Try the Connection Challenge", x: 46, y: 64, size: 0.9, test: did("connection") },
  { id: "jar", name: "Wins Jar", emoji: "🫙", hint: "Log 3 small wins", x: 12, y: 58, size: 0.8, test: (s) => s.wins >= 3 },
  { id: "rainbow", name: "Little Rainbow", emoji: "🌈", hint: "Reach level 5", x: 20, y: 18, size: 1.5, test: (s) => s.level >= 5 },
  { id: "palette", name: "Paint Palette", emoji: "🎨", hint: "Finish a Colour Hunt", x: 38, y: 50, size: 0.9, test: did("colours") },
  { id: "balloon", name: "Hot Air Balloon", emoji: "🎈", hint: "Touch grass (for real) via Touch Grass mode", x: 88, y: 28, size: 1, test: (s) => s.count("touch-grass") > 0 },
];

export const COLLECTIBLE_MAP = Object.fromEntries(COLLECTIBLES.map((c) => [c.id, c]));

/* ------------------------------------------------------------------ */
/* Achievements — effort & reflection, never mood scores.               */
/* ------------------------------------------------------------------ */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  test: (s: Stats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "little-things", title: "Noticed the Little Things", description: "Completed a 5-4-3-2-1 Reality Reset.", emoji: "🔎", test: did("grounding") },
  { id: "phone-free", title: "Phone-Free Explorer", description: "Finished a Digital Detox Challenge.", emoji: "📵", test: did("detox") },
  { id: "space-feeling", title: "Made Space for a Feeling", description: "Decoded an emotion or wrote about how you felt.", emoji: "🫶", test: (s) => s.count("emotion") > 0 || s.moodNotes > 0 },
  { id: "on-purpose", title: "Breathed on Purpose", description: "Followed the Breathing Bubble.", emoji: "🫧", test: did("breathing") },
  { id: "parked", title: "Parked It", description: "Parked a thought instead of looping on it.", emoji: "🅿️", test: did("parking") },
  { id: "kind-detective", title: "Kind Detective", description: "Investigated a stressful thought with kindness.", emoji: "🕵️", test: did("detective") },
  { id: "quest-taker", title: "Quest Taker", description: "Completed your first Reality Quest.", emoji: "🗺️", test: (s) => s.quests > 0 },
  { id: "regular", title: "Real-Life Regular", description: "Completed 5 real-world experiences.", emoji: "🌍", test: (s) => s.realWorld >= 5 },
  { id: "bingo", title: "Bingo, Actually", description: "Got a line on Reality Bingo.", emoji: "🎯", test: (s) => s.bingoLines > 0 },
  { id: "unsaid", title: "Said the Unsaid", description: "Wrote an Unsent Message (privately).", emoji: "✉️", test: did("unsent") },
  { id: "in-colour", title: "Saw It in Colour", description: "Found a colour hiding all around you.", emoji: "🌈", test: did("colours") },
  { id: "main-character", title: "Main Character Energy", description: "Went on a Main Character Walk.", emoji: "🎬", test: did("walk") },
  { id: "wins", title: "Collector of Small Wins", description: "Logged 3 small wins.", emoji: "🏆", test: (s) => s.wins >= 3 },
  { id: "curious", title: "Curious Explorer", description: "Tried 5 different exercises.", emoji: "🧭", test: (s) => s.distinctExercises >= 5 },
  { id: "welcome-back", title: "Welcome Back", description: "Came back after a break. Breaks are part of it.", emoji: "🏡", test: (s) => s.welcomedBack },
  { id: "reflective", title: "Deep Diver", description: "Saved 5 private reflections.", emoji: "🌊", test: (s) => s.reflections >= 5 },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function newUnlocks(stats: Stats, haveItems: string[], haveAchievements: string[]) {
  const items = COLLECTIBLES.filter((c) => !haveItems.includes(c.id) && c.test(stats)).map((c) => c.id);
  const achievements = ACHIEVEMENTS.filter((a) => !haveAchievements.includes(a.id) && a.test(stats)).map((a) => a.id);
  return { items, achievements };
}

/* ------------------------------------------------------------------ */
/* Consistency — "days you showed up", streaks optional & pausable.     */
/* ------------------------------------------------------------------ */

/**
 * Gentle rhythm: counts consecutive active days, but allows up to 2 rest days
 * in a row without resetting. Rest days pause the rhythm instead of breaking it.
 */
export function gentleRhythm(activeDays: string[], today: string): { days: number; paused: boolean } {
  const set = new Set(activeDays);
  const cursor = new Date(today + "T12:00:00");
  let days = 0;
  let gap = 0;
  let paused = !set.has(today);
  for (let i = 0; i < 400; i++) {
    if (set.has(dayKey(cursor))) {
      days++;
      gap = 0;
    } else {
      gap++;
      if (gap > 2) break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  if (days === 0) paused = false;
  return { days, paused };
}
