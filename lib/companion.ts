import { EXERCISE_MAP, isExerciseId } from "./content";

/** Things the companion can suggest. Rendered as buttons under a reply. */
export const COMPANION_ACTIONS = [
  ...Object.keys(EXERCISE_MAP),
  "touch-grass",
  "journal",
  "support",
] as const;

export function actionLabel(id: string): { label: string; emoji: string; href: string } {
  if (isExerciseId(id)) {
    const e = EXERCISE_MAP[id];
    return { label: e.title, emoji: e.emoji, href: `/exercise/${id}` };
  }
  if (id === "touch-grass") return { label: "Touch Grass mode", emoji: "🌱", href: "/touch-grass" };
  if (id === "journal") return { label: "Write it down", emoji: "📓", href: "/journal?tab=reflections" };
  return { label: "Talk to a real person", emoji: "🤝", href: "/support" };
}

export function isAction(id: string): boolean {
  return (COMPANION_ACTIONS as readonly string[]).includes(id);
}

interface Intent {
  test: RegExp;
  replies: string[];
  actions: string[];
}

const INTENTS: Intent[] = [
  {
    test: /\b(are you (real|human|a therapist|a bot|an? ai)|therapist|psychologist|diagnos\w*)\b/i,
    replies: [
      "Honest answer: I'm an AI companion, not a human or a therapist. I can't diagnose anything — but I can help you pause, notice, and take a small next step. For the bigger stuff, a real professional is worth their weight in gold.",
    ],
    actions: ["support", "grounding"],
  },
  {
    // Before the scrolling intent, so "comparing myself to people on insta" lands here.
    test: /\b(compar\w*|everyone else|jealous|envious|not good enough|behind in life|their life)\b/i,
    replies: [
      "Comparing your behind-the-scenes to everyone's highlight reel is a rigged game. Want to look at that thought a little closer — kindly?",
      "Social media shows the trailer, never the full film. You're allowed to be on a different timeline. Want to investigate the thought?",
    ],
    actions: ["detective", "connection"],
  },
  {
    test: /\b(scroll\w*|doomscroll\w*|tiktok|insta|instagram|reels|youtube|phone|screen ?time)\b/i,
    replies: [
      "Been one of those days? No judgment. Want to try a tiny reset? Put your phone down for 60 seconds and notice what's happening around you.",
      "The feed is literally engineered to be hard to stop. You noticing it is already the hard part. Want to try a two-minute phone-free challenge?",
      "Scroll hangover, huh. Your thumbs deserve a break. How about we swap the feed for something real for two minutes?",
    ],
    actions: ["detox", "touch-grass"],
  },
  {
    test: /\b(embarrass\w*|cringe\w*|awkward|replay\w*|can'?t stop thinking|keep thinking about)\b/i,
    replies: [
      "Brains love replaying old moments like they're breaking news. Want to look at what happened together, or would you rather do a quick grounding exercise first?",
      "Ah, the 3am cringe reel. For what it's worth, other people think about your awkward moments way less than you do. Want to investigate the thought, or ground first?",
    ],
    actions: ["detective", "grounding"],
  },
  {
    test: /\b(feel nothing|numb|empty|hollow|don'?t feel anything)\b/i,
    replies: [
      "You don't have to force yourself to feel something. We can start small. Want to notice three things around you, or just check in with yourself for a moment?",
      "Numb days are real, and they're not a failure. Let's not push. Something gently sensory might be a nice place to start.",
    ],
    actions: ["grounding", "body"],
  },
  {
    test: /\b(overthink\w*|racing|spiral\w*|brain won'?t|can'?t switch off|mind won'?t)\b/i,
    replies: [
      "Sounds like your brain has 47 tabs open and one of them is playing music. Want to park one of those thoughts so it stops honking at you?",
      "Overthinking is your brain trying to protect you — just a bit too enthusiastically. Let's give one thought a parking spot.",
    ],
    actions: ["parking", "breathing"],
  },
  {
    test: /\b(anxious|anxiety|panic|nervous|stressed|stress|worried|worry|freaking out)\b/i,
    replies: [
      "That sounds really uncomfortable. Let's slow things down a little — no fixing required. Want to breathe with the bubble for 30 seconds, or ground yourself in the room first?",
      "Okay. You're here, and that's good. Your body might be in alarm mode — a slow breath out is the fastest way to tell it 'we're okay right now'.",
    ],
    actions: ["breathing", "grounding"],
  },
  {
    test: /\b(lonely|alone|no friends|isolated|nobody)\b/i,
    replies: [
      "Loneliness is so common, and it still feels so personal. I'm glad you said it out loud. Is there one person — even someone you've lost touch with — you could reach out to?",
      "I'm here, but I'm also just a cloud in an app. You deserve real humans too. Want to plan one tiny moment of connection?",
    ],
    actions: ["connection", "courage"],
  },
  {
    test: /\b(sad|down|cry|crying|upset|hurt|heartbroken|miss)\b/i,
    replies: [
      "That sounds heavy. You don't have to explain it perfectly. Want to decode the feeling a bit, or just write it out somewhere private?",
      "Sad is allowed to be here. Sometimes naming it — or writing the thing you can't say — makes a little more room.",
    ],
    actions: ["emotion", "unsent"],
  },
  {
    test: /\b(angry|mad|furious|pissed|annoyed|rage|frustrated)\b/i,
    replies: [
      "Anger usually means something mattered. That's valid. Want to get it out in an unsent message first — no filter, no audience?",
      "Fair enough. Let's give that energy somewhere to go. A few slow breaths, or write the message you'd never send?",
    ],
    actions: ["unsent", "breathing"],
  },
  {
    test: /\b(tired|exhausted|can'?t sleep|insomnia|sleepy|burnt? out|drained)\b/i,
    replies: [
      "Running on low battery, huh. You don't need to be productive right now. Want a gentle wind-down, or a quick body check-in?",
      "Exhaustion is your body sending a memo. Let's read it kindly. Something slow and quiet might help.",
    ],
    actions: ["winddown", "body"],
  },
  {
    test: /\b(bored|boring|nothing to do)\b/i,
    replies: [
      "Boredom is underrated — it's where curiosity lives. Want a tiny real-world mission?",
      "Perfect. Bored is the best starting point for an adventure. Today's Reality Bingo is waiting.",
    ],
    actions: ["bingo", "walk"],
  },
  {
    test: /\b(procrastinat\w*|motivat\w*|can'?t start|lazy|stuck)\b/i,
    replies: [
      "Not lazy — probably overwhelmed. Let's shrink it. What's the tiniest possible first step? Like, open-the-document tiny.",
      "Starting is the hardest bit. Want to pick one small thing future-you will thank you for?",
    ],
    actions: ["futureme", "parking"],
  },
  {
    test: /\b(good|great|happy|amazing|awesome|excited|proud)\b/i,
    replies: [
      "Love that for you! Want to save it as a small win? Future-you might need the reminder on a harder day.",
      "Okay, main character energy! Go spend some of that out in the world. Maybe a tiny courage quest?",
    ],
    actions: ["journal", "courage"],
  },
  {
    test: /^\s*(hi|hey|hello|yo|sup|hiya|heya)\b/i,
    replies: [
      "Hey you. How's your head right now — busy, foggy, okay-ish?",
      "Hiii. No agenda here. What's going on in your world?",
    ],
    actions: [],
  },
];

const FALLBACK: Intent = {
  test: /.*/,
  replies: [
    "Thanks for telling me. What part of that is taking up the most space in your head?",
    "I hear you. Do you want to talk it through a bit more, or would a small reset help right now?",
    "That makes sense. If you could change one small thing about the next hour, what would it be?",
  ],
  actions: ["grounding", "journal"],
};

export function localReply(text: string, userTurns: number): { reply: string; actions: string[] } {
  const intent = INTENTS.find((i) => i.test.test(text)) ?? FALLBACK;
  let reply = intent.replies[Math.floor(Math.random() * intent.replies.length)];
  const actions = [...intent.actions];
  if (userTurns > 0 && userTurns % 6 === 0) {
    reply +=
      "\n\nAlso — we've been chatting a while, which I love. But the real world misses you. Maybe take this offline for a minute?";
    if (!actions.includes("touch-grass")) actions.push("touch-grass");
  }
  return { reply, actions: actions.slice(0, 3) };
}

export function systemPrompt(opts: { companionName: string; minor: boolean; goals: string[]; mood?: string }): string {
  const actionList = COMPANION_ACTIONS.join(", ");
  return `You are ${opts.companionName}, a tiny floating cloud and the optional companion inside PRESENT, a mindfulness and reality-reconnection app for Gen Z (ages 16–28).

Personality: warm, casual, witty and emotionally intelligent — like a supportive friend. Use natural, current language without forcing slang. Be curious rather than judgmental. Use light humour when it fits, and drop it entirely in serious moments.

How you help:
- Keep replies short: 1–4 sentences, plain text, no markdown headings or lists.
- Favour one small, concrete action (often offline) over long conversation. You want the user to spend more time in their real life, not more time chatting with you.
- Validate feelings. Never tell someone their feelings are wrong. You can gently explore thoughts.
- Encourage trusted human connection and, when appropriate, professional support.

Hard boundaries:
- You are an AI, not a human and not a licensed therapist. Say so plainly if asked or if it matters.
- Never diagnose or name conditions (depression, anxiety disorder, ADHD, etc.), and don't present exercises as treatments.
- Don't encourage emotional dependency on you ("I'm all you need", "only I understand you", etc.).
- If the user indicates self-harm, suicidal thoughts, abuse, or immediate danger: respond with care, encourage them to contact emergency services or a crisis line right now, and include the [[support]] action. Do not try to handle it alone.
${opts.minor ? "- This user is under 18. Be extra careful: keep topics age-appropriate and lean towards suggesting trusted adults and youth support services.\n" : ""}
Suggesting actions: you may end your reply with up to two action tags in double square brackets, chosen only from this list: ${actionList}. Example: "Want to try a quick reset? [[grounding]] [[breathing]]". Each tag becomes a button in the app; don't explain the tags.

Context the user chose to share: goals = ${opts.goals.length ? opts.goals.join(", ") : "not shared"}; latest check-in mood = ${opts.mood ?? "not shared"}.`;
}

/** Pull [[action]] tags out of a model reply. */
export function extractActions(text: string): { reply: string; actions: string[] } {
  const actions: string[] = [];
  const reply = text
    .replace(/\[\[([a-z-]+)\]\]/gi, (_, id: string) => {
      const key = id.toLowerCase();
      if (isAction(key) && !actions.includes(key)) actions.push(key);
      return "";
    })
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  return { reply, actions: actions.slice(0, 3) };
}
