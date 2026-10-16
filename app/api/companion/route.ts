import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { extractActions, localReply, systemPrompt } from "@/lib/companion";
import { CRISIS_REPLY, detectCrisis } from "@/lib/safety";

export const runtime = "nodejs";

const MODEL = process.env.COMPANION_MODEL || "claude-opus-5-5";
const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

// The Android app (Capacitor) loads from https://localhost; allow it to call a hosted copy of this API.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "https://localhost,capacitor://localhost")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: cors(req) });
}

interface IncomingMessage {
  role: "user" | "assistant";
  text: string;
}

interface Body {
  messages: IncomingMessage[];
  context?: { companionName?: string; minor?: boolean; goals?: string[]; mood?: string };
}

// Simple per-IP limiter. Good enough for a single instance; swap for a shared
// store (e.g. Redis / Supabase) when deploying multiple instances.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 12;
}

function parse(raw: unknown): Body | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) return null;
  const messages: IncomingMessage[] = [];
  for (const m of b.messages.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") return null;
    const { role, text } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") return null;
    const trimmed = text.slice(0, MAX_CHARS).trim();
    if (trimmed) messages.push({ role, text: trimmed });
  }
  // The API expects the conversation to start with a user turn and alternate.
  while (messages.length && messages[0].role !== "user") messages.shift();
  const merged: IncomingMessage[] = [];
  for (const m of messages) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === m.role) prev.text += `\n\n${m.text}`;
    else merged.push({ ...m });
  }
  if (!merged.length || merged[merged.length - 1].role !== "user") return null;
  const ctx = (b.context ?? {}) as Record<string, unknown>;
  return {
    messages: merged,
    context: {
      companionName: typeof ctx.companionName === "string" ? ctx.companionName.slice(0, 24) : "Nimbus",
      minor: ctx.minor === true,
      goals: Array.isArray(ctx.goals) ? ctx.goals.filter((g): g is string => typeof g === "string").slice(0, 7) : [],
      mood: typeof ctx.mood === "string" ? ctx.mood.slice(0, 20) : undefined,
    },
  };
}

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req) });
}

export async function GET(req: Request) {
  return json(req, { mode: process.env.ANTHROPIC_API_KEY ? "ai" : "local" });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return json(req, { error: "Easy there — give it a moment and try again." }, 429);
  }

  let body: Body | null = null;
  try {
    body = parse(await req.json());
  } catch {
    body = null;
  }
  if (!body) return json(req, { error: "Invalid request." }, 400);

  const last = body.messages[body.messages.length - 1].text;
  const userTurns = body.messages.filter((m) => m.role === "user").length;

  // Safety first: never route a possible crisis through the model alone.
  if (detectCrisis(last)) {
    return json(req, { reply: CRISIS_REPLY, actions: ["support"], crisis: true, source: "safety" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const { reply, actions } = localReply(last, userTurns);
    return json(req, { reply, actions, source: "local" });
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      // Short, warm chat replies — low effort keeps it quick and inexpensive.
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt({
        companionName: body.context?.companionName ?? "Nimbus",
        minor: Boolean(body.context?.minor),
        goals: body.context?.goals ?? [],
        mood: body.context?.mood,
      }),
      messages: body.messages.map((m) => ({ role: m.role, content: m.text })),
    });

    if (response.stop_reason === "refusal") {
      const { reply, actions } = localReply(last, userTurns);
      return json(req, { reply, actions, source: "local" });
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) {
      const { reply, actions } = localReply(last, userTurns);
      return json(req, { reply, actions, source: "local" });
    }
    const { reply, actions } = extractActions(text);
    return json(req, { reply, actions, source: "ai" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return json(req, { error: "The companion is a bit busy. Try again in a minute." }, 503);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Companion: invalid ANTHROPIC_API_KEY");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Companion API error ${error.status}: ${error.message}`);
    } else {
      console.error("Companion error", error);
    }
    // Degrade gracefully to the built-in responder so the user is never left hanging.
    const { reply, actions } = localReply(last, userTurns);
    return json(req, { reply, actions, source: "local" });
  }
}
