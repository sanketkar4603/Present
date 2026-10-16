# PRESENT

*Stop living in your head. Start living your life.*

A playful, gamified mindfulness app for Gen Z. You get small real-world quests, one-tap grounding resets, and Nimbus, a little cloud companion whose island grows when you go and live your actual life.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. You can go through onboarding (about two minutes, and every question can be skipped) or tap **"Just look around (demo mode)"** to load sample data.

## Install on a phone

### Android app (APK)

```bash
npm run android:apk
```

This builds a static copy of the app (`BUILD_TARGET=mobile`, output in `out/`), syncs it into the Capacitor Android project (`android/`), and writes an installable **`dist/PRESENT.apk`**. It needs Android Studio, or a JDK 21 plus the Android SDK. The script finds the copies that Android Studio installs by default.

To install it, copy the APK to your phone and open it. Android will ask you to allow "Install unknown apps" for whichever app opened the file. You can also plug the phone in with USB debugging on and run `adb install -r dist/PRESENT.apk`.

How the phone app works:
- Everything works offline. Data is stored on the phone, just like in the browser.
- The companion replies on-device and nothing you type is sent anywhere. To use real AI instead, deploy the web app (with `ANTHROPIC_API_KEY` set) and rebuild with `NEXT_PUBLIC_COMPANION_API_URL=https://your-domain/api/companion`. The API already allows the app's `https://localhost` origin through CORS.
- "Export my data" opens Android's share sheet, so you can save the file to Drive, Files, email and so on.
- The app draws under the status and navigation bars and uses the safe-area insets so nothing is hidden. The system bar icons switch with the app's light or dark theme.
- `npm run android:open` opens the project in Android Studio. Use that to run it on an emulator or to build a signed release for the Play Store.
- `npm run icons` regenerates the launcher icons and splash screens from `scripts/make-icons.mjs`.

### iPhone, or any phone, as a web app

Once the web app is deployed to an HTTPS URL, open it in Safari or Chrome and choose **Share → Add to Home Screen** (or **Install app**). The manifest and icons in `public/` make it open full-screen like a native app. A native iOS build would need a Mac with Xcode: run `npx cap add ios` there.

### Optional: real AI for the companion

The companion works out of the box with a built-in responder. To use Claude for replies, copy `.env.example` to `.env.local` and set:

```
ANTHROPIC_API_KEY=sk-ant-...
# COMPANION_MODEL=claude-opus-5-5   (default)
```

The key is only read on the server, in `app/api/companion/route.ts`. Requests use low effort for short chat replies and server-side refusal fallbacks (`fallbacks: "default"`). If the API errors or declines a request, the route falls back to the local responder, so the user always gets a reply.

## What's in the MVP

