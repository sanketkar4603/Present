import type {
  AfterFeeling,
  ExerciseId,
  FeelingId,
  GoalId,
  MoodId,
  SessionLength,
} from "./types";

/* ------------------------------------------------------------------ */
/* Onboarding                                                          */
/* ------------------------------------------------------------------ */

export const GOALS: { id: GoalId; label: string; emoji: string }[] = [
  { id: "brain", label: "My brain never switches off.", emoji: "🌀" },
  { id: "scroll", label: "I scroll more than I want to.", emoji: "📱" },
  { id: "compare", label: "I compare myself to others.", emoji: "🪞" },
  { id: "disconnected", label: "I feel disconnected from real life.", emoji: "🔌" },
  { id: "emotions", label: "I struggle to understand my emotions.", emoji: "🫧" },
  { id: "enjoy", label: "I want to enjoy everyday moments more.", emoji: "🌻" },
  { id: "curious", label: "I'm just curious.", emoji: "👀" },
];

export const FEELINGS: { id: FeelingId; label: string; emoji: string }[] = [
  { id: "exhausted", label: "Mentally exhausted.", emoji: "🪫" },
  { id: "restless", label: "Restless.", emoji: "🐝" },
  { id: "overwhelmed", label: "Emotionally overwhelmed.", emoji: "🌊" },
  { id: "unmotivated", label: "Unmotivated.", emoji: "🛋️" },
  { id: "distracted", label: "Mostly okay, but distracted.", emoji: "🎈" },
  { id: "everything", label: "A little bit of everything.", emoji: "🎨" },
];

export const SESSION_LENGTHS: { value: SessionLength; label: string; hint: string }[] = [
  { value: 30, label: "30 seconds", hint: "Micro-resets between things" },
  { value: 120, label: "2 minutes", hint: "A quick breather" },
  { value: 300, label: "5 minutes", hint: "A proper pause" },
  { value: 600, label: "10 minutes", hint: "Room to go deeper" },
];

/* ------------------------------------------------------------------ */
/* Moods                                                               */
/* ------------------------------------------------------------------ */

export const MOODS: {
  id: MoodId;
  label: string;
  emoji: string;
  color: string;
  /** 0 = heavy, 6 = bright. Used only for gentle visual placement, never scoring. */
  spot: number;
  reply: string;
}[] = [
  { id: "stormy", label: "Stormy", emoji: "⛈️", color: "#8a7bd8", spot: 0, reply: "Stormy days are real. You don't have to fix it — let's just get you a little steadier." },
  { id: "low", label: "Low", emoji: "🌧️", color: "#9b8fe0", spot: 1, reply: "Thanks for being honest. Low is allowed. Small and gentle is the move today." },
  { id: "foggy", label: "Foggy", emoji: "🌫️", color: "#b2a8d6", spot: 2, reply: "Foggy brain, noted. Something sensory might help clear a little space." },
  { id: "restless", label: "Restless", emoji: "🌪️", color: "#ff9f8a", spot: 3, reply: "Lots of energy with nowhere to go? Let's give it somewhere to land." },
  { id: "okay", label: "Okay", emoji: "⛅", color: "#f5c66b", spot: 4, reply: "Okay is a perfectly good place to be. Want to make it a little more present?" },
  { id: "calm", label: "Calm", emoji: "🌤️", color: "#7fd8b3", spot: 5, reply: "Calm — love that for you. Maybe notice what's helping, so you can find it again." },
  { id: "bright", label: "Bright", emoji: "☀️", color: "#ffcf5c", spot: 6, reply: "Bright day! Go spend some of it out there. Real life looks good on you." },
];

export const MOOD_TAGS = [
  "school",
  "work",
  "friends",
  "family",
  "sleep",
  "body",
  "socials",
  "money",
  "love",
  "weather",
  "future",
  "nothing specific",
];

