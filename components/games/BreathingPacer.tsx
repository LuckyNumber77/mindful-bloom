import { useEffect, useState } from "react";
import { track } from "../../lib/analytics";

type Props = { onReward: (pts: number) => void };

export default function BreathingPacer({ onReward }: Props) {
  // 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Do 3 cycles.
  const phases = [
    { name: "Inhale", secs: 4 },
    { name: "Hold", secs: 7 },
    { name: "Exhale", secs: 8 },
  ];
  const totalCycles = 3;

  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].secs);

  useEffect(() => {
    if (!running) return;
    if (cycle >= totalCycles) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // advance phase
        const nextIdx = (phaseIdx + 1) % phases.length;
        if (nextIdx === 0) {
          // next cycle
          const nextCycle = cycle + 1;
          setCycle(nextCycle);
          if (nextCycle >= totalCycles) {
            // finished!
            clearInterval(id);
            const pts = 25;
            onReward(pts);
            track({ type: "game.played", game: "breathing_pacer", score: pts });
            track({
              type: "reward.earned",
              reason: "breathing_pacer",
              points: pts,
            });
            setRunning(false);
            return phases[0].secs;
          }
        }
        setPhaseIdx(nextIdx);
        return phases[nextIdx].secs;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, cycle, phaseIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    setRunning(true);
    setCycle(0);
    setPhaseIdx(0);
    setSecondsLeft(phases[0].secs);
  }

  const phase = phases[phaseIdx];

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🫁 Breathing Pacer (4-7-8)</h3>
        {!running ? (
          <button
            className="px-3 py-1 rounded-xl bg-black text-white"
            onClick={start}
          >
            Start
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            Cycle {cycle + 1} / {totalCycles}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="text-xl font-semibold">{phase.name}</div>
        <div className="text-5xl font-bold tabular-nums">{secondsLeft}s</div>

        {/* Visual circle */}
        <div
          className="mt-4 w-40 h-40 rounded-full"
          style={{
            transition: "transform 1s ease",
            transform:
              phase.name === "Inhale"
                ? "scale(1.2)"
                : phase.name === "Exhale"
                ? "scale(0.8)"
                : "scale(1)",
            background:
              phase.name === "Inhale"
                ? "#cde"
                : phase.name === "Hold"
                ? "#def"
                : "#cfd",
          }}
        />
        {!running && (
          <p className="mt-3 text-sm text-gray-600 text-center">
            Follow the circle: Inhale 4s, Hold 7s, Exhale 8s. Complete 3 cycles
            to earn points.
          </p>
        )}
      </div>
    </div>
  );
}
