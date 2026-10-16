"use client";

import { useEffect, useState } from "react";
import Mascot, { type MascotMood } from "./Mascot";
import { COLLECTIBLE_MAP, companionStage } from "@/lib/gamification";
import { cn, timeOfDay, type TimeOfDay } from "@/lib/utils";

const SKIES: Record<TimeOfDay, [string, string]> = {
  morning: ["#ffd9c7", "#cdbdfd"],
  afternoon: ["#bfe3ff", "#ece4ff"],
  evening: ["#ff9f8a", "#7152d4"],
  night: ["#150e2a", "#362865"],
};

export default function Island({
  items,
  level,
  mood = "happy",
  compact,
  className,
}: {
  items: string[];
  level: number;
  mood?: MascotMood;
  compact?: boolean;
  className?: string;
}) {
  const [tod, setTod] = useState<TimeOfDay>("afternoon");
  useEffect(() => setTod(timeOfDay()), []);
  const [top, bottom] = SKIES[tod];
  const night = tod === "night";
  const stage = companionStage(level);

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-4xl", compact ? "aspect-[16/10]" : "aspect-[4/3.4]", className)}
      style={{ background: `linear-gradient(180deg, ${top}, ${bottom})` }}
      role="img"
      aria-label={`Your island at level ${level}, with ${items.length} collectible${items.length === 1 ? "" : "s"}.`}
    >
      <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night ? "#3fc596" : "#a3ecd0"} />
            <stop offset="1" stopColor={night ? "#24a379" : "#6fdcb2"} />
          </linearGradient>
          <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night ? "#4b3b7e" : "#c9a98a"} />
            <stop offset="1" stopColor={night ? "#1d1438" : "#8a6b58"} />
          </linearGradient>
          <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6fdcb2" stopOpacity="0" />
            <stop offset="0.5" stopColor="#6fdcb2" stopOpacity="0.45" />
            <stop offset="1" stopColor="#a68cf3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sun / moon */}
        {night ? (
          <g>
            <circle cx="330" cy="58" r="20" fill="#fff7ec" />
            <circle cx="340" cy="52" r="18" fill={top} />
            {Array.from({ length: 26 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 73) % 400}
                cy={(i * 37) % 150}
                r={i % 3 === 0 ? 1.6 : 1}
                fill="#fff"
                className="animate-twinkle"
                style={{ animationDelay: `${(i % 7) * 0.4}s` }}
              />
            ))}
            {level >= 8 && <path d="M0 90 C100 40 220 120 400 60 L400 100 C240 150 120 70 0 130Z" fill="url(#aurora)" />}
          </g>
        ) : (
          <circle cx="330" cy={tod === "evening" ? 150 : 60} r="26" fill="#ffe08f" opacity={tod === "evening" ? 0.9 : 1} />
        )}

        {/* clouds */}
        <g fill="#fff" opacity={night ? 0.12 : 0.75}>
          <ellipse cx="70" cy="70" rx="34" ry="12" className="animate-float" />
          <ellipse cx="250" cy="40" rx="26" ry="9" className="animate-float" style={{ animationDelay: "2s" }} />
        </g>

        {/* floating extras grow with level */}
        {level >= 2 && (
          <g className="animate-float" style={{ animationDelay: "1s" }}>
            <ellipse cx="44" cy="196" rx="20" ry="6" fill="url(#grass)" />
            <path d="M24 196 Q44 230 64 196Z" fill="url(#dirt)" />
          </g>
        )}
        {level >= 6 && (
          <g className="animate-float" style={{ animationDelay: "2.5s" }}>
            <ellipse cx="362" cy="150" rx="26" ry="7" fill="url(#grass)" />
            <path d="M336 150 Q362 196 388 150Z" fill="url(#dirt)" />
            <text x="352" y="146" fontSize="16">🌼</text>
          </g>
        )}

        {/* main island */}
        <path d="M40 212 C60 300 150 318 200 318 C250 318 340 300 360 212Z" fill="url(#dirt)" />
        <path d="M70 250 C100 262 120 255 140 266 M240 270 C270 258 300 262 320 248" stroke="#000" strokeOpacity="0.08" strokeWidth="3" fill="none" />
        <ellipse cx="200" cy="212" rx="164" ry="44" fill="url(#grass)" />
        <ellipse cx="200" cy="206" rx="150" ry="34" fill="#fff" opacity="0.12" />

        {/* waterfall */}
        {level >= 4 && (
          <g>
            <path d="M300 236 C304 260 300 290 306 318" stroke="#bfe3ff" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M300 236 C304 260 300 290 306 318" stroke="#fff" strokeWidth="3" strokeDasharray="6 10" fill="none" opacity="0.8" className="animate-[shimmer_2s_linear_infinite]" />
          </g>
        )}

        {/* grass tufts */}
        {Array.from({ length: Math.min(4 + level * 2, 18) }).map((_, i) => {
          const x = 60 + ((i * 53) % 280);
          const y = 196 + ((i * 17) % 30);
          return <path key={i} d={`M${x} ${y} l3 -8 l3 8 l3 -6 l2 6`} stroke={night ? "#24a379" : "#3fc596"} strokeWidth="2" fill="none" strokeLinecap="round" />;
        })}
      </svg>

      {/* collectibles */}
      <div className="absolute inset-0">
        {items.map((id, i) => {
          const c = COLLECTIBLE_MAP[id];
          if (!c) return null;
          // Map the 0–100 design grid onto the island area of the scene.
          const top = c.y < 45 ? c.y : 54 + (c.y - 45) * 0.9;
          return (
            <span
              key={id}
              className="absolute -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.18)] animate-pop"
              style={{
                left: `${c.x}%`,
                top: `${top}%`,
                fontSize: `${(compact ? 1.25 : 1.75) * (c.size ?? 1)}rem`,
                animationDelay: `${i * 40}ms`,
              }}
              title={c.name}
              aria-hidden
            >
              <span className="inline-block animate-bob" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
                {c.emoji}
              </span>
            </span>
          );
        })}
      </div>

      {/* companion */}
      <div className="absolute left-1/2 top-[14%] -translate-x-1/2">
        <Mascot size={compact ? 84 : 120} mood={night ? "sleepy" : mood} stage={stage} />
      </div>
    </div>
  );
}