export const MOOD_RECOMMENDATIONS: Record<MoodId, ExerciseId[]> = {
  stormy: ["grounding", "breathing", "unsent"],
  low: ["emotion", "body", "connection"],
  foggy: ["grounding", "walk", "detox"],
  restless: ["breathing", "walk", "parking"],
  okay: ["bingo", "courage", "detox"],
  calm: ["walk", "colours", "futureme"],
  bright: ["courage", "colours", "connection"],
};

export const AFTER_FEELINGS: { id: AfterFeeling; label: string; emoji: string }[] = [
  { id: "lighter", label: "A bit lighter", emoji: "🎈" },
  { id: "calmer", label: "Calmer", emoji: "🌊" },
  { id: "same", label: "About the same", emoji: "〰️" },
  { id: "heavy", label: "Still heavy", emoji: "🪨" },
];

/* ------------------------------------------------------------------ */
/* Exercises                                                           */
/* ------------------------------------------------------------------ */

export type ExerciseCategory = "reset" | "mind" | "feel" | "real-world" | "wind-down";

export interface ExerciseMeta {
  id: ExerciseId;
  title: string;
  tagline: string;
  emoji: string;
  /** Rough length in seconds, used to match the user's preferred session length. */
  seconds: number;
  durationLabel: string;
  xp: number;
  category: ExerciseCategory;
  goals: GoalId[];
  realWorld: boolean;
  gradient: string;
  offline: string;
}

export const CATEGORIES: { id: ExerciseCategory | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "reset", label: "Quick resets" },
  { id: "mind", label: "Overthinking" },
  { id: "feel", label: "Feelings" },
  { id: "real-world", label: "Real world" },
  { id: "wind-down", label: "Wind down" },
];

