"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type MascotMood = "happy" | "calm" | "curious" | "sleepy" | "proud" | "cozy";

/**
 * Nimbus — a tiny floating cloud. Grows accessories as the user levels up:
 * stage 0 wisp, 1 sprout, 2 scarf, 3 star crown + glow.
 */
export default function Mascot({
  size = 120,
  mood = "happy",
  stage = 0,
  float = true,
  className,
  label,
}: {
  size?: number;
  mood?: MascotMood;
  stage?: 0 | 1 | 2 | 3;
  float?: boolean;
  className?: string;
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ink = "#2a1d4f";
  return (
    <div
      className={cn("relative inline-block", float && "animate-float", className)}
      style={{ width: size, height: size * 0.82 }}
      role="img"
      aria-label={label ?? `Your companion, looking ${mood}`}
    >
      <svg viewBox="0 0 200 164" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={`body-${id}`} x1="40" y1="20" x2="170" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#efe8ff" />
            <stop offset="1" stopColor="#cdbdfd" />
          </linearGradient>
          <radialGradient id={`glow-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffe08f" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffe08f" stopOpacity="0" />
          </radialGradient>
          <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#5a3fb0" floodOpacity="0.25" />
          </filter>
        </defs>

        {stage >= 3 && <circle cx="104" cy="92" r="84" fill={`url(#glow-${id})`} className="animate-twinkle" />}

        {/* shadow on the ground */}
        <ellipse cx="104" cy="156" rx="46" ry="6" fill="#2a1d4f" opacity="0.12" />

        <g filter={`url(#soft-${id})`} fill={`url(#body-${id})`}>
          <circle cx="68" cy="98" r="38" />
          <circle cx="108" cy="72" r="48" />
          <circle cx="146" cy="100" r="34" />
          <rect x="40" y="96" width="132" height="44" rx="22" />
        </g>

        {/* sprout */}
        {stage >= 1 && (
          <g transform="translate(108 26)">
            <path d="M0 0 C0 -8 0 -12 0 -16" stroke="#24a379" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M0 -12 C-12 -22 -20 -14 -18 -8 C-12 -6 -6 -8 0 -12Z" fill="#6fdcb2" />
            <path d="M0 -14 C10 -26 20 -18 18 -12 C12 -9 6 -10 0 -14Z" fill="#3fc596" />
          </g>
        )}

        {/* star crown */}
        {stage >= 3 && (
          <g transform="translate(140 36) rotate(18)">
            <path d="M0 -11 L3 -3 L11 -3 L5 2 L7 10 L0 5 L-7 10 L-5 2 L-11 -3 L-3 -3Z" fill="#ffcf5c" stroke="#f5b83d" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        )}

        {/* cheeks */}
        <ellipse cx="78" cy="112" rx="9" ry="5.5" fill="#ff8c76" opacity="0.35" />
        <ellipse cx="136" cy="112" rx="9" ry="5.5" fill="#ff8c76" opacity="0.35" />

        <Face mood={mood} ink={ink} />

        {/* scarf */}
        {stage >= 2 && (
          <g>
            <path d="M52 128 C80 142 132 142 162 128 L164 138 C134 152 80 152 50 138Z" fill="#ff8c76" />
            <path d="M146 136 L156 160 L144 162 L138 140Z" fill="#f76d55" />
            <path d="M60 132 L62 140 M76 137 L77 145 M94 140 L94 148 M112 140 L112 148 M130 138 L129 146" stroke="#ffd3ca" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {mood === "sleepy" && (
          <g fill={ink} opacity="0.55" fontFamily="var(--font-display)" fontWeight="700">
            <text x="158" y="44" fontSize="16" className="animate-twinkle">z</text>
            <text x="170" y="28" fontSize="12" className="animate-twinkle" style={{ animationDelay: "0.8s" }}>z</text>
          </g>
        )}
        {mood === "proud" && (
          <g fill="#ffcf5c">
            <path d="M30 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" className="animate-twinkle" />
            <path d="M176 64 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" className="animate-twinkle" style={{ animationDelay: "1s" }} />
          </g>
        )}
      </svg>
    </div>
  );
}

function Face({ mood, ink }: { mood: MascotMood; ink: string }) {
  const stroke = { stroke: ink, strokeWidth: 4.5, strokeLinecap: "round" as const, fill: "none" };
  switch (mood) {
    case "happy":
      return (
        <g>
          <path d="M84 100 q7 -9 14 0" {...stroke} />
          <path d="M116 100 q7 -9 14 0" {...stroke} />
          <path d="M98 112 q9 9 18 0" {...stroke} />
        </g>
      );
    case "calm":
    case "cozy":
      return (
        <g>
          <path d="M84 98 q7 7 14 0" {...stroke} />
          <path d="M116 98 q7 7 14 0" {...stroke} />
          <path d="M100 113 q7 5 14 0" {...stroke} strokeWidth={4} />
        </g>
      );
    case "sleepy":
      return (
        <g>
          <path d="M84 100 h14" {...stroke} />
          <path d="M116 100 h14" {...stroke} />
          <ellipse cx="107" cy="115" rx="4" ry="3" fill={ink} opacity="0.8" />
        </g>
      );
    case "curious":
      return (
        <g>
          <circle cx="91" cy="98" r="6.5" fill={ink} />
          <circle cx="123" cy="98" r="6.5" fill={ink} />
          <circle cx="93" cy="95.5" r="2.2" fill="#fff" />
          <circle cx="125" cy="95.5" r="2.2" fill="#fff" />
          <ellipse cx="107" cy="115" rx="4.5" ry="5" fill={ink} />
        </g>
      );
    case "proud":
    default:
      return (
        <g>
          <circle cx="91" cy="98" r="6.5" fill={ink} />
          <circle cx="123" cy="98" r="6.5" fill={ink} />
          <circle cx="93" cy="95.5" r="2.2" fill="#fff" />
          <circle cx="125" cy="95.5" r="2.2" fill="#fff" />
          <path d="M95 110 q12 14 24 0 z" fill={ink} />
        </g>
      );
  }
}
