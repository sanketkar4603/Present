"use client";

import { MotionConfig } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottomNav from "./BottomNav";
import Celebration from "./Celebration";
import LockScreen from "./LockScreen";
import Mascot from "./Mascot";
import QuickResetFab from "./QuickResetFab";
import Toasts from "./Toasts";
import { RELOCK_AFTER_MS } from "@/lib/lock";
import {
  installBackButton,
  installNotificationTaps,
  setHapticsEnabled,
  syncNotifications,
  syncSystemBars,
} from "@/lib/native";
import { useApp } from "@/lib/store";

const PUBLIC_ROUTES = ["/onboarding", "/support", "/privacy"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [locked, setLocked] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const settings = useApp((s) => s.settings);
  const onboarded = useApp((s) => Boolean(s.profile.onboardedAt));
  const companionName = useApp((s) => s.profile.companionName);
  const reminders = useApp((s) => s.reminders);
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const finish = () => setMounted(true);
    if (useApp.persist.hasHydrated()) finish();
    const unsub = useApp.persist.onFinishHydration(finish);
    return unsub;
  }, []);

  // Theme + accessibility classes on <html>.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      void syncSystemBars(dark);
    };
    apply();
    root.classList.toggle("reduce-motion", settings.reducedMotion);
    root.classList.toggle("text-lg-mode", settings.largeText);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mounted, settings.theme, settings.reducedMotion, settings.largeText]);

  useEffect(() => setHapticsEnabled(settings.haptics), [settings.haptics]);

  useEffect(() => {
    if (!mounted) return;
    useApp.getState().ensureDaily();
    useApp.getState().touchVisit();
  }, [mounted]);

  // Native-only wiring: hardware back button and notification taps.
  useEffect(() => {
    const cleanups: Promise<() => void>[] = [installBackButton(), installNotificationTaps((route) => router.push(route))];
    return () => cleanups.forEach((p) => void p.then((off) => off()));
  }, [router]);

  // Keep scheduled phone notifications in step with settings and reminders.
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      void syncNotifications({
        daily: settings.dailyNotify,
        time: settings.dailyNotifyTime,
        companionName,
        reminders,
      });
    }, 400);
    return () => clearTimeout(t);
  }, [mounted, settings.dailyNotify, settings.dailyNotifyTime, companionName, reminders]);

  // A PIN created (or changed) during this session shouldn't lock you out on the spot.
  const lockHash = settings.lock?.hash ?? null;
  const prevLockHash = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!mounted) return;
    if (prevLockHash.current !== undefined && lockHash && lockHash !== prevLockHash.current) setLocked(false);
    prevLockHash.current = lockHash;
  }, [mounted, lockHash]);

  // Re-lock after the app has been in the background for a while.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
      } else {
        if (hiddenAt.current && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) setLocked(true);
        hiddenAt.current = null;
        useApp.getState().ensureDaily();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!onboarded && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) router.replace("/onboarding");
  }, [mounted, onboarded, pathname, router]);

  if (!mounted || (!onboarded && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r)))) {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Mascot size={96} mood="curious" />
          <span className="text-sm">Floating in…</span>
        </div>
      </div>
    );
  }

  // Support stays reachable while locked — it shows no personal data.
  if (settings.lock && locked && !pathname.startsWith("/support")) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  const immersive = pathname.startsWith("/exercise") || pathname.startsWith("/onboarding");

  return (
    <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "user"}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto min-h-dvh w-full max-w-xl">
        <main id="main" className={immersive ? "" : "px-4 pb-36"}>
          {children}
        </main>
      </div>
      {!immersive && onboarded && (
        <>
          <QuickResetFab />
          <BottomNav />
        </>
      )}
      <Toasts />
      <Celebration />
    </MotionConfig>
  );
}
