"use client";

import { useEffect, useState } from "react";
import { Toggle } from "../ui";
import { isNative, notificationPermission, requestNotificationPermission, type NotifyPermission } from "@/lib/native";
import { useApp } from "@/lib/store";

export default function NotificationSettings() {
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  const toast = useApp((s) => s.toast);
  const [permission, setPermission] = useState<NotifyPermission>("unsupported");

  useEffect(() => {
    void notificationPermission().then(setPermission);
  }, []);

  if (!isNative()) {
    return (
      <p className="py-2 text-sm text-muted">
        📱 Phone notifications and haptics are available in the Android app. Here in the browser, nudges and Future-Me reminders appear when you open PRESENT.
      </p>
    );
  }

  const enableDaily = async (on: boolean) => {
    if (!on) {
      updateSettings({ dailyNotify: false });
      return;
    }
    const ok = await requestNotificationPermission();
    setPermission(ok ? "granted" : "denied");
    if (!ok) {
      toast("Notifications are blocked for PRESENT in your phone's settings.", "🔕");
      return;
    }
    updateSettings({ dailyNotify: true });
    toast(`We'll check in at ${settings.dailyNotifyTime}. Once a day, that's it.`, "🌙");
  };

  return (
    <div className="divide-y divide-line">
      <div>
        <Toggle
          checked={settings.dailyNotify}
          onChange={enableDaily}
          label="Daily check-in notification"
          description="One gentle nudge a day at a time you pick. Never guilt, never 'we miss you'."
        />
        {settings.dailyNotify && (
          <label className="flex items-center justify-between gap-3 pb-3 text-sm font-semibold">
            Time
            <input
              type="time"
              value={settings.dailyNotifyTime}
              onChange={(e) => e.target.value && updateSettings({ dailyNotifyTime: e.target.value })}
              className="rounded-xl border border-line bg-surface px-3 py-2 font-semibold"
            />
          </label>
        )}
      </div>
      <div className="py-3 text-sm text-muted">
        {permission === "granted"
          ? "✅ Future-Me reminders also arrive as phone notifications."
          : permission === "denied"
            ? "🔕 Notifications are off in your phone's settings, so reminders only appear inside the app."
            : "Future-Me reminders appear in the app. Allow notifications to get them on your phone too."}
      </div>
      <Toggle
        checked={settings.haptics}
        onChange={(v) => updateSettings({ haptics: v })}
        label="Haptic feedback"
        description="Tiny vibrations on taps, rewards and breathing changes."
      />
    </div>
  );
}
