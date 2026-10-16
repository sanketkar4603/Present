import type { ExerciseId } from "./types";

export interface ChoiceOption {
  id: string;
  label: string;
  emoji?: string;
}

export type GuidedStep =
  | { type: "info"; title: string; body: string; emoji?: string }
  | {
      type: "text";
      key: string;
      title: string;
      body?: string;
      placeholder: string;
      hint?: string;
    }
  | {
      type: "choice";
      key: string;
      title: string;
      body?: string;
      options: ChoiceOption[];
      multi?: boolean;
      columns?: 2 | 3;
    }
  | { type: "timer"; title: string; body: string; seconds: number; emoji?: string }
  | { type: "checklist"; key: string; title: string; body?: string; items: ChoiceOption[] };

export interface GuidedExercise {
  id: ExerciseId;
  intro: string;
  /** Message shown on the final screen — always validating, never corrective. */
  outro: string;
  steps: GuidedStep[];
}

const BELIEF: ChoiceOption[] = [
  { id: "little", label: "A little", emoji: "🤏" },
  { id: "quite", label: "Quite a bit", emoji: "✋" },
  { id: "lot", label: "A lot", emoji: "🙌" },
  { id: "fully", label: "Completely", emoji: "💯" },
];

export const GUIDED: Partial<Record<ExerciseId, GuidedExercise>> = {
  detective: {
    id: "detective",
    intro: "We're not here to argue with your feelings — they make sense. We're just going to look at one thought, like a detective with a magnifying glass and a lot of patience.",
    outro: "Your feelings were valid the whole time. You just gave your brain more of the story.",
    steps: [
      {
        type: "text",
        key: "thought",
        title: "What exactly am I telling myself?",
        body: "Write the thought as it sounds in your head. No editing.",
        placeholder: "e.g. Everyone in the group chat thinks I'm annoying.",
      },
      {
        type: "choice",
        key: "before",
        title: "How strongly do you believe it right now?",
        options: BELIEF,
        columns: 2,
      },
      {
        type: "text",
        key: "for",
        title: "What evidence supports this thought?",
        body: "Facts, not vibes — but vibes are allowed to show up too.",
        placeholder: "e.g. Nobody replied to my message for an hour.",
      },
      {
        type: "text",
        key: "against",
        title: "What evidence might challenge it?",
        body: "Anything that doesn't quite fit the story?",
        placeholder: "e.g. Two people reacted to my meme yesterday. People get busy.",
      },
      {
        type: "text",
        key: "friend",
        title: "What would you tell a friend in this situation?",
        body: "Imagine your best friend said this thought to you.",
        placeholder: "e.g. They probably just haven't seen it yet. You're not annoying.",
      },
      {
        type: "text",
        key: "balanced",
        title: "What is a more balanced way to see this?",
        hint: "Not forced positivity. Just a slightly more complete picture.",
        placeholder: "e.g. I don't know what they think. A slow reply isn't a verdict on me.",
      },
      {
        type: "choice",
        key: "after",
        title: "And how strongly do you believe the original thought now?",
        body: "Any answer is fine. Thoughts don't always shift on cue.",
        options: BELIEF,
        columns: 2,
      },
    ],
  },

  emotion: {
    id: "emotion",
    intro: "Emotions are information, not instructions. Let's decode one together — no wrong answers, no judgement.",
    outro: "You made space for a feeling instead of pushing it away. That's a real skill.",
    steps: [
      {
        type: "choice",
        key: "emotion",
        title: "What are you feeling?",
        body: "Pick the closest one. It doesn't have to be perfect.",
        columns: 3,
        options: [
          { id: "anxious", label: "Anxious", emoji: "😬" },
          { id: "sad", label: "Sad", emoji: "😢" },
          { id: "angry", label: "Angry", emoji: "😤" },
          { id: "lonely", label: "Lonely", emoji: "🥺" },
          { id: "overwhelmed", label: "Overwhelmed", emoji: "🤯" },
          { id: "numb", label: "Numb", emoji: "😶" },
          { id: "jealous", label: "Jealous", emoji: "🫠" },
          { id: "embarrassed", label: "Embarrassed", emoji: "😳" },
          { id: "guilty", label: "Guilty", emoji: "😣" },
          { id: "frustrated", label: "Frustrated", emoji: "😩" },
          { id: "bored", label: "Bored", emoji: "🥱" },
          { id: "confused", label: "Confused", emoji: "😵‍💫" },
          { id: "hopeful", label: "Hopeful", emoji: "🌱" },
          { id: "excited", label: "Excited", emoji: "🤩" },
          { id: "grateful", label: "Grateful", emoji: "🥹" },
          { id: "content", label: "Content", emoji: "😌" },
        ],
      },
      {
        type: "text",
        key: "trigger",
        title: "What might have triggered it?",
        body: "A moment, a message, a thought, or nothing obvious at all.",
        placeholder: "e.g. Seeing everyone's holiday photos.",
        hint: "\"I'm not sure\" is a completely valid answer.",
      },
      {
        type: "choice",
        key: "where",
        title: "Where do you notice it?",
        body: "Pick as many as you like.",
        multi: true,
        columns: 3,
        options: [
          { id: "chest", label: "Chest", emoji: "🫁" },
          { id: "throat", label: "Throat", emoji: "🗣️" },
          { id: "stomach", label: "Stomach", emoji: "🌀" },
          { id: "shoulders", label: "Shoulders", emoji: "🤷" },
          { id: "head", label: "Head", emoji: "🧠" },
          { id: "jaw", label: "Jaw", emoji: "😬" },
          { id: "hands", label: "Hands", emoji: "✋" },
          { id: "everywhere", label: "Everywhere", emoji: "🌊" },
          { id: "unsure", label: "Not sure", emoji: "🤔" },
        ],
      },
      {
        type: "choice",
        key: "need",
        title: "What might you need right now?",
        multi: true,
        columns: 2,
        options: [
          { id: "rest", label: "Rest", emoji: "🛌" },
          { id: "comfort", label: "Comfort", emoji: "🧸" },
          { id: "connection", label: "Connection", emoji: "🤝" },
          { id: "space", label: "Space", emoji: "🌌" },
          { id: "movement", label: "Movement", emoji: "🏃" },
          { id: "heard", label: "To be heard", emoji: "👂" },
          { id: "fuel", label: "Food or water", emoji: "🥪" },
          { id: "fun", label: "Something fun", emoji: "🎈" },
        ],
      },
      {
        type: "text",
        key: "kind",
        title: "What's one kind action you can take for yourself?",
        body: "Small is perfect. Five minutes or less.",
        placeholder: "e.g. Make tea and sit by the window for a bit.",
      },
    ],
  },

  body: {
    id: "body",
    intro: "Eyes open or closed — totally your call. Skip anything that doesn't feel right. We're noticing, not judging.",
    outro: "You checked in with your body instead of just using it as transport for your brain. Nice.",
    steps: [
      {
        type: "choice",
        key: "energy",
        title: "How's your energy right now?",
        columns: 2,
        options: [
          { id: "empty", label: "Running on empty", emoji: "🪫" },
          { id: "low", label: "Low battery", emoji: "🔋" },
          { id: "steady", label: "Steady", emoji: "🙂" },
          { id: "charged", label: "Charged", emoji: "⚡" },
          { id: "buzzy", label: "Buzzy / wired", emoji: "🐝" },
        ],
      },
      {
        type: "timer",
        title: "Slow scan, top to bottom",
        body: "Start at your forehead. Then your jaw, your shoulders, your chest, your belly, your hands, your legs, your feet. Just notice. Nothing to fix.",
        seconds: 30,
        emoji: "🔦",
      },
      {
        type: "choice",
        key: "tension",
        title: "Where did you find tension?",
        body: "Pick any, or none.",
        multi: true,
        columns: 3,
        options: [
          { id: "forehead", label: "Forehead", emoji: "😣" },
          { id: "jaw", label: "Jaw", emoji: "😬" },
          { id: "neck", label: "Neck", emoji: "🦒" },
          { id: "shoulders", label: "Shoulders", emoji: "🤷" },
          { id: "back", label: "Back", emoji: "🪑" },
          { id: "stomach", label: "Stomach", emoji: "🌀" },
          { id: "hands", label: "Hands", emoji: "✊" },
          { id: "legs", label: "Legs", emoji: "🦵" },
          { id: "none", label: "Nowhere much", emoji: "☁️" },
        ],
      },
      {
        type: "timer",
        title: "Soften one thing",
        body: "Pick one spot you noticed. Breathe out slowly and let it loosen by 5%. That's all. Notice your posture too — is there a comfier way to sit or stand?",
        seconds: 20,
        emoji: "🫠",
      },
      {
        type: "choice",
        key: "after",
        title: "How does your body feel now?",
        columns: 2,
        options: [
          { id: "softer", label: "A bit softer", emoji: "🧈" },
          { id: "same", label: "About the same", emoji: "〰️" },
          { id: "aware", label: "More aware", emoji: "👁️" },
          { id: "tense", label: "Still tense", emoji: "🪨" },
        ],
      },
    ],
  },

  walk: {
    id: "walk",
    intro: "Today you're the main character. Same streets, but we're filming. Stay aware of traffic and your surroundings — safety first, cinematography second.",
    outro: "That's a wrap. You turned an ordinary walk into a scene worth remembering.",
    steps: [
      {
        type: "choice",
        key: "genre",
        title: "Pick your film genre",
        body: "This is your soundtrack for the walk (in your head or in your ears).",
        columns: 2,
        options: [
          { id: "indie", label: "Cozy indie film", emoji: "☕" },
          { id: "epic", label: "Epic adventure", emoji: "🏔️" },
          { id: "doc", label: "Nature documentary", emoji: "🦜" },
          { id: "romance", label: "Slow-mo romance", emoji: "🌸" },
          { id: "noir", label: "Detective noir", emoji: "🕵️" },
          { id: "coming", label: "Coming-of-age", emoji: "🚲" },
        ],
      },
      {
        type: "info",
        title: "Phone in pocket. Go.",
        body: "Walk for as long as you like — 5 to 15 minutes is great. Come back and tick off what you spotted. We'll wait right here.",
        emoji: "🎬",
      },
      {
        type: "checklist",
        key: "spotted",
        title: "What did the camera catch?",
        body: "Tick everything you noticed.",
        items: [
          { id: "colour", label: "A colour that popped", emoji: "🎨" },
          { id: "building", label: "Interesting architecture", emoji: "🏛️" },
          { id: "sound", label: "A sound you'd normally miss", emoji: "👂" },
          { id: "tiny", label: "A tiny detail (moss, a sticker, a crack)", emoji: "🔎" },
          { id: "animal", label: "An animal doing its thing", emoji: "🐕" },
          { id: "sky", label: "What the sky was up to", emoji: "🌤️" },
          { id: "person", label: "A stranger's small moment", emoji: "🚶" },
          { id: "smell", label: "A smell (good or chaotic)", emoji: "👃" },
        ],
      },
      {
        type: "text",
        key: "scene",
        title: "Describe one scene from your walk",
        body: "Like it's the opening shot of your film.",
        placeholder: "e.g. Late afternoon light hits a red door. A cat judges me from a fence.",
      },
    ],
  },

  courage: {
    id: "courage",
    intro: "Courage isn't about being fearless. It's about doing one small thing while slightly scared. Let's pick something tiny.",
    outro: "Brave bits add up. Whether you did it already or you're about to — that counts.",
    steps: [
      {
        type: "choice",
        key: "quest",
        title: "Pick your tiny courage quest",
        columns: 2,
        options: [
          { id: "question", label: "Ask a question in class or a meeting", emoji: "🙋" },
          { id: "message", label: "Message a friend you miss", emoji: "💌" },
          { id: "compliment", label: "Give a stranger a genuine compliment", emoji: "💐" },
          { id: "new", label: "Try a new café, food or route", emoji: "🧭" },
          { id: "outside", label: "Spend 10 minutes outside alone", emoji: "🌳" },
          { id: "opinion", label: "Share an opinion you'd usually keep in", emoji: "💭" },
          { id: "help", label: "Ask someone for help with something", emoji: "🤲" },
          { id: "no", label: "Say no to something you don't want", emoji: "🛑" },
        ],
      },
      {
        type: "choice",
        key: "when",
        title: "When will you do it?",
        body: "No pressure. You can always change your mind.",
        options: [
          { id: "now", label: "Right now", emoji: "⚡" },
          { id: "today", label: "Later today", emoji: "🌇" },
          { id: "week", label: "This week", emoji: "📅" },
          { id: "done", label: "Already did it!", emoji: "🏆" },
        ],
      },
      {
        type: "text",
        key: "step",
        title: "What's the very smallest first step?",
        body: "Like, embarrassingly small. Open the chat. Stand near the door.",
        placeholder: "e.g. Type 'hey, was just thinking about you' and hit send.",
      },
    ],
  },

  futureme: {
    id: "futureme",
    intro: "Future-you is a real person who will wake up tomorrow. Let's do them a small favour.",
    outro: "Future-you just got a gift. They might not say thanks, but they'll feel it.",
    steps: [
      {
        type: "choice",
        key: "action",
        title: "Pick one small action future-you will appreciate",
        columns: 2,
        options: [
          { id: "water", label: "Put a glass of water by the bed", emoji: "💧" },
          { id: "clothes", label: "Lay out tomorrow's clothes", emoji: "👕" },
          { id: "reply", label: "Reply to that one message", emoji: "💬" },
          { id: "tidy", label: "Do a 10-minute tidy", emoji: "🧹" },
          { id: "bed", label: "Go to bed 20 minutes earlier", emoji: "🛏️" },
          { id: "outside", label: "Step outside first thing tomorrow", emoji: "🌅" },
          { id: "snack", label: "Prep a snack or lunch", emoji: "🥪" },
          { id: "top1", label: "Write down tomorrow's top 1 task", emoji: "📝" },
        ],
      },
      {
        type: "text",
        key: "custom",
        title: "Want to make it more specific?",
        body: "Optional. Add a detail, or write your own action.",
        placeholder: "e.g. Reply to Sam about Saturday.",
      },
      {
        type: "choice",
        key: "reminder",
        title: "Want a gentle reminder?",
        body: "It'll show up in the app when it's time. No pushy notifications.",
        options: [
          { id: "none", label: "No reminder", emoji: "🙅" },
          { id: "hour", label: "In 1 hour", emoji: "⏱️" },
          { id: "evening", label: "This evening (8pm)", emoji: "🌆" },
          { id: "morning", label: "Tomorrow morning (9am)", emoji: "☀️" },
        ],
      },
    ],
  },

  winddown: {
    id: "winddown",
    intro: "Let's close the tabs in your head. Dim your screen if you can — we'll be quick and quiet.",
    outro: "Tabs closed. The rest can wait until tomorrow. Sleep well.",
    steps: [
      {
        type: "choice",
        key: "day",
        title: "How was today, in one word?",
        columns: 3,
        options: [
          { id: "heavy", label: "Heavy", emoji: "🪨" },
          { id: "busy", label: "Busy", emoji: "🌀" },
          { id: "meh", label: "Meh", emoji: "😐" },
          { id: "okay", label: "Okay", emoji: "🙂" },
          { id: "good", label: "Good", emoji: "😊" },
          { id: "weird", label: "Weird", emoji: "🦄" },
        ],
      },
      {
        type: "text",
        key: "letgo",
        title: "One thing you can put down for tonight",
        body: "It'll still be there tomorrow if you need it. You're just not carrying it to bed.",
        placeholder: "e.g. The assignment. Future-me has a plan.",
      },
      {
        type: "text",
        key: "good",
        title: "One small good thing from today",
        placeholder: "e.g. The barista remembered my order.",
        hint: "Tiny counts. A good sandwich counts.",
      },
      {
        type: "timer",
        title: "Four slow breaths",
        body: "Breathe in through your nose… and out even slower through your mouth. Let your shoulders drop on every exhale.",
        seconds: 30,
        emoji: "🌙",
      },
      {
        type: "info",
        title: "Phone face-down.",
        body: "Put it somewhere you can't reach from bed if you can. Goodnight — you did enough today.",
        emoji: "🛌",
      },
    ],
  },

  connection: {
    id: "connection",
    intro: "Group chats are great. But real conversation hits different. Let's plan one.",
    outro: "Connection is a muscle. You just flexed it.",
    steps: [
      {
        type: "choice",
        key: "who",
        title: "Who comes to mind?",
        columns: 2,
        options: [
          { id: "friend", label: "A friend", emoji: "🫶" },
          { id: "family", label: "Family", emoji: "🏠" },
          { id: "classmate", label: "A classmate or coworker", emoji: "📚" },
          { id: "old", label: "Someone I've lost touch with", emoji: "🕰️" },
          { id: "new", label: "Someone new", emoji: "👋" },
        ],
      },
      {
        type: "choice",
        key: "how",
        title: "How will you connect?",
        columns: 2,
        options: [
          { id: "person", label: "In person", emoji: "☕" },
          { id: "call", label: "A call", emoji: "📞" },
          { id: "voice", label: "A voice note", emoji: "🎙️" },
          { id: "text", label: "A thoughtful message", emoji: "💌" },
        ],
      },
      {
        type: "choice",
        key: "starter",
        title: "Pick a conversation starter (or use your own)",
        options: [
          { id: "highlight", label: "\"What's been the best part of your week?\"", emoji: "✨" },
          { id: "remind", label: "\"Saw something that reminded me of you…\"", emoji: "🔗" },
          { id: "excited", label: "\"What are you looking forward to lately?\"", emoji: "🎟️" },
          { id: "honest", label: "\"How are you actually doing?\"", emoji: "🫂" },
          { id: "plan", label: "\"Want to grab a coffee or go for a walk?\"", emoji: "🚶" },
        ],
      },
      {
        type: "text",
        key: "reflection",
        title: "Any thoughts before (or after) you reach out?",
        placeholder: "e.g. Nervous but it's been too long. Doing it after lunch.",
      },
    ],
  },
};