export const EXERCISES: ExerciseMeta[] = [
  {
    id: "unstuck",
    title: "Unstuck Reset",
    tagline: "A different tiny reset every time you tap.",
    emoji: "🎲",
    seconds: 60,
    durationLabel: "30s – 2 min",
    xp: 20,
    category: "reset",
    goals: ["brain", "disconnected", "emotions"],
    realWorld: false,
    gradient: "from-coral-300 to-butter-300",
    offline: "Found one that worked? Try it next time your head gets loud — before you reach for your phone.",
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 Reality Reset",
    tagline: "Come back to the room you're actually in.",
    emoji: "🖐️",
    seconds: 120,
    durationLabel: "2 min",
    xp: 25,
    category: "reset",
    goals: ["brain", "disconnected", "emotions"],
    realWorld: false,
    gradient: "from-lavender-300 to-mint-300",
    offline: "Next time you're waiting in a line, try spotting 3 things you've never noticed.",
  },
  {
    id: "breathing",
    title: "The Breathing Bubble",
    tagline: "Follow the bubble. That's literally it.",
    emoji: "🫧",
    seconds: 60,
    durationLabel: "30s – 2 min",
    xp: 15,
    category: "reset",
    goals: ["brain", "emotions"],
    realWorld: false,
    gradient: "from-mint-300 to-lavender-300",
    offline: "Before your next message or meeting, take one slow breath out. Just one.",
  },
  {
    id: "parking",
    title: "Overthinking Parking Lot",
    tagline: "Park the thought. You can come back for it later.",
    emoji: "🅿️",
    seconds: 180,
    durationLabel: "3 min",
    xp: 20,
    category: "mind",
    goals: ["brain"],
    realWorld: false,
    gradient: "from-butter-300 to-coral-300",
    offline: "If the thought drives back in, tell it: 'You're parked. I'll check on you later.'",
  },
  {
    id: "detective",
    title: "Thought Detective",
    tagline: "Investigate a stressful thought — kindly.",
    emoji: "🔍",
    seconds: 300,
    durationLabel: "5 min",
    xp: 30,
    category: "mind",
    goals: ["brain", "compare", "emotions"],
    realWorld: false,
    gradient: "from-lavender-400 to-coral-300",
    offline: "Say your balanced thought out loud once today. Hearing it hits differently.",
  },
  {
    id: "detox",
    title: "Digital Detox Challenge",
    tagline: "Phone down. Life on. Start with two minutes.",
    emoji: "📵",
    seconds: 120,
    durationLabel: "2 – 20 min",
    xp: 30,
    category: "real-world",
    goals: ["scroll", "disconnected"],
    realWorld: true,
    gradient: "from-midnight-500 to-lavender-400",
    offline: "Leave your phone in another room for your next meal.",
  },
  {
    id: "body",
    title: "Body Check-In",
    tagline: "Notice what your body's been trying to say.",
    emoji: "🧘",
    seconds: 180,
    durationLabel: "3 min",
    xp: 20,
    category: "feel",
    goals: ["emotions", "disconnected"],
    realWorld: false,
    gradient: "from-coral-300 to-butter-300",
    offline: "Drop your shoulders. Unclench your jaw. Do it again in an hour.",
  },
  {
    id: "walk",
    title: "The Main Character Walk",
    tagline: "Turn an ordinary walk into a film scene.",
    emoji: "🎬",
    seconds: 600,
    durationLabel: "10 min",
    xp: 40,
    category: "real-world",
    goals: ["disconnected", "enjoy", "scroll"],
    realWorld: true,
    gradient: "from-coral-400 to-lavender-400",
    offline: "Take the long way somewhere today. Pick the street you never use.",
  },
  {
    id: "emotion",
    title: "Emotion Decoder",
    tagline: "Feelings are information, not instructions.",
    emoji: "🧩",
    seconds: 240,
    durationLabel: "4 min",
    xp: 25,
    category: "feel",
    goals: ["emotions"],
    realWorld: false,
    gradient: "from-lavender-300 to-coral-300",
    offline: "Try naming one feeling out loud to someone you trust today.",
  },
  {
    id: "unsent",
    title: "The Unsent Message",
    tagline: "Say the thing. Nobody else will ever see it.",
    emoji: "✉️",
    seconds: 300,
    durationLabel: "5 min",
    xp: 25,
    category: "feel",
    goals: ["emotions"],
    realWorld: false,
    gradient: "from-butter-300 to-lavender-300",
    offline: "Go somewhere with a view for a few minutes and let the words settle.",
  },
  {
    id: "courage",
    title: "Tiny Courage Quest",
    tagline: "One small brave thing. Like, really small.",
    emoji: "🦁",
    seconds: 120,
    durationLabel: "2 min + real life",
    xp: 35,
    category: "real-world",
    goals: ["compare", "disconnected", "enjoy"],
    realWorld: true,
    gradient: "from-butter-300 to-coral-400",
    offline: "Do the courage quest you picked. Tiny counts. Tiny is the whole point.",
  },
  {
    id: "bingo",
    title: "Reality Bingo",
    tagline: "A daily card of tiny real-life moments.",
    emoji: "🎯",
    seconds: 30,
    durationLabel: "All day",
    xp: 20,
    category: "real-world",
    goals: ["enjoy", "scroll", "disconnected", "curious"],
    realWorld: true,
    gradient: "from-mint-300 to-butter-300",
    offline: "Pick one bingo square and go do it right now.",
  },
  {
    id: "colours",
    title: "Colour Hunt",
    tagline: "Get a colour. Find it hiding everywhere.",
    emoji: "🎨",
    seconds: 180,
    durationLabel: "3 min",
    xp: 25,
    category: "real-world",
    goals: ["enjoy", "disconnected", "curious", "scroll"],
    realWorld: true,
    gradient: "from-coral-300 to-mint-300",
    offline: "Keep your colour for the rest of the day. Notice how often it turns up.",
  },
  {
    id: "futureme",
    title: "The Future-Me Check",
    tagline: "One small thing future-you will thank you for.",
    emoji: "🔮",
    seconds: 60,
    durationLabel: "1 min",
    xp: 15,
    category: "mind",
    goals: ["brain", "enjoy"],
    realWorld: true,
    gradient: "from-lavender-400 to-mint-300",
    offline: "Do your future-me action before you open any app next time.",
  },
  {
    id: "winddown",
    title: "Sleep Wind-Down",
    tagline: "Close the tabs in your head before bed.",
    emoji: "🌙",
    seconds: 240,
    durationLabel: "4 min",
    xp: 20,
    category: "wind-down",
    goals: ["brain", "scroll"],
    realWorld: false,
    gradient: "from-midnight-500 to-lavender-500",
    offline: "Phone face-down, across the room. Goodnight, main character.",
  },
  {
    id: "connection",
    title: "Connection Challenge",
    tagline: "One real conversation. Screens optional.",
    emoji: "💬",
    seconds: 120,
    durationLabel: "2 min + real life",
    xp: 35,
    category: "real-world",
    goals: ["disconnected", "compare", "enjoy"],
    realWorld: true,
    gradient: "from-mint-300 to-coral-300",
    offline: "Send the message you planned. Or better — call.",
  },
];

