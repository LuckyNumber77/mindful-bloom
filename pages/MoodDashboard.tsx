import { useEffect, useMemo, useState } from "react";
import ReactionTap from "../components/games/ReactionTap";
import BreathingPacer from "../components/games/BreathingPacer";
import MemoryMatch from "../components/games/MemoryMatch";
import { moodToScore, scoreToHex } from "../lib/moodMath";

type Row = { DAY: string; MOOD: string; CNT: number };

export default function MoodDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<number>(0);

  // pull mood stats
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/stats/moods?days=${days}`)
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [days]);

  // pull points total from backend
  const refreshPoints = () => {
    fetch(`http://localhost:3000/api/stats/points`)
      .then((r) => r.json())
      .then((d) => setPoints(Number(d?.points || 0)))
      .catch(() => {});
  };
  useEffect(refreshPoints, []);

  // games report rewards → refresh points
  const onReward = (_pts: number) => {
    // server already logged reward.earned; refresh total a moment later
    setTimeout(refreshPoints, 300);
  };

  const byDay = useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    rows.forEach((r) => {
      const day = r.DAY.slice(0, 10);
      m.set(day, {
        ...(m.get(day) || {}),
        [r.MOOD]: (m.get(day)?.[r.MOOD] || 0) + r.CNT,
      });
    });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.MOOD) t[r.MOOD] = (t[r.MOOD] || 0) + r.CNT;
    });
    const grand = Object.values(t).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(t)
      .map(([mood, count]) => ({
        mood,
        count,
        pct: Math.round((count / grand) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  const moodLight = useMemo(() => {
    let total = 0,
      weight = 0;
    rows.forEach((r) => {
      total += moodToScore(r.MOOD) * r.CNT;
      weight += r.CNT;
    });
    const avg = weight ? total / weight : 0.5;
    return { avg, color: scoreToHex(avg) };
  }, [rows]);

  const hasData = rows.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Mood overview, rewards, and mini-games.
          </p>
        </div>
        <select
          className="border rounded px-2 py-1"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* Mood Light + Points */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl shadow p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">🟢 Mood Light</h3>
            <div className="text-sm text-gray-500">
              Avg {Math.round(moodLight.avg * 100)}%
            </div>
          </div>
          <div
            className="h-20 rounded-2xl shadow-inner"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${moodLight.color} 0%, ${moodLight.color}66 45%, transparent 70%)`,
            }}
          />
          {!hasData && !loading && (
            <p className="mt-3 text-sm text-gray-500">
              Log a check-in or chat to light this up.
            </p>
          )}
        </div>

        <div className="rounded-2xl shadow p-5 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">🏆 Total Reward Points</h3>
            <div className="text-2xl font-bold">{points}</div>
          </div>
          <p className="text-sm text-gray-500">
            Points come from check-ins, completed tasks, and games.
          </p>
        </div>
      </div>

      {/* Totals */}
      {hasData && (
        <div className="grid sm:grid-cols-3 gap-3">
          {totals.map(({ mood, count, pct }) => (
            <div key={mood} className="rounded-2xl shadow p-4 bg-white">
              <div className="text-sm opacity-70 capitalize">{mood}</div>
              <div className="text-3xl font-bold">{count}</div>
              <div className="text-xs text-gray-500">{pct}% of total</div>
            </div>
          ))}
        </div>
      )}

      {/* Mini-games */}
      <BreathingPacer onReward={onReward} />
      <ReactionTap onPoints={onReward} />
      <MemoryMatch onReward={onReward} />

      {/* Daily table */}
      {hasData && (
        <div className="rounded-2xl shadow overflow-auto bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Day</th>
                <th className="text-left p-3">Counts (per mood)</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map(([day, counts]) => (
                <tr key={day} className="border-t">
                  <td className="p-3 font-medium">{day}</td>
                  <td className="p-3">
                    {Object.entries(counts).map(([m, c]) => (
                      <span
                        key={m}
                        className="inline-block mr-3 mb-1 px-2 py-1 rounded bg-gray-100 capitalize"
                      >
                        {m}: {c}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
