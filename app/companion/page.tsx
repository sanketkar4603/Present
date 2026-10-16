"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Trash2 } from "lucide-react";
import Mascot from "@/components/Mascot";
import SupportResources from "@/components/SupportResources";
import { Button, Card, Modal } from "@/components/ui";
import { actionLabel } from "@/lib/companion";
import { askCompanion, getCompanionMode, type CompanionMode } from "@/lib/companion-client";
import { companionStage, levelFor } from "@/lib/gamification";
import { CRISIS_REPLY, detectCrisis } from "@/lib/safety";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const STARTERS = [
  "I've been scrolling for three hours.",
  "I can't stop thinking about something embarrassing I did.",
  "I feel nothing today.",
  "Give me something to do offline.",
];

export default function Companion() {
  const profile = useApp((s) => s.profile);
  const consent = useApp((s) => s.settings.aiConsent);
  const updateSettings = useApp((s) => s.updateSettings);
  const chat = useApp((s) => s.chat);
  const addChat = useApp((s) => s.addChat);
  const clearChat = useApp((s) => s.clearChat);
  const moods = useApp((s) => s.moods);
  const xp = useApp((s) => s.xp);

  const [mode, setMode] = useState<CompanionMode | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const minor = profile.ageRange === "16-17";
  const name = profile.companionName;

  useEffect(() => {
    getCompanionMode().then(setMode);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setError(null);
    addChat({ role: "user", text: msg });

    // Possible crisis: respond on-device with human support options, and don't send it anywhere.
    if (detectCrisis(msg)) {
      addChat({ role: "assistant", text: CRISIS_REPLY, actions: ["support"], crisis: true });
      return;
    }
    await request();
  };

  const request = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = useApp
        .getState()
        .chat.filter((m) => !m.crisis)
        .slice(-16)
        .map((m) => ({ role: m.role, text: m.text }));
      const data = await askCompanion({
        messages: history,
        context: { companionName: name, minor, goals: profile.goals, mood: moods[0]?.mood },
      });
      addChat({ role: "assistant", text: data.reply, actions: data.actions, crisis: data.crisis });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reach the companion.");
    } finally {
      setLoading(false);
    }
  };

  if (!consent) {
    return (
      <div className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Mascot size={140} mood="curious" stage={companionStage(levelFor(xp))} />
          <h1 className="mt-4 font-display text-3xl font-extrabold">Chat with {name}</h1>
          <p className="mt-2 max-w-sm text-muted">
            An optional companion for when you want to talk something through — and then go do something real.
          </p>
        </div>
        <Card className="mt-6 space-y-3 text-[15px]">
          <p>
            <span className="font-semibold">🤖 {name} is an AI, not a human or a therapist.</span> It can&apos;t diagnose anything, and it&apos;s not a replacement for professional care.
          </p>
          <p>
            <span className="font-semibold">🔒 Your privacy.</span>{" "}
            {mode === "ai"
              ? "To reply, your messages are sent to an AI provider through our secure server. They're not used for ads or to train models. Your chat history is stored only on this device."
              : mode === "device"
                ? "Replies are generated right here on your phone — nothing you type is sent anywhere."
                : "Right now replies come from a built-in responder on our server — no third-party AI. Chat history is stored only on this device."}
          </p>
          <p>
            <span className="font-semibold">🆘 In a crisis?</span> {name} will point you to real people who can help.{" "}
            <Link href="/support" className="font-semibold text-lavender-600 underline dark:text-lavender-300">
              See support now
            </Link>
          </p>
          {minor && (
            <p className="rounded-2xl bg-butter-200/60 p-3 text-sm dark:bg-butter-400/10">
              Because you&apos;re under 18, chat is off by default. If you turn it on, {name} will be extra careful and will often suggest talking to a trusted adult too.
            </p>
          )}
        </Card>
        <Button block size="lg" className="mt-6" onClick={() => updateSettings({ aiConsent: true })}>
          I understand — turn on chat
        </Button>
        <p className="mt-3 text-center text-sm text-muted">You can switch this off any time in Settings.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col pt-4">
      <header className="flex items-center gap-3">
        <Mascot size={56} mood={loading ? "curious" : "happy"} stage={companionStage(levelFor(xp))} float={false} />
        <div className="flex-1">
          <h1 className="font-display text-xl font-extrabold">{name}</h1>
          <p className="text-xs text-muted">AI companion · not a therapist{mode === "local" || mode === "device" ? " · offline mode" : ""}</p>
        </div>
        <Link
          href="/exercise/unstuck"
          aria-label="I'm stuck in my head. Start a quick reset."
          className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 px-3.5 text-sm font-bold text-white"
        >
          <span aria-hidden>🫧</span> Reset
        </Link>
        {chat.length > 0 && (
          <button onClick={() => setConfirmClear(true)} aria-label="Clear conversation" className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink">
            <Trash2 size={18} />
          </button>
        )}
      </header>

      <div className="mt-4 flex-1 space-y-3" aria-live="polite">
        {chat.length === 0 && (
          <div className="rounded-4xl border border-dashed border-line p-5 text-center">
            <p className="font-display text-lg font-bold">Hey{profile.name ? ` ${profile.name}` : ""}. What&apos;s on your mind?</p>
            <p className="mt-1 text-sm text-muted">Big thing, small thing, no thing. Try one of these:</p>
            <div className="mt-4 flex flex-col gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm font-semibold transition hover:bg-lavender-100 dark:hover:bg-midnight-500">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%]", m.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "whitespace-pre-wrap rounded-3xl px-4 py-3 text-[15px] leading-relaxed animate-rise",
                  m.role === "user"
                    ? "rounded-br-md bg-lavender-600 text-white dark:bg-lavender-400 dark:text-midnight-900"
                    : "rounded-bl-md border border-line bg-surface",
                  m.crisis && "border-coral-300",
                )}
              >
                {m.text}
              </div>
              {m.crisis && (
                <div className="mt-2 rounded-3xl border border-line bg-surface p-3">
                  <SupportResources compact />
                </div>
              )}
              {!m.crisis && m.actions && m.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.actions.map((a) => {
                    const { label, emoji, href } = actionLabel(a);
                    return (
                      <Link key={a} href={href} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm font-semibold transition hover:border-lavender-400">
                        <span aria-hidden>{emoji}</span> {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start" aria-label={`${name} is typing`}>
            <div className="flex gap-1 rounded-3xl rounded-bl-md border border-line bg-surface px-4 py-4">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-lavender-400" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-3xl bg-coral-200/50 p-3 text-sm dark:bg-coral-600/15" role="alert">
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="soft" onClick={request}>
              <RotateCcw size={14} aria-hidden /> Retry
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        style={{ bottom: "calc(6.75rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))" }}
        className="sticky mt-4 flex items-end gap-2 rounded-3xl border border-line glass p-2 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message {name}
        </label>
        <textarea
          id="chat-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder={`Talk to ${name}…`}
          maxLength={2000}
          className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] placeholder:text-muted/70 focus:outline-none"
        />
        <Button type="submit" size="md" disabled={!input.trim() || loading} aria-label="Send" className="h-11 w-11 shrink-0 px-0">
          <Send size={18} />
        </Button>
      </form>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear conversation">
        <h2 className="font-display text-xl font-bold">Clear this conversation?</h2>
        <p className="mt-1 text-muted">It&apos;s only stored on this device, so it&apos;ll be gone for good.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="soft" onClick={() => setConfirmClear(false)}>
            Keep
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearChat();
              setConfirmClear(false);
            }}
          >
            Clear
          </Button>
        </div>
      </Modal>
    </div>
  );
}