export const EXERCISE_MAP: Record<ExerciseId, ExerciseMeta> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
) as Record<ExerciseId, ExerciseMeta>;

export function isExerciseId(id: string): id is ExerciseId {
  return id in EXERCISE_MAP;
}

/* ------------------------------------------------------------------ */
/* Reality quests                                                      */
/* ------------------------------------------------------------------ */

export interface Quest {
  id: string;
  title: string;
  detail: string;
  emoji: string;
}

export const QUESTS: Quest[] = [
  { id: "walk-nophone", title: "Take a walk without checking your phone", detail: "Even around the block. Pocket stays zipped.", emoji: "🚶" },
  { id: "five-new", title: "Notice five things you've never paid attention to", detail: "In a place you see every day. Ceilings count.", emoji: "👀" },
  { id: "song", title: "Listen to your favourite song without multitasking", detail: "Eyes closed or staring out a window. Nothing else.", emoji: "🎧" },
  { id: "convo", title: "Have a conversation without looking at your screen", detail: "Phone face-down. Notice how it feels.", emoji: "🗣️" },
  { id: "observe", title: "Spend two minutes observing the world around you", detail: "Pretend you're a nature documentary narrator.", emoji: "🔭" },
  { id: "weather", title: "Step outside and notice the weather", detail: "Temperature, wind, light. Actually feel it.", emoji: "🌦️" },
  { id: "meal", title: "Eat one meal with zero screens", detail: "Taste it like you're a food critic.", emoji: "🍜" },
  { id: "sky", title: "Look at the sky for one full minute", detail: "Clouds, colours, birds, planes. Just watch.", emoji: "☁️" },
  { id: "compliment", title: "Give someone a genuine compliment", detail: "Out loud, in person if you can.", emoji: "💐" },
  { id: "barefoot", title: "Stand barefoot on the ground", detail: "Grass, sand, floorboards. Feel the texture.", emoji: "🦶" },
  { id: "tea", title: "Make a drink slowly and mindfully", detail: "Watch the steam. Hear the pour.", emoji: "🍵" },
  { id: "photo-none", title: "See something beautiful and don't photograph it", detail: "Keep it just for you.", emoji: "🌅" },
  { id: "new-route", title: "Take a different route somewhere", detail: "Same destination, new street.", emoji: "🗺️" },
  { id: "stretch", title: "Stretch for two minutes like a cat", detail: "No technique required. Just stretch what wants stretching.", emoji: "🐈" },
  { id: "tidy", title: "Tidy one tiny corner", detail: "One shelf. One drawer. Notice the difference.", emoji: "🧺" },
  { id: "handwrite", title: "Write something by hand", detail: "A list, a note, a doodle. Pen on paper.", emoji: "✍️" },
  { id: "sounds", title: "Count the different sounds around you", detail: "Close your eyes. How many can you find?", emoji: "👂" },
  { id: "plant", title: "Spend a moment with a plant or tree", detail: "Look at one leaf closely. Wild, right?", emoji: "🌿" },
  { id: "call", title: "Call someone instead of texting", detail: "Even a two-minute call counts.", emoji: "📞" },
  { id: "window", title: "Open a window and breathe fresh air", detail: "Three slow breaths. What can you smell?", emoji: "🪟" },
  { id: "sunlight", title: "Get some daylight on your face", detail: "Five minutes outside, ideally before noon.", emoji: "🌞" },
  { id: "cook", title: "Cook or prep something simple", detail: "Toast counts. Notice colours and smells.", emoji: "🍳" },
];

