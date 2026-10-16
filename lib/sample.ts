import { computeStats, newUnlocks } from "./gamification";
import { guessRegion } from "./safety";
import type { PersistedState } from "./store";
import type { Completion, JournalEntry, MoodEntry } from "./types";
import { dayKey, uid } from "./utils";

const DAY = 86400000;

/** Realistic sample history so people can explore without signing up. */
export function buildDemoState(): Partial<PersistedState> {
  const now = Date.now();
  const at = (daysAgo: number, hour: number) => {
    const d = new Date(now - daysAgo * DAY);
    d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
    return d.getTime();
  };

  const moods: MoodEntry[] = [
    { id: uid(), at: at(0, 9), mood: "foggy", tags: ["sleep"], note: "Stayed up too late watching videos again." },
    { id: uid(), at: at(1, 18), mood: "calm", tags: ["friends"], note: "Dinner with Mia was really nice." },
    { id: uid(), at: at(2, 13), mood: "restless", tags: ["school", "future"] },
    { id: uid(), at: at(3, 21), mood: "low", tags: ["socials"], note: "Comparing myself to everyone's internship posts." },
    { id: uid(), at: at(4, 10), mood: "okay", tags: [] },
    { id: uid(), at: at(6, 17), mood: "bright", tags: ["weather", "friends"], note: "Sunny walk to the beach!" },
    { id: uid(), at: at(7, 22), mood: "stormy", tags: ["school"], note: "Exam stress hitting hard." },
    { id: uid(), at: at(8, 12), mood: "okay", tags: ["work"] },
    { id: uid(), at: at(9, 19), mood: "calm", tags: ["body"] },
  ];

  const completions: Completion[] = [
    { id: uid(), exerciseId: "breathing", at: at(0, 9), xp: 15, feeling: "calmer", realWorld: false },
    { id: uid(), exerciseId: "quest", at: at(1, 17), xp: 40, realWorld: true },
    { id: uid(), exerciseId: "detective", at: at(3, 21), xp: 35, feeling: "lighter", realWorld: false },
    { id: uid(), exerciseId: "grounding", at: at(4, 11), xp: 25, feeling: "calmer", realWorld: false },
    { id: uid(), exerciseId: "walk", at: at(6, 16), xp: 45, feeling: "lighter", realWorld: true },
    { id: uid(), exerciseId: "quest", at: at(6, 18), xp: 40, realWorld: true },
    { id: uid(), exerciseId: "grounding", at: at(7, 22), xp: 25, feeling: "same", realWorld: false },
    { id: uid(), exerciseId: "detox", at: at(8, 13), xp: 30, feeling: "lighter", realWorld: true },
    { id: uid(), exerciseId: "parking", at: at(9, 20), xp: 20, feeling: "calmer", realWorld: false },
  ];

  const journal: JournalEntry[] = [
    { id: uid(), at: at(1, 20), kind: "win", text: "Actually went to the gym instead of just thinking about it.", tags: ["body"] },
    { id: uid(), at: at(3, 21), kind: "exercise", title: "Thought Detective", exerciseId: "detective", tags: [], text: "Thought: Everyone has their life figured out except me.\nBalanced: I'm seeing everyone's highlight reel. Most of my friends are figuring it out too — Jay literally said so last week." },
    { id: uid(), at: at(5, 22), kind: "reflection", tags: ["gratitude", "friends"], text: "What made you smile today? — Mia sent me a voice note of her cat sneezing. I watched it like 6 times." },
    { id: uid(), at: at(6, 18), kind: "quest", title: "Look at the sky for one full minute", tags: [], text: "The clouds were moving so fast. Felt weirdly peaceful." },
    { id: uid(), at: at(7, 9), kind: "win", text: "Submitted the assignment a day early.", tags: ["school"] },
    { id: uid(), at: at(9, 21), kind: "win", text: "Said no to an extra shift without feeling (too) guilty.", tags: ["work"] },
  ];

  const activeDays = [0, 1, 3, 4, 6, 7, 8, 9].map((d) => dayKey(now - d * DAY));
  const xp = completions.reduce((a, c) => a + c.xp, 0) + 10 + moods.length * 5 + 35;

  const profile = {
    name: "Riley",
    goals: ["brain", "scroll", "compare"] as PersistedState["profile"]["goals"],
    feeling: "distracted" as const,
    sessionLength: 120 as const,
    ageRange: "18-24" as const,
    companionName: "Nimbus",
    region: guessRegion(),
    onboardedAt: now - 10 * DAY,
  };

  const stats = computeStats({
    xp,
    completions,
    moods,
    journal,
    activeDays,
    bingoLines: 0,
    unsentCount: 1,
    welcomedBack: false,
    onboarded: true,
  });
  const unlocks = newUnlocks(stats, [], []);

  return {
    profile,
    xp,
    moods,
    completions,
    journal,
    activeDays,
    items: unlocks.items,
    achievements: unlocks.achievements.map((id) => ({ id, at: now - 2 * DAY })),
    unsent: [
      {
        id: uid(),
        createdAt: at(4, 23),
        updatedAt: at(4, 23),
        to: "Past me (first year of uni)",
        text: "You don't need to have it all figured out. You're going to find your people. Also please drink some water.",
      },
    ],
    parked: [
      { id: uid(), at: at(9, 20), text: "What if I picked the wrong degree?", bucket: "info", nextStep: "Book a chat with the course advisor." },
      { id: uid(), at: at(2, 13), text: "Whether my group will finish their part on time.", bucket: "cannot" },
    ],
    chat: [],
    lastVisit: now - 2 * 3600000,
  };
}
