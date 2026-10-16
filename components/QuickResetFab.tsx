"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * One-tap unstuck reset from any major screen. Home has its own big button and the
 * companion has one in its header (so this doesn't cover the chat input).
 */
export default function QuickResetFab() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/settings") || pathname.startsWith("/companion")) return null;
  return (
    <Link
      href="/exercise/unstuck"
      style={{ bottom: "calc(6.5rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))" }}
      className="fixed right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(247,109,85,0.9)] transition active:scale-95 sm:right-[calc(50%-17rem)]"
      aria-label="I'm stuck in my head. Start a quick reset."
    >
      <span aria-hidden>🫧</span> Stuck?
    </Link>
  );
}