| Area | What works |
| --- | --- |
| **Onboarding** | Welcome, goals, usual feelings, session length, optional name and age range, then you meet the companion and get a personalised starter journey. Demo mode is offered from the first screen. |
| **Home: Reality Hub** | Mood spectrum check-in with tags and a note. Daily Reality Quest (up to 2 swaps a day). A big "I'm stuck in my head" button. Future-Me reminders, exercises picked for you, progress stats, and an offline "before you go" action. |
| **Exercises (15, all working)** | Custom interactions: 5-4-3-2-1 Reset, Colour Hunt, Breathing Bubble (3 rhythms, pause, "breathe naturally"), Overthinking Parking Lot, Digital Detox (longer sessions unlock as you go, ends with a chime), Reality Bingo (daily 3×3), Unsent Message (save, revise, delete or "let it go"). Guided step engine: Thought Detective, Emotion Decoder, Body Check-In, Main Character Walk, Tiny Courage Quest, Future-Me Check (schedules an in-app reminder), Sleep Wind-Down, Connection Challenge. |
| **Completion flow** | "How do you feel now?", an optional reflection (+5 XP), an optional save to the journal, then the reward screen and an offline action. |
| **Gamification** | XP, 10 levels, 4 companion growth stages, 21 island collectibles, 15 achievements, a weekly themed adventure, and optional streaks that pause on rest days instead of breaking. XP stops for the day after 220 so the app doesn't reward spending more time in it. Mood never affects score. |
| **Companion** | Requires consent first and says plainly it's an AI, not a therapist. Starter prompts, action buttons that link to exercises, gentle "take it offline" nudges, and a clear-history option. |
| **My World** | Floating island with a sky that follows the time of day. It grows with your level and shows your collectibles, achievements and a 28-day "days you showed up" grid. |
| **Journal** | Moods (14-day strip and history), reflections (with rotating prompts and tags), wins diary, unsent messages, and a weekly reflection showing patterns rather than labels. |
| **Phone extras (v1.1)** | Optional daily check-in notification at a time you choose. Future-Me reminders arrive as phone notifications; permission is only asked for when you set one. Haptic feedback, which can be turned off. The Android back button closes pop-ups first. Optional 4-digit PIN lock that re-locks after 30 seconds in the background, with the support page still reachable while locked. Restore from a backup file. |
| **Unstuck Reset (v1.2)** | The "I'm stuck in my head" button now gives a different tiny reset each time: 22 activities across senses, body, breath, brain games and thought tricks, from 30 seconds to 2 minutes. It avoids the last 10 you've seen and switches type each time. Shuffle for a different one, tap "Still stuck — one more", or turn on "In public" for subtle ones only. |
| **Colour Hunt** | A new real-world mini-game: you get a colour and find 5 things that colour around you. It comes with its own collectible and achievement, and is part of "Colour Hunt Week". |
| **Also** | Touch Grass mode, Settings (theme, reduced motion, larger text, streaks, nudges, AI on/off, support region), JSON export, delete-all, a privacy page, and a support page. |

## Safety and ethics built in

- **Crisis pathway**: `lib/safety.ts` screens check-in notes, reflections and chat messages. A chat message that matches is never sent to the AI: the app answers on the device with emergency numbers and crisis lines for the user's region (AU, NZ, US, UK, CA, IE, IN, plus findahelpline.com for anywhere else). The server runs the same check as a second layer.
- No diagnoses or clinical labels anywhere. The weekly reflection is described as "a mirror, not a diagnosis".
- Every exercise can be skipped or stopped, and leaving early still counts.
- No public leaderboards, no guilt-based streaks, no "we miss you" notifications.
- Users aged 16–17 have AI chat off by default, get a more careful system prompt, and see youth helplines first.
- The companion system prompt rules out diagnosing and encouraging dependency, and tells it to point people to real humans.

## Data and privacy

Everything (profile, moods, journal, progress, chat history) is stored in `localStorage` under `present-v1` through a Zustand persist store (`lib/store.ts`). Nothing leaves the device except chat messages, and only when the user has opted in. Users can export or delete their data in Settings.

**Next step for accounts:** move the persisted slices into Supabase tables keyed by `auth.uid()` with row-level security (`user_id = auth.uid()` on select/insert/update/delete). The `PersistedState` interface in `lib/store.ts` already lists every field that would need syncing.

## Project map

```
app/                 routes (home, explore, companion, world, journal, exercise/[id], settings, support, privacy, touch-grass)
app/api/companion    server-only chat endpoint (validation, rate limit, crisis screen, Claude + local fallback)
components/          UI kit, mascot, island, check-in, quest card, celebration
components/exercises custom exercises + guided step engine + shared completion flow
lib/content.ts       exercises, quests, moods, bingo, touch-grass activities, weekly adventures, microcopy
lib/guided.ts        step definitions for guided exercises
lib/gamification.ts  levels, collectibles, achievements, gentle rhythm
lib/store.ts         persisted app state + reward logic
lib/safety.ts        crisis detection + regional support lines
lib/companion.ts     system prompt, local responder, action tags
```

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: production build
- `npm run typecheck`: TypeScript only

> PRESENT is a wellness and self-awareness tool. It does not diagnose or treat any condition and is not a substitute for professional care.
