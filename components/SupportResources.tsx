"use client";

import { MessageSquare, Phone, ExternalLink } from "lucide-react";
import { REGIONS } from "@/lib/safety";
import { useApp } from "@/lib/store";
import type { RegionId } from "@/lib/types";

export default function SupportResources({ compact }: { compact?: boolean }) {
  const region = useApp((s) => s.profile.region);
  const updateProfile = useApp((s) => s.updateProfile);
  const minor = useApp((s) => s.profile.ageRange === "16-17");
  const r = REGIONS[region] ?? REGIONS.OTHER;
  const lines = minor ? [...r.lines].sort((a, b) => Number(Boolean(b.youth)) - Number(Boolean(a.youth))) : r.lines;

  return (
    <div>
      <div className="rounded-3xl bg-coral-500 p-4 text-white">
        <p className="font-display text-lg font-bold">In immediate danger?</p>
        <p className="text-sm text-white/90">
          Call emergency services on <span className="font-bold">{r.emergency}</span>.
        </p>
        {/^\d+$/.test(r.emergency) && (
          <a href={`tel:${r.emergency}`} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-coral-600">
            <Phone size={16} aria-hidden /> Call {r.emergency}
          </a>
        )}
      </div>

      <ul className="mt-3 space-y-2.5">
        {lines.map((l) => (
          <li key={l.name} className="rounded-3xl border border-line bg-surface p-4">
            <p className="font-semibold">{l.name}</p>
            <p className="text-sm text-muted">{l.detail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {l.phone && (
                <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-lavender-600 px-3 py-2 text-sm font-semibold text-white dark:bg-lavender-400 dark:text-midnight-900">
                  <Phone size={14} aria-hidden /> Call
                </a>
              )}
              {l.sms && (
                <a href={`sms:${l.sms}`} className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold">
                  <MessageSquare size={14} aria-hidden /> Text
                </a>
              )}
              {l.url && !compact && (
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold">
                  <ExternalLink size={14} aria-hidden /> Website
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <label className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">Showing resources for</span>
        <select
          value={region}
          onChange={(e) => updateProfile({ region: e.target.value as RegionId })}
          className="rounded-xl border border-line bg-surface px-3 py-2 font-semibold"
        >
          {(Object.keys(REGIONS) as RegionId[]).map((k) => (
            <option key={k} value={k}>
              {REGIONS[k].label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
