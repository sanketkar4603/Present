/**
 * The "I'm stuck in my head" pool: tiny, varied resets (30–90s) so the button
 * feels fresh every time. Recent picks are remembered on-device to avoid repeats.
 */

export type UnstuckKind = "senses" | "body" | "breath" | "game" | "thought";

export interface UnstuckActivity {
  id: string;
  emoji: string;
  title: string;
  kind: UnstuckKind;
  steps: string[];
  /** Optional countdown. Without one, the user taps Done when ready. */
  seconds?: number;
  why: string;
  /** Doable unnoticed on a bus, in class or at a desk. */
  discreet: boolean;
  /** Opens a full exercise instead of running inline. */
  href?: string;
}

export const KIND_LABEL: Record<UnstuckKind, { label: string; emoji: string }> = {
  senses: { label: "Senses", emoji: "👀" },
  body: { label: "Body", emoji: "💪" },
  breath: { label: "Breath", emoji: "🌬️" },
  game: { label: "Brain game", emoji: "🧩" },
  thought: { label: "Thought trick", emoji: "💭" },
};

export const UNSTUCK: UnstuckActivity[] = [
  {
    id: "five-four",
    emoji: "🖐️",
    title: "The classic 5-4-3-2-1",
    kind: "senses",
    steps: ["5 things you can see.", "4 you can feel, 3 you can hear.", "2 you can smell, 1 you can taste."],
    why: "Walking through every sense drags your attention out of your head and into the room.",
    discreet: true,
    href: "/exercise/grounding",
  },
  {
    id: "cold",
    emoji: "🧊",
    title: "Cold reset",
    kind: "body",
    steps: [
      "Run cold water over your wrists, or hold something cold — a can, an ice cube, a cold spoon.",
      "Keep it there and just notice the temperature.",
      "Breathe out slowly while you do it.",
    ],
    seconds: 30,
    why: "Cold is a loud signal. It pulls your attention out of your thoughts and into your skin.",
    discreet: false,
  },
  {
    id: "box",
    emoji: "🟦",
    title: "Box breathing",
    kind: "breath",
    steps: ["Breathe in for 4.", "Hold for 4.", "Breathe out for 4.", "Hold for 4. Keep going until the timer ends."],
    seconds: 64,
    why: "A steady, boring rhythm gives racing thoughts something to follow.",
    discreet: true,
  },
  {
    id: "shapes",
    emoji: "🔺",
    title: "Shape spotter",
    kind: "senses",
    steps: ["Find 3 circles around you.", "Then 3 rectangles.", "Then 1 triangle — the boss level."],
    seconds: 45,
    why: "Hunting for something specific switches your brain from replaying to scanning.",
    discreet: true,
  },
  {
    id: "shake",
    emoji: "🫨",
    title: "Shake it out",
    kind: "body",
    steps: [
      "Stand up if you can.",
      "Shake your hands, then your arms, then your shoulders — like flicking off water.",
      "Add a leg. Look ridiculous. That's the point.",
    ],
    seconds: 30,
    why: "Animals literally shake off stress. Moving burns off the jittery energy.",
    discreet: false,
  },
  {
    id: "feet",
    emoji: "🦶",
    title: "Feet on the floor",
    kind: "body",
    steps: [
      "Press both feet firmly into the floor.",
      "Notice your heels, the balls of your feet, your toes. Which part presses hardest?",
      "Wiggle your toes. You're here.",
    ],
    seconds: 30,
    why: "Your feet are the furthest point from your head. Literally.",
    discreet: true,
  },
  {
    id: "alphabet",
    emoji: "🔤",
    title: "A–Z animals",
    kind: "game",
    steps: [
      "Name an animal for each letter. A is for… axolotl?",
      "Get as far as you can before the timer ends.",
      "Stuck on a letter? Skip it. Nobody's checking.",
    ],
    seconds: 60,
    why: "It's hard to fully overthink and play a word game at the same time.",
    discreet: true,
  },
  {
    id: "sevens",
    emoji: "🔢",
    title: "Count down by 7s",
    kind: "game",
    steps: ["Start at 100.", "Take away 7 each time: 93, 86, 79…", "Lost count? Start again from 100. That counts too."],
    seconds: 45,
    why: "A bit of maths uses the same brain space that worry likes to hog.",
    discreet: true,
  },
  {
    id: "alien",
    emoji: "👽",
    title: "Alien report",
    kind: "senses",
    steps: [
      "Pick the nearest object.",
      "Describe it like an alien who's never seen one: colour, shape, weight, what it might be for.",
      "Be as weird and specific as you like.",
    ],
    seconds: 60,
    why: "Describing without judging pulls you into what's actually here.",
    discreet: true,
  },
  {
    id: "sounds",
    emoji: "🎧",
    title: "Sound safari",
    kind: "senses",
    steps: ["Close your eyes, or lower your gaze.", "Count every different sound — near and far.", "Try to find the quietest one."],
    seconds: 45,
    why: "Listening outward gives your inner voice less airtime.",
    discreet: true,
  },
  {
    id: "textures",
    emoji: "🧶",
    title: "Texture tour",
    kind: "senses",
    steps: [
      "Find 3 different textures nearby — something soft, rough and smooth.",
      "Touch each one slowly for a few seconds.",
      "Which one feels nicest? That's your pocket texture for next time.",
    ],
    why: "Touch is one of the fastest ways back into the present moment.",
    discreet: true,
  },
  {
    id: "hum",
    emoji: "🎵",
    title: "Hum it out",
    kind: "breath",
    steps: [
      "Pick any song — the more dramatic the better.",
      "Hum it slowly. Feel the buzz in your chest and face.",
      "Long, low hums work best.",
    ],
    seconds: 30,
    why: "Humming stretches your out-breath, which tells your body it's okay to calm down.",
    discreet: false,
  },
  {
    id: "reach",
    emoji: "🙆",
    title: "Reach and fold",
    kind: "body",
    steps: ["Reach both arms up to the ceiling. Stretch tall.", "Slowly fold forward and let your arms hang.", "Roll back up. Do it 3 times."],
    seconds: 45,
    why: "Stretching releases the tension that builds up when we're stuck in thought.",
    discreet: false,
  },
  {
    id: "far",
    emoji: "🪟",
    title: "Far-away look",
    kind: "senses",
    steps: [
      "Find the furthest thing you can see — out a window, or down a hallway.",
      "Let your eyes rest on it with a soft focus.",
      "Notice one detail you've never noticed before.",
    ],
    seconds: 45,
    why: "Looking into the distance relaxes eyes that have been locked on screens.",
    discreet: true,
  },
  {
    id: "hand-trace",
    emoji: "✋",
    title: "Hand-trace breathing",
    kind: "breath",
    steps: [
      "Hold up one hand. Trace around it with a finger from your other hand.",
      "Breathe in as you trace up a finger, out as you trace down.",
      "Do all five fingers, then switch hands.",
    ],
    seconds: 60,
    why: "Touch, sight and breath working together leave little room for spiralling.",
    discreet: true,
  },
  {
    id: "leaves",
    emoji: "🍃",
    title: "Thoughts on leaves",
    kind: "thought",
    steps: [
      "Picture a slow stream with leaves floating past.",
      "Each time a thought shows up, place it on a leaf and watch it drift away.",
      "No pushing. Let the stream do the work.",
    ],
    seconds: 60,
    why: "You're practising watching your thoughts instead of being dragged along by them.",
    discreet: true,
  },
  {
    id: "having",
    emoji: "💭",
    title: "“I'm having the thought…”",
    kind: "thought",
    steps: [
      "Notice the loudest thought in your head right now.",
      "Say to yourself: “I'm having the thought that…” and finish it.",
      "Then: “I notice I'm having the thought that…” Feel the tiny bit of distance?",
    ],
    why: "A thought is something your brain made, not a fact about the world.",
    discreet: true,
  },
  {
    id: "sips",
    emoji: "💧",
    title: "Three slow sips",
    kind: "senses",
    steps: [
      "Grab a drink — water is perfect.",
      "Take three slow sips. Notice the temperature and taste of each.",
      "Feel it go down. That's you, right here, in your body.",
    ],
    why: "Slowing down one tiny everyday action is mindfulness without the incense.",
    discreet: true,
  },
  {
    id: "butterfly",
    emoji: "🦋",
    title: "Butterfly hug",
    kind: "body",
    steps: [
      "Cross your arms over your chest, hands resting near your shoulders.",
      "Tap gently: left, right, left, right — slow, like a heartbeat.",
      "Breathe slowly while you tap.",
    ],
    seconds: 45,
    why: "Slow left–right tapping is a simple self-soothing technique many therapists teach.",
    discreet: false,
  },
  {
    id: "rainbow",
    emoji: "🌈",
    title: "Rainbow scan",
    kind: "senses",
    steps: ["Find something red, then orange, then yellow.", "Then green, blue and purple.", "Go in order. Purple is surprisingly hard."],
    seconds: 60,
    why: "A colour mission turns your eyes into a gentle distraction engine.",
    discreet: true,
  },
  {
    id: "wall",
    emoji: "🧱",
    title: "Wall push",
    kind: "body",
    steps: [
      "Put both hands flat on a wall.",
      "Push hard for 10 seconds, like you're trying to move it.",
      "Let go and notice your arms. Do it 3 times.",
    ],
    seconds: 40,
    why: "Hard effort followed by release burns off restless, stuck energy.",
    discreet: false,
  },
  {
    id: "squeeze",
    emoji: "✊",
    title: "Squeeze and drop",
    kind: "body",
    steps: [
      "Make tight fists and scrunch your shoulders up to your ears.",
      "Hold for 5 seconds… then drop everything.",
      "Repeat 3 times. Notice the difference between tense and loose.",
    ],
    seconds: 30,
    why: "Tensing on purpose makes it easier for your body to really let go.",
    discreet: true,
  },
  {
    id: "unclench",
    emoji: "😮‍💨",
    title: "The unclench",
    kind: "body",
    steps: [
      "Unclench your jaw. Let your tongue drop from the roof of your mouth.",
      "Drop your shoulders away from your ears.",
      "Soften your forehead and breathe out slowly.",
    ],
    seconds: 30,
    why: "Overthinking hides in your jaw and shoulders. Letting go there helps your mind follow.",
    discreet: true,
  },
];

