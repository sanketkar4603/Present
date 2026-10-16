"use client";

import { useState } from "react";

const COLORS = ["#a68cf3", "#6fdcb2", "#ff8c76", "#ffcf5c", "#c3b0fb"];

function makePieces(count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1.2 + Math.random() * 0.9,
    size: 6 + Math.random() * 6,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
    round: i % 3 === 0,
  }));
}

/** Lightweight CSS confetti. Neutralised automatically by the reduced-motion rules. */
export default function Confetti({ count = 26 }: { count?: number }) {
  const [pieces] = useState(() => makePieces(count));
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden" aria-hidden>
      <style>{`@keyframes confetti-fall{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(260px) rotate(540deg);opacity:0}}`}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            borderRadius: p.round ? 999 : 2,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
