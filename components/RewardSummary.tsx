"use client";

import { ACHIEVEMENT_MAP, COLLECTIBLE_MAP, LEVELS } from "@/lib/gamification";
import type { Reward } from "@/lib/types";

export default function RewardSummary({ reward }: { reward: Reward }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-1.5">
        <span className="rounded-full bg-gradient-to-r from-butter-300 to-coral-300 px-4 py-1.5 font-display text-lg font-extrabold text-midnight-800 animate-pop">
          +{reward.xp} XP
        </span>
        {reward.capped && (
          <span className="text-center text-xs text-muted">XP rests after a full day — real life is the reward now.</span>
        )}
      </div>
      {reward.levelUp && (
        <div className="rounded-3xl bg-lavender-100 p-4 text-center animate-pop dark:bg-midnight-500">
          <div className="text-xs font-bold uppercase tracking-wider text-lavender-600 dark:text-lavender-300">Level up</div>
          <div className="font-display text-xl font-extrabold">
            Level {reward.levelUp} · {LEVELS[reward.levelUp - 1]?.name}
          </div>
          <p className="mt-1 text-sm text-muted">Your island just grew a little. Go take a look.</p>
        </div>
      )}
      {reward.items.map((id) => {
        const c = COLLECTIBLE_MAP[id];
        if (!c) return null;
        return (
          <div key={id} className="flex items-center gap-3 rounded-3xl bg-mint-200/60 p-3 animate-pop dark:bg-mint-600/20">
            <span className="text-3xl" aria-hidden>
              {c.emoji}
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-mint-600 dark:text-mint-300">New for your island</div>
              <div className="font-semibold">{c.name}</div>
            </div>
          </div>
        );
      })}
      {reward.achievements.map((id) => {
        const a = ACHIEVEMENT_MAP[id];
        if (!a) return null;
        return (
          <div key={id} className="flex items-center gap-3 rounded-3xl bg-butter-200/70 p-3 animate-pop dark:bg-butter-400/15">
            <span className="text-3xl" aria-hidden>
              {a.emoji}
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-coral-600 dark:text-butter-300">Achievement</div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-muted">{a.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