/* ------------------------------------------------------------------ */
/* Reality Bingo                                                       */
/* ------------------------------------------------------------------ */

export const BINGO_POOL: { id: string; label: string; emoji: string }[] = [
  { id: "beauty", label: "Notice a beautiful detail", emoji: "✨" },
  { id: "someone-new", label: "Talk to someone new", emoji: "👋" },
  { id: "water", label: "Drink water without multitasking", emoji: "💧" },
  { id: "breaths", label: "Take three conscious breaths", emoji: "🌬️" },
  { id: "undocumented", label: "Do something without documenting it", emoji: "🙈" },
  { id: "unshared", label: "Enjoy a moment without sharing it online", emoji: "🤫" },
  { id: "sky", label: "Look up at the sky", emoji: "☁️" },
  { id: "laugh", label: "Laugh out loud", emoji: "😂" },
  { id: "outside", label: "Spend 5 minutes outside", emoji: "🌳" },
  { id: "thank", label: "Thank someone properly", emoji: "🙏" },
  { id: "stretch", label: "Stretch for a minute", emoji: "🙆" },
  { id: "new-thing", label: "Try something new (tiny is fine)", emoji: "🆕" },
  { id: "music", label: "Listen to a song with full attention", emoji: "🎶" },
  { id: "animal", label: "Notice an animal", emoji: "🐦" },
  { id: "snack", label: "Eat a snack slowly", emoji: "🍎" },
  { id: "tidy", label: "Tidy one small thing", emoji: "🧹" },
  { id: "hand", label: "Write something by hand", emoji: "✏️" },
  { id: "texture", label: "Touch an interesting texture", emoji: "🧶" },
  { id: "eye", label: "Make eye contact and smile", emoji: "🙂" },
  { id: "phone-away", label: "Leave your phone in another room for 15 min", emoji: "📵" },
];

/* ------------------------------------------------------------------ */
/* Touch Grass mode                                                    */
/* ------------------------------------------------------------------ */

export const TOUCH_GRASS: { id: string; title: string; detail: string; emoji: string; minutes: number }[] = [
  { id: "grass", title: "Literally touch grass", detail: "Find some. Touch it. Notice if it's dry, damp, soft, scratchy.", emoji: "🌱", minutes: 2 },
  { id: "cloud", title: "Cloud spotting", detail: "Lie down or lean back. Find three shapes in the clouds.", emoji: "☁️", minutes: 5 },
  { id: "colour", title: "Colour hunt", detail: "Pick a colour. Find seven things that colour on a short walk.", emoji: "🎨", minutes: 10 },
  { id: "bench", title: "Bench time", detail: "Sit on a bench. Watch the world do its thing.", emoji: "🪑", minutes: 5 },
  { id: "tree", title: "Tree friend", detail: "Find a tree. Look at the bark up close. Say hi (optional).", emoji: "🌳", minutes: 3 },
  { id: "birds", title: "Bird listening", detail: "Stand still. Count how many different bird calls you can hear.", emoji: "🐦", minutes: 3 },
  { id: "sunset", title: "Catch the light", detail: "Go outside at golden hour and watch the light change.", emoji: "🌇", minutes: 10 },
  { id: "loop", title: "The no-destination loop", detail: "Walk for ten minutes with nowhere to be. Turn wherever looks interesting.", emoji: "🔁", minutes: 10 },
  { id: "rain", title: "Weather check", detail: "Step out. Feel the temperature on your skin. Rain? Even better.", emoji: "🌦️", minutes: 2 },
  { id: "picnic", title: "Snack outside", detail: "Take whatever you're eating and eat it outdoors.", emoji: "🧺", minutes: 10 },
  { id: "stars", title: "Star check", detail: "If it's dark, look for the brightest star or the moon.", emoji: "🌟", minutes: 3 },
  { id: "pebble", title: "Pocket treasure", detail: "Find a cool leaf, pebble or shell. Keep it as a reminder.", emoji: "🪨", minutes: 5 },
];

