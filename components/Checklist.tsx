import React, { useState, useEffect } from "react";
import type { DailyTasks, Task } from "../types";
import { DEFAULT_TASKS } from "../constants";
// ✅ NEW: analytics
import { track } from "../lib/analytics";

type Props = {
  todayTasks: DailyTasks;
  onTaskChange: (updatedTasks: Task[]) => void;
};

/* Celebration modal */
const RewardAnimation: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 text-center shadow-xl animate-[jump-in_0.5s_ease-out_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-800">Great Job!</h3>
        <p className="text-gray-600 mt-2">
          You’ve completed all your tasks for today.
        </p>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
      <style>{`
        @keyframes jump-in {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default function Checklist({ todayTasks, onTaskChange }: Props) {
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showReward, setShowReward] = useState(false);

  const tasks = todayTasks.tasks;

  // ✅ Use the date coming from today's task record (fallback to now)
  const todayStr = todayTasks?.date ?? new Date().toISOString().split("T")[0];

  // ---- Once-per-day celebration guard ----
  const CELEBRATE_KEY = `celebrated-${todayStr}`;

  // Re-check completion whenever the tasks array changes
  useEffect(() => {
    const allCompleted = tasks.length > 0 && tasks.every((t) => t.completed);
    const alreadyCelebrated = localStorage.getItem(CELEBRATE_KEY) === "true";
    if (allCompleted && !alreadyCelebrated) {
      setShowReward(true);
      localStorage.setItem(CELEBRATE_KEY, "true");
      // ✅ analytics for first completion of the day
      track({ type: "reward.completed_day", date: todayStr });
    }
  }, [tasks, CELEBRATE_KEY, todayStr]);

  const toggle = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    onTaskChange(updated);

    // ✅ analytics for toggle (new state after toggle)
    const toggled = tasks.find((t) => t.id === id);
    if (toggled) {
      track({
        type: "task.toggled",
        date: todayStr,
        taskId: toggled.id,
        completed: !toggled.completed,
      });
    }

    // immediate check so modal pops right after last checkbox
    const allCompleted =
      updated.length > 0 && updated.every((t) => t.completed);
    const alreadyCelebrated = localStorage.getItem(CELEBRATE_KEY) === "true";
    if (allCompleted && !alreadyCelebrated) {
      setShowReward(true);
      localStorage.setItem(CELEBRATE_KEY, "true");
      // ✅ analytics (guarded so it fires once per day)
      track({ type: "reward.completed_day", date: todayStr });
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;
    const updated = tasks.map((t) =>
      t.id === editingId ? { ...t, text: trimmed } : t
    );
    onTaskChange(updated);
    setEditingId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const remove = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onTaskChange(updated);
  };

  const add = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const created: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
    };
    onTaskChange([...tasks, created]);
    setNewText("");
  };

  const resetToDefaults = () => {
    const restored: Task[] = DEFAULT_TASKS.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      completed: false,
    }));
    onTaskChange(restored);
    // keep once-per-day guard: no celebration again after reset on same day
  };

  const onNewKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") add();
  };

  const onEditKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Daily Tasks</h2>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            title="Restore the default task list"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* Add new task */}
      <div className="flex gap-2 mb-5">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={onNewKey}
          placeholder="Add a new task..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={add}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Add
        </button>
      </div>

      {/* Task list */}
      <ul className="space-y-3">
        {tasks.map((task) => {
          const isEditing = editingId === task.id;
          return (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggle(task.id)}
                  className="h-5 w-5 accent-blue-600"
                />

                {isEditing ? (
                  <input
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={onEditKey}
                    className="flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <span
                    className={`truncate ${
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.text}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(task)}
                      className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(task.id)}
                      className="px-3 py-1 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {tasks.length === 0 && (
        <p className="text-sm text-gray-500 mt-3">
          No tasks yet. Add your first one above, or click “Reset to defaults”.
        </p>
      )}

      <RewardAnimation show={showReward} onClose={() => setShowReward(false)} />
    </section>
  );
}
