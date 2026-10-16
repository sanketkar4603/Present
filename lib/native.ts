import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import type { Reminder } from "./types";

/** True inside the installed Android app; false in a browser. */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/* ------------------------------------------------------------------ */
/* System bars                                                          */
/* ------------------------------------------------------------------ */

/** Keep the phone's status/navigation bar icons readable against the app theme. */
export async function syncSystemBars(dark: boolean): Promise<void> {
  if (!isNative()) return;
  try {
    // "Dark" = light icons on a dark background.
    await SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light });
  } catch {
    /* cosmetic only */
  }
}

/* ------------------------------------------------------------------ */
/* Haptics                                                              */
/* ------------------------------------------------------------------ */

let hapticsOn = true;
export function setHapticsEnabled(on: boolean) {
  hapticsOn = on;
}

export type HapticKind = "tap" | "soft" | "success";

/** Subtle feedback for meaningful moments. No-op in browsers or when disabled. */
export function haptic(kind: HapticKind = "tap"): void {
  if (!hapticsOn || !isNative()) return;
  void import("@capacitor/haptics")
    .then(({ Haptics, ImpactStyle, NotificationType }) => {
      if (kind === "success") return Haptics.notification({ type: NotificationType.Success });
      return Haptics.impact({ style: kind === "soft" ? ImpactStyle.Light : ImpactStyle.Medium });
    })
    .catch(() => {});
}

/* ------------------------------------------------------------------ */
/* Android back button                                                  */
/* ------------------------------------------------------------------ */

/** Open modals register a close function so the back button dismisses them first. */
const backHandlers: (() => void)[] = [];

export function pushBackHandler(fn: () => void): () => void {
  backHandlers.push(fn);
  return () => {
    const i = backHandlers.lastIndexOf(fn);
    if (i >= 0) backHandlers.splice(i, 1);
  };
}

/** Back closes the top modal, else goes back a screen, else sends the app to the background. */
export async function installBackButton(): Promise<() => void> {
  if (!isNative()) return () => {};
  const { App } = await import("@capacitor/app");
  const handle = await App.addListener("backButton", ({ canGoBack }) => {
    const top = backHandlers[backHandlers.length - 1];
    if (top) top();
    else if (canGoBack && window.location.pathname !== "/") window.history.back();
    else void App.minimizeApp();
  });
  return () => void handle.remove();
}

/* ------------------------------------------------------------------ */
/* Export via share sheet                                               */
/* ------------------------------------------------------------------ */

/**
 * Browsers download a file; Android WebViews can't, so in the app we write the
 * export to the cache and open the system share sheet (save to Drive, email, etc.).
 */
export async function shareTextFile(filename: string, contents: string): Promise<boolean> {
  if (!isNative()) return false;
  const { Directory, Encoding, Filesystem } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");
  const file = await Filesystem.writeFile({
    path: filename,
    data: contents,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  await Share.share({ title: "PRESENT data export", files: [file.uri], dialogTitle: "Save your PRESENT data" });
  return true;
}

/* ------------------------------------------------------------------ */
/* Gentle local notifications                                           */
/* ------------------------------------------------------------------ */

const DAILY_ID = 7001;

function reminderId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return 10000 + (Math.abs(h) % 1_000_000);
}

export type NotifyPermission = "granted" | "denied" | "prompt" | "unsupported";

export async function notificationPermission(): Promise<NotifyPermission> {
  if (!isNative()) return "unsupported";
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const { display } = await LocalNotifications.checkPermissions();
  return display === "granted" ? "granted" : display === "denied" ? "denied" : "prompt";
}

/** Ask only in context — when the person has just chosen to get a reminder. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const current = await LocalNotifications.checkPermissions();
  if (current.display === "granted") return true;
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

/**
 * Idempotently mirrors app state into scheduled notifications: one daily
 * check-in (if enabled) plus one per upcoming Future-Me reminder. Never prompts.
 */
export async function syncNotifications(opts: {
  daily: boolean;
  time: string;
  companionName: string;
  reminders: Reminder[];
}): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    if ((await LocalNotifications.checkPermissions()).display !== "granted") return;

    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) => (n.extra as { app?: string } | undefined)?.app === "present");
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) });

    const now = Date.now();
    const notifications = [];
    if (opts.daily) {
      const [hour, minute] = opts.time.split(":").map(Number);
      notifications.push({
        id: DAILY_ID,
        title: "Where's your head at?",
        body: `${opts.companionName} saved you a spot. 30 seconds, zero pressure.`,
        schedule: { on: { hour, minute }, allowWhileIdle: true },
        isExactNotification: false,
        extra: { app: "present", route: "/" },
      });
    }
    for (const r of opts.reminders.filter((x) => !x.done && x.dueAt > now).slice(0, 30)) {
      notifications.push({
        id: reminderId(r.id),
        title: "A little note from past you 🔮",
        body: r.text,
        schedule: { at: new Date(r.dueAt), allowWhileIdle: true },
        isExactNotification: false,
        extra: { app: "present", route: "/" },
      });
    }
    if (notifications.length) await LocalNotifications.schedule({ notifications });
  } catch {
    /* reminders also show inside the app, so a failure here is never fatal */
  }
}

/** Tapping a notification opens the app on the right screen. */
export async function installNotificationTaps(navigate: (route: string) => void): Promise<() => void> {
  if (!isNative()) return () => {};
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const handle = await LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
    const route = (action.notification.extra as { route?: string } | undefined)?.route;
    if (route) navigate(route);
  });
  return () => void handle.remove();
}
