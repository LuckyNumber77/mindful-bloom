import { useMemo, useRef, useState } from "react";

type Msg = { who: "you" | "ai"; text: string; ts: number };
const EMOJI: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  productive: "🚀",
  anxious: "😟",
  sad: "😢",
  neutral: "🙂",
};

// Super-light sentiment/engagement scoring
function analyze(text: string) {
  const t = text.toLowerCase();
  const pos = [
    "happy",
    "great",
    "good",
    "calm",
    "love",
    "excited",
    "progress",
    "grateful",
    "win",
  ];
  const neg = [
    "sad",
    "anxious",
    "worried",
    "angry",
    "tired",
    "stuck",
    "hate",
    "bad",
    "overwhelmed",
  ];
  let score = 0;
  pos.forEach((w) => {
    if (t.includes(w)) score += 1;
  });
  neg.forEach((w) => {
    if (t.includes(w)) score -= 1;
  });

  const engaged = Math.min(1, Math.max(0, t.split(/\s+/).length / 40)); // 0..1
  let mood: keyof typeof EMOJI = "neutral";
  if (score >= 2) mood = "happy";
  else if (score === 1) mood = "calm";
  else if (score <= -2) mood = "sad";
  else if (score === -1) mood = "anxious";

  return { mood, engaged };
}

export default function MoodChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const lastMood = useMemo(() => {
    const youLast = [...msgs].reverse().find((m) => m.who === "you");
    return youLast ? analyze(youLast.text).mood : "neutral";
  }, [msgs]);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setMsgs((m) => [...m, { who: "you", text: content, ts: Date.now() }]);
    setText("");

    // simple local AI echo + tip
    const { mood } = analyze(content);
    const tip =
      (
        {
          happy: "Love that! What contributed to that feeling today?",
          calm: "Nice. What helped you stay calm?",
          anxious:
            "Thanks for sharing. Want to try a 2-minute breathing exercise?",
          sad: "I'm here with you. What’s one small kindness you can give yourself?",
          neutral: "Got it. Anything you’d like to improve today?",
        } as any
      )[mood] || "Tell me more.";
    setTimeout(() => {
      setMsgs((m) => [...m, { who: "ai", text: tip, ts: Date.now() }]);
    }, 300);

    // log to backend so it appears in stats
    fetch("http://localhost:3000/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "local-user",
        event: "chat_message",
        properties: { inferredMood: mood, textPreview: content.slice(0, 120) },
        clientTs: new Date().toISOString(),
      }),
    }).catch(() => {});
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-4xl">{EMOJI[lastMood]}</div>
        <div className="leading-tight">
          <div className="font-semibold">Your companion</div>
          <div className="text-sm opacity-70">
            Avatar reflects your recent message mood
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-4 h-[50vh] overflow-y-auto bg-white">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${m.who === "you" ? "justify-end" : ""}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-[75%] ${
                m.who === "you" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="opacity-60 text-sm">Say anything to begin…</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 border rounded-xl px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Type a message"
        />
        <button
          className="px-4 py-2 rounded-xl bg-black text-white"
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
