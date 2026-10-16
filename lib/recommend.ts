import { EXERCISES, MOOD_RECOMMENDATIONS } from "./content";
import type { ExerciseId, FeelingId, GoalId, MoodId, SessionLength } from "./types";

export function recommendFor(goals: GoalId[], feeling: FeelingId | undefined, length: SessionLength): ExerciseId[] {
  const scored = EXERCISES.map((e) => {
    let score = e.goals.filter((g) => goals.includes(g)).length * 3;
    if (e.seconds <= length * 1.5) score += 2;
    if (feeling === "overwhelmed" && (e.id === "grounding" || e.id === "breathing")) score += 3;
    if (feeling === "restless" && (e.id === "walk" || e.id === "breathing")) score += 3;
    if (feeling === "exhausted" && (e.id === "body" || e.id === "winddown")) score += 3;
    if (feeling === "unmotivated" && (e.id === "futureme" || e.id === "courage")) score += 3;
    if (feeling === "distracted" && (e.id === "detox" || e.id === "grounding")) score += 3;
    if (e.id === "grounding") score += 1;
    return { id: e.id, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.id);
}

/** Mix the latest mood with stated goals. Never inferred from journal text. */
export function recommendNow(goals: GoalId[], feeling: FeelingId | undefined, length: SessionLength, mood?: MoodId): ExerciseId[] {
  const base = recommendFor(goals, feeling, length);
  const fromMood = mood ? MOOD_RECOMMENDATIONS[mood] : [];
  return [...new Set([...fromMood, ...base])];
}
