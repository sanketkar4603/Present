"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, Compass, Home, MessageCircleHeart, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/companion", label: "Companion", Icon: MessageCircleHeart },
  { href: "/world", label: "My World", Icon: Sprout },
  { href: "/journal", label: "Journal", Icon: BookHeart },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 safe-bottom">
      <div className="mx-auto mb-3 w-[calc(100%-1.5rem)] max-w-md rounded-[1.75rem] border border-line glass px-2 py-1.5 shadow-[0_12px_40px_-12px_rgba(29,20,56,0.45)]">
        <ul className="flex items-stretch justify-between">
          {TABS.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-semibold transition",
                    active ? "text-lavender-600 dark:text-lavender-300" : "text-muted hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-12 place-items-center rounded-full transition",
                      active && "bg-lavender-100 dark:bg-midnight-500",
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
