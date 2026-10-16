import { localReply } from "./companion";

/**
 * Where companion messages go:
 * - web build: this app's own `/api/companion` route
 * - mobile build: on-device replies, unless NEXT_PUBLIC_COMPANION_API_URL points
 *   at a deployed copy of the web app's API (e.g. https://your-app.vercel.app/api/companion)
 */
const REMOTE = process.env.NEXT_PUBLIC_COMPANION_API_URL || "";
const ENDPOINT = REMOTE || (process.env.NEXT_PUBLIC_MOBILE ? "" : "/api/companion");

/** ai = model via server · local = built-in responder on the server · device = built-in responder on this device */
export type CompanionMode = "ai" | "local" | "device";

export interface CompanionRequest {
  messages: { role: "user" | "assistant"; text: string }[];
  context: { companionName: string; minor: boolean; goals: string[]; mood?: string };
}

export interface CompanionReply {
  reply: string;
  actions?: string[];
  crisis?: boolean;
}

export async function getCompanionMode(): Promise<CompanionMode> {
  if (!ENDPOINT) return "device";
  try {
    const res = await fetch(ENDPOINT);
    const data = (await res.json()) as { mode?: string };
    return data.mode === "ai" ? "ai" : "local";
  } catch {
    return REMOTE ? "device" : "local";
  }
}

function onDevice(req: CompanionRequest): Promise<CompanionReply> {
  const last = [...req.messages].reverse().find((m) => m.role === "user")?.text ?? "";
  const turns = req.messages.filter((m) => m.role === "user").length;
  // A short pause so replies don't feel robotic.
  return new Promise((resolve) => setTimeout(() => resolve(localReply(last, turns)), 450 + Math.random() * 500));
}

export async function askCompanion(req: CompanionRequest): Promise<CompanionReply> {
  if (!ENDPOINT) return onDevice(req);
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch (e) {
    // Offline on a phone? Keep the conversation going on-device.
    if (REMOTE) return onDevice(req);
    throw e;
  }
  const data = (await res.json()) as CompanionReply & { error?: string };
  if (!res.ok || !data.reply) throw new Error(data.error || "Something went wrong.");
  return data;
}
