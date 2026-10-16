import type { RegionId } from "./types";

/**
 * Conservative keyword screen for messages that may indicate immediate danger or
 * self-harm. It is deliberately broad: a false positive shows support options,
 * a false negative could leave someone without them. It is not a diagnosis.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill(ing)?\s+(my ?self|me)\b/i,
  /\bunalive\b/i,
  /\b(hurt|harm|cut|cutting|burn)(ing)?\s+(my ?self)\b/i,
  /\bself[\s-]?harm/i,
  /\b(want|wanna|going)\s+to\s+die\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\b(end|ending)\s+(it\s+all|my\s+life|everything)\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+alive|live|exist|wake\s+up)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living|being\s+alive)\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\boverdos/i,
  /\bnot\s+safe\s+(at\s+home|with)\b/i,
  /\b(i'?m|i\s+am)\s+not\s+safe\b/i,
  /\b(he|she|they|someone)\s+(is\s+)?(hurting|hitting|abusing)\s+me\b/i,
];

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(text));
}

export interface SupportLine {
  name: string;
  detail: string;
  phone?: string;
  sms?: string;
  url?: string;
  youth?: boolean;
}

export interface RegionResources {
  label: string;
  emergency: string;
  lines: SupportLine[];
}

export const REGIONS: Record<RegionId, RegionResources> = {
  AU: {
    label: "Australia",
    emergency: "000",
    lines: [
      { name: "Lifeline", detail: "24/7 crisis support. Call 13 11 14 or text 0477 13 11 14.", phone: "131114", sms: "0477131114", url: "https://www.lifeline.org.au" },
      { name: "Kids Helpline", detail: "Free, 24/7, for young people aged 5–25. 1800 55 1800.", phone: "1800551800", url: "https://kidshelpline.com.au", youth: true },
      { name: "Beyond Blue", detail: "Support with anxiety and depression. 1300 22 4636.", phone: "1300224636", url: "https://www.beyondblue.org.au" },
      { name: "13YARN", detail: "For Aboriginal & Torres Strait Islander people. 13 92 76.", phone: "139276", url: "https://www.13yarn.org.au" },
    ],
  },
  NZ: {
    label: "Aotearoa New Zealand",
    emergency: "111",
    lines: [
      { name: "Need to talk?", detail: "Call or text 1737, any time.", phone: "1737", sms: "1737", url: "https://1737.org.nz" },
      { name: "Lifeline Aotearoa", detail: "0800 543 354, 24/7.", phone: "0800543354", url: "https://www.lifeline.org.nz" },
      { name: "Youthline", detail: "0800 376 633 or text 234.", phone: "0800376633", sms: "234", url: "https://www.youthline.co.nz", youth: true },
    ],
  },
  US: {
    label: "United States",
    emergency: "911",
    lines: [
      { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988, 24/7.", phone: "988", sms: "988", url: "https://988lifeline.org" },
      { name: "Crisis Text Line", detail: "Text HOME to 741741.", sms: "741741", url: "https://www.crisistextline.org" },
      { name: "The Trevor Project", detail: "For LGBTQ+ young people. 1-866-488-7386.", phone: "18664887386", url: "https://www.thetrevorproject.org", youth: true },
    ],
  },
  UK: {
    label: "United Kingdom",
    emergency: "999",
    lines: [
      { name: "Samaritans", detail: "Call 116 123, free, 24/7.", phone: "116123", url: "https://www.samaritans.org" },
      { name: "Shout", detail: "Text SHOUT to 85258.", sms: "85258", url: "https://giveusashout.org" },
      { name: "Childline", detail: "For under-19s. 0800 1111.", phone: "08001111", url: "https://www.childline.org.uk", youth: true },
    ],
  },
  CA: {
    label: "Canada",
    emergency: "911",
    lines: [
      { name: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8, 24/7.", phone: "988", sms: "988", url: "https://988.ca" },
      { name: "Kids Help Phone", detail: "1-800-668-6868 or text CONNECT to 686868.", phone: "18006686868", sms: "686868", url: "https://kidshelpphone.ca", youth: true },
    ],
  },
  IE: {
    label: "Ireland",
    emergency: "112 or 999",
    lines: [
      { name: "Samaritans Ireland", detail: "Call 116 123, free, 24/7.", phone: "116123", url: "https://www.samaritans.org/ireland" },
      { name: "Text 50808", detail: "Free 24/7 text support.", sms: "50808", url: "https://text50808.ie" },
    ],
  },
  IN: {
    label: "India",
    emergency: "112",
    lines: [
      { name: "Tele-MANAS", detail: "Free 24/7 mental health support. Call 14416.", phone: "14416", url: "https://telemanas.mohfw.gov.in" },
    ],
  },
  OTHER: {
    label: "Somewhere else",
    emergency: "your local emergency number",
    lines: [
      { name: "Find A Helpline", detail: "Free, confidential helplines in 130+ countries.", url: "https://findahelpline.com" },
    ],
  },
};

export function guessRegion(): RegionId {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("Australia/")) return "AU";
    if (tz === "Pacific/Auckland" || tz === "Pacific/Chatham") return "NZ";
    if (tz === "Europe/London") return "UK";
    if (tz === "Europe/Dublin") return "IE";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
    if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal|Moncton)/.test(tz)) return "CA";
    if (tz.startsWith("America/") || tz.startsWith("US/")) return "US";
  } catch {
    /* fall through */
  }
  return "OTHER";
}

export const CRISIS_REPLY =
  "I'm really glad you told me. What you're going through sounds serious, and you deserve support from a real person right now — not just an app. If you're in immediate danger, please contact emergency services. You can also reach a crisis line below; they're free, confidential, and there for exactly this.";
