import React, { useState } from "react";
import type { JournalEntry, DailyCheckIn, DailyTasks } from "../types";
import { getAiReflection } from "../services/geminiService";
// ✅ NEW: client analytics
import { track } from "../lib/analytics";

interface JournalProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  checkInHistory: DailyCheckIn[];
  taskHistory: DailyTasks[];
}

const Journal: React.FC<JournalProps> = ({
  entries,
  setEntries,
  checkInHistory,
  taskHistory,
}) => {
  const [newEntry, setNewEntry] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEntry = async () => {
    if (!newEntry.trim()) return;

    setIsLoading(true);
    try {
      const reflection = await getAiReflection(
        newEntry,
        checkInHistory,
        taskHistory
      );

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        content: newEntry,
        aiReflection: reflection,
      };

      setEntries((prev) => [entry, ...prev]);

      // ✅ Send analytics (journal created)
      track({
        type: "journal.created",
        date: entry.date.split("T")[0],
        entryId: entry.id,
        length: newEntry.length,
      });

      setNewEntry("");
    } catch (err) {
      console.error("Journal add failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          What's on your mind?
        </h2>
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Write your thoughts here..."
          className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          disabled={isLoading}
        />
        <button
          onClick={handleAddEntry}
          disabled={isLoading || !newEntry.trim()}
          className="mt-4 w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Reflect with AI"
          )}
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-400 mb-2">
              {new Date(entry.date).toLocaleString()}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
            {entry.aiReflection && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-300 rounded-r-lg">
                <p className="text-sm font-semibold text-blue-800">
                  Bloom's Reflection:
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {entry.aiReflection}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;
