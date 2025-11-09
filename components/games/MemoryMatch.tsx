import { useEffect, useState } from "react";
import { track } from "../../lib/analytics";

const EMOJI = ["🙂", "😊", "😌", "😟", "😢", "🚀"]; // 6 pairs = 12 cards

type Card = { id: number; face: string; flipped: boolean; matched: boolean };
type Props = { onReward: (pts: number) => void };

export default function MemoryMatch({ onReward }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [first, setFirst] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(shuffle, []);

  function shuffle() {
    const faces = [...EMOJI, ...EMOJI];
    for (let i = faces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [faces[i], faces[j]] = [faces[j], faces[i]];
    }
    setCards(
      faces.map((f, i) => ({ id: i, face: f, flipped: false, matched: false }))
    );
    setFirst(null);
    setBusy(false);
    setMoves(0);
  }

  function flip(idx: number) {
    if (busy) return;
    setCards((prev) => {
      const c = [...prev];
      if (c[idx].flipped || c[idx].matched) return c;
      c[idx] = { ...c[idx], flipped: true };
      return c;
    });

    if (first === null) {
      setFirst(idx);
    } else {
      setBusy(true);
      setMoves((m) => m + 1);
      setTimeout(() => {
        setCards((prev) => {
          const a = prev[first];
          const b = prev[idx];
          const match = a.face === b.face;
          const next = prev.map((card, i) => {
            if (i === first || i === idx) {
              if (match) return { ...card, matched: true };
              return { ...card, flipped: false };
            }
            return card;
          });
          const allMatched = next.every((c) => c.matched);
          if (allMatched) {
            const pts = Math.max(10, 40 - moves * 2);
            onReward(pts);
            track({ type: "game.played", game: "memory_match", score: pts });
            track({
              type: "reward.earned",
              reason: "memory_match",
              points: pts,
            });
          }
          return next;
        });
        setFirst(null);
        setBusy(false);
      }, 600);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">🧠 Memory Match</h3>
        <button className="px-3 py-1 rounded-xl border" onClick={shuffle}>
          Shuffle
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => flip(i)}
            className={`h-16 rounded-xl flex items-center justify-center text-2xl ${
              c.matched ? "bg-green-100" : "bg-gray-100"
            }`}
            aria-label={c.flipped || c.matched ? c.face : "card"}
          >
            {c.flipped || c.matched ? c.face : "❓"}
          </button>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-600">Moves: {moves}</div>
    </div>
  );
}