const RECENT_KEY = "present-unstuck-recent";
const SUBTLE_KEY = "present-unstuck-subtle";
const REMEMBER = 10;

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function remember(id: string) {
  try {
    const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, REMEMBER);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — repeats are fine */
  }
}

/**
 * Pick a fresh activity: skip anything seen recently (or this session), and
 * prefer a different kind from the last one so it actually feels different.
 */
export function pickUnstuck(opts: { subtle: boolean; exclude?: string[]; lastKind?: UnstuckKind }): UnstuckActivity {
  const pool = UNSTUCK.filter((a) => !opts.subtle || a.discreet);
  const recent = new Set([...readRecent(), ...(opts.exclude ?? [])]);
  const tiers = [
    pool.filter((a) => !recent.has(a.id) && a.kind !== opts.lastKind),
    pool.filter((a) => !recent.has(a.id)),
    pool.filter((a) => !(opts.exclude ?? []).includes(a.id)),
    pool,
  ];
  const choices = tiers.find((t) => t.length > 0)!;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  remember(pick.id);
  return pick;
}

export function getSubtle(): boolean {
  try {
    return localStorage.getItem(SUBTLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSubtle(on: boolean) {
  try {
    localStorage.setItem(SUBTLE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Called by "delete all my data". */
export function clearUnstuck() {
  try {
    localStorage.removeItem(RECENT_KEY);
    localStorage.removeItem(SUBTLE_KEY);
  } catch {
    /* ignore */
  }
}
