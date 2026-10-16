export type GoalId =
  | "brain"
  | "scroll"
  | "compare"
  | "disconnected"
  | "emotions"
  | "enjoy"
  | "curious";

export type FeelingId =
  | "exhausted"
  | "restless"
  | "overwhelmed"
  | "unmotivated"
  | "distracted"
  | "everything";

export type SessionLength = 30 | 120 | 300 | 600;
export type AgeRange = "16-17" | "18-24" | "25-28" | "29+" | "skip";
export type RegionId = "AU" | "NZ" | "US" | "UK" | "CA" | "IE" | "IN" | "OTHER";

export type MoodId =
  | "stormy"
  | "low"
  | "foggy"
  | "restless"
  | "okay"
  | "calm"
  | "bright";

export type ExerciseId =
  | "grounding"
  | "unstuck"
  | "breathing"
  | "parking"
  | "detective"
  | "detox"
  | "body"
  | "walk"
  | "emotion"
  | "unsent"
  | "courage"
  | "bingo"
  | "futureme"
  | "winddown"
  | "connection"
  | "colours";

export type AfterFeeling = "lighter" | "calmer" | "same" | "heavy";

export interface Profile {
  name: string;
  goals: GoalId[];
  feeling?: FeelingId;
  sessionLength: SessionLength;
  ageRange: AgeRange;
  companionName: string;
  region: RegionId;
  onboardedAt?: number;
}

export interface Settings {
  theme: "system" | "light" | "dark";
  reducedMotion: boolean;
  largeText: boolean;
  showStreaks: boolean;
  /** Explicit consent to send companion messages to an AI provider. */
  aiConsent: boolean;
  reminderFrequency: "off" | "daily" | "weekly";
  /** Subtle vibration on key moments (phone app only). */
  haptics: boolean;
  /** Daily check-in notification (phone app only), "HH:MM" local time. */
  dailyNotify: boolean;
  dailyNotifyTime: string;
  /** Optional app lock. Only a salted SHA-256 of the PIN is stored. */
  lock: { salt: string; hash: string } | null;
}

export interface MoodEntry {
  id: string;
  at: number;
  mood: MoodId;
  tags: string[];
  note?: string;
}

export type JournalKind = "reflection" | "win" | "exercise" | "quest";

export interface JournalEntry {
  id: string;
  at: number;
  kind: JournalKind;
  title?: string;
  text: string;
  tags: string[];
  exerciseId?: ExerciseId | "touch-grass";
}

export interface UnsentMessage {
  id: string;
  createdAt: number;
  updatedAt: number;
  to: string;
  text: string;
}

export type ParkingBucket = "control" | "cannot" | "info";

export interface ParkedThought {
  id: string;
  at: number;
  text: string;
  bucket: ParkingBucket;
  nextStep?: string;
  resolved?: boolean;
}

export interface Reminder {
  id: string;
  text: string;
  dueAt: number;
  done: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  actions?: string[];
  crisis?: boolean;
}

export interface Completion {
  id: string;
  exerciseId: ExerciseId | "quest" | "touch-grass";
  at: number;
  xp: number;
  feeling?: AfterFeeling;
  realWorld: boolean;
}

export interface QuestState {
  day: string;
  questId: string;
  swaps: number;
  done: boolean;
}

export interface BingoState {
  day: string;
  cells: string[];
  marked: number[];
  lineRewarded: boolean;
}

export interface Reward {
  xp: number;
  capped: boolean;
  levelUp?: number;
  items: string[];
  achievements: string[];
}
