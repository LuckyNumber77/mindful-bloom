import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "../../lib/analytics";

type Props = {
  onPoints: (pts: number) => void;
};

export default function ReactionTap({ onPoints }: Props) {
  const DURATION = 15_000; // 15s
  const [running, setRunning] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const remaining = useMemo(() => {
    if (!endsAt) return 0;
    return Math.max(0, endsAt - Date.now());
  }, [endsAt, running, hits, misses, pos]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      // random position inside the game box (10% padding)
      setPos({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
      });
    }, 900);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || !endsAt) return;
    const t = setTimeout(() => finish(), endsAt - Date.now());
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, endsAt]);

  function start() {
    setHits(0);
    setMisses(0);
    setEndsAt(Date.now() + DURATION);
    setRunning(true);
  }

  function finish() {
    setRunning(false);
    const points = hits * 10 - misses * 2; // simple scoring
    const awarded = Math.max(0, points);
    onPoints(awarded);
    track({ type: "game.played", game: "reaction_tap", score: awarded });
    if (awarded > 0)
      track({ type: "reward.earned", reason: "reaction_tap", points: awarded });
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">🎯 Reaction Tap</h3>
        <div className="text-sm text-gray-500">
          {running ? `${Math.ceil(remaining / 1000)}s` : "15s game"}
        </div>
      </div>

      <div
        className="mt-3 h-48 relative rounded-xl border bg-gray-50 overflow-hidden"
        onClick={() => running && setMisses((m) => m + 1)}
      >
        {running && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHits((h) => h + 1);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/90 text-white"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            aria-label="Tap Target"
            title="Tap!"
          >
            Tap
          </button>
        )}
        {!running && (
          <div className="w-full h-full flex items-center justify-center">
            <button
              onClick={start}
              className="px-4 py-2 rounded-xl bg-black text-white"
            >
              Start
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <span>
          Hits: <b>{hits}</b>
        </span>
        <span>
          Misses: <b>{misses}</b>
        </span>
      </div>
    </div>
  );
}