/* ------------------------------------------------------------------ */
/* Weekly adventures                                                   */
/* ------------------------------------------------------------------ */

export const WEEKLY_ADVENTURES: {
  id: string;
  title: string;
  blurb: string;
  emoji: string;
  exercises: ExerciseId[];
}[] = [
  { id: "small-sounds", title: "The Week of Small Sounds", blurb: "Tune in to what you normally tune out.", emoji: "🐚", exercises: ["grounding", "walk", "breathing"] },
  { id: "colour-hunt", title: "Colour Hunt Week", blurb: "The world is way more colourful than your feed.", emoji: "🎨", exercises: ["colours", "walk", "bingo"] },
  { id: "soft-landing", title: "Soft Landing Week", blurb: "Be a little gentler with your brain.", emoji: "🪶", exercises: ["body", "emotion", "winddown"] },
  { id: "brave-bits", title: "Brave Bits Week", blurb: "Tiny courage, compounding.", emoji: "🦁", exercises: ["courage", "connection", "detective"] },
  { id: "quiet-mind", title: "Quiet Mind Week", blurb: "Less noise upstairs.", emoji: "🌙", exercises: ["parking", "breathing", "winddown"] },
  { id: "offline-explorer", title: "Offline Explorer Week", blurb: "Collect moments, not screenshots.", emoji: "🧭", exercises: ["detox", "walk", "connection"] },
];

/* ------------------------------------------------------------------ */
/* Offline nudges & microcopy                                          */
/* ------------------------------------------------------------------ */

export const OFFLINE_ACTIONS = [
  "Go refill your water and drink it somewhere with a window.",
  "Stand up, stretch, and look at something far away for 20 seconds.",
  "Text a friend something specific you appreciate about them.",
  "Step outside and check what the sky is doing.",
  "Put on one song and do absolutely nothing else.",
  "Make your bed or tidy one surface — tiny wins count.",
  "Eat your next snack without a screen. Taste it properly.",
  "Take the stairs, the long way, or the scenic route today.",
];

export const COMPANION_LINES = [
  "I noticed the light changed today. Did you?",
  "No pressure to do anything. I'm just happy you're here.",
  "Fun fact: clouds weigh about as much as 100 elephants. I'm lighter, I promise.",
  "Your brain's been working hard. It deserves a snack and a window.",
  "Real life called. It said 'no rush, but I'm cute today'.",
  "Breaks aren't failures. They're just… breaks.",
  "I collected a pebble while you were away. It's a very good pebble.",
];

export const REFLECTION_PROMPTS = [
  "What made you smile today, even a little?",
  "What's taking up the most space in your head right now?",
  "What's something you noticed today that you usually wouldn't?",
  "What do you need more of this week?",
  "What's one thing you handled better than you think?",
  "Who made today a bit better?",
  "If today were a film scene, what would it be called?",
];

export const JOURNAL_TAGS = [
  "school",
  "work",
  "friends",
  "family",
  "body",
  "sleep",
  "socials",
  "love",
  "self",
  "future",
  "gratitude",
];

export const TIME_GREETINGS = {
  morning: ["Morning", "Hey, early bird", "Good morning"],
  afternoon: ["Hey there", "Good afternoon", "Afternoon"],
  evening: ["Good evening", "Hey, evening you", "Evening"],
  night: ["Still up?", "Hey, night owl", "Late one?"],
};
