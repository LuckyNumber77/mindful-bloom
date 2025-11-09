import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { DailyCheckIn, DailyTasks, JournalEntry, Mood, Task } from "./types";
import { MOODS, DEFAULT_TASKS } from "./constants";
import DailyCheckInComponent from "./components/DailyCheckIn";
import Avatar from "./components/Avatar";
import Checklist from "./components/Checklist";
import Journal from "./components/Journal";
import HistoryLog from "./components/HistoryLog";
import Header from "./components/Header";
import { HomeIcon } from "./components/icons/HomeIcon";
import { HistoryIcon } from "./components/icons/HistoryIcon";
import { JournalIcon } from "./components/icons/JournalIcon";

// analytics
import { track } from "./lib/analytics";

// pages
import MoodDashboard from "./pages/MoodDashboard";
import MoodChat from "./pages/MoodChat";

type View = "home" | "history" | "journal" | "dashboard" | "chat";

// inline icons
const StatsIcon: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke={active ? "#3b82f6" : "currentColor"} strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 3v18h18" />
    <rect x="6" y="13" width="3" height="5" rx="1" />
    <rect x="11" y="9" width="3" height="9" rx="1" />
    <rect x="16" y="5" width="3" height="13" rx="1" />
  </svg>
);

const ChatIcon: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke={active ? "#3b82f6" : "currentColor"} strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);

export default function App() {
  const [view, setView] = useState<View>("home");
  const [checkInHistory, setCheckInHistory] = useLocalStorage<DailyCheckIn[]>("checkInHistory", []);
  const [taskHistory, setTaskHistory] = useLocalStorage<DailyTasks[]>("taskHistory", []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>("journalEntries", []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayCheckIn = useMemo(
    () => checkInHistory.find((c) => c.date === todayStr),
    [checkInHistory, todayStr]
  );

  const todayTasks = useMemo(() => {
    let tasksForToday = taskHistory.find((t) => t.date === todayStr);
    if (!tasksForToday) {
      tasksForToday = {
        date: todayStr,
        tasks: DEFAULT_TASKS.map((t) => ({ ...t, id: crypto.randomUUID() })),
      };
    }
    return tasksForToday;
  }, [taskHistory, todayStr]);

  // snapshot of previous tasks to detect new completions
  const prevTasksRef = useRef<Task[] | null>(null);
  useEffect(() => { prevTasksRef.current = todayTasks.tasks; }, [todayTasks]);

  // DAILY CHECK-IN -> track + award once per day
  const handleCheckIn = useCallback(
    (mood: Mood) => {
      const newCheckIn: DailyCheckIn = { date: todayStr, mood };
      setCheckInHistory((prev) => {
        const filtered = prev.filter((c) => c.date !== todayStr);
        return [...filtered, newCheckIn].sort((a, b) => b.date.localeCompare(a.date));
      });

      track({ type: "checkin.created", date: todayStr, mood });

      const awardedKey = `awarded_checkin_${todayStr}`;
      if (!localStorage.getItem(awardedKey)) {
        track({ type: "reward.earned", reason: "checkin", points: 20 });
        localStorage.setItem(awardedKey, "1");
      }
    },
    [todayStr, setCheckInHistory]
  );

  // TASK CHANGE -> detect newly completed tasks and award +5 each
  const handleTaskChange = useCallback(
    (updatedTasks: Task[]) => {
      const prev = prevTasksRef.current || [];
      const prevMap = new Map(prev.map((t) => [t.id, t.completed]));
      const newlyCompleted = updatedTasks.filter((t) => t.completed && !prevMap.get(t.id));
      for (const t of newlyCompleted) {
        track({ type: "reward.earned", reason: "task.completed", points: 5 });
      }

      const newTaskHistoryEntry: DailyTasks = { date: todayStr, tasks: updatedTasks };
      setTaskHistory((prevHist) => {
        const filtered = prevHist.filter((t) => t.date !== todayStr);
        return [...filtered, newTaskHistoryEntry].sort((a, b) => b.date.localeCompare(a.date));
      });

      prevTasksRef.current = updatedTasks;
    },
    [todayStr, setTaskHistory]
  );

  const renderView = () => {
    switch (view) {
      case "history":
        return <HistoryLog checkIns={checkInHistory} tasks={taskHistory} />;
      case "journal":
        return (
          <Journal
            entries={journalEntries}
            setEntries={setJournalEntries}
            checkInHistory={checkInHistory}
            taskHistory={taskHistory}
          />
        );
      case "dashboard":
        return <MoodDashboard />;
      case "chat":
        return <MoodChat />;
      case "home":
      default:
        return (
          <div className="space-y-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">How are you feeling today?</h2>
              <div className="flex justify-center mb-6">
                <Avatar mood={todayCheckIn?.mood} />
              </div>
              <DailyCheckInComponent
                onCheckIn={handleCheckIn}
                moods={MOODS}
                todayCheckIn={todayCheckIn}
              />
            </div>
            <Checklist todayTasks={todayTasks} onTaskChange={handleTaskChange} />
          </div>
        );
    }
  };

  const NavItem: React.FC<{ targetView: View; icon: React.ReactNode; text: string }> = ({
    targetView,
    icon,
    text,
  }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200 ${
        view === targetView ? "text-blue-500" : "text-gray-500 hover:text-blue-400"
      }`}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement, { active: view === targetView })
        : icon}
      <span className="mt-1">{text}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="container mx-auto max-w-2xl p-4 pb-24">
        <Header />
        <main className="mt-6">{renderView()}</main>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md">
        <nav className="flex justify-around max-w-2xl mx-auto">
          <NavItem targetView="home" icon={<HomeIcon />} text="Home" />
          <NavItem targetView="history" icon={<HistoryIcon />} text="History" />
          <NavItem targetView="journal" icon={<JournalIcon />} text="Journal" />
          <NavItem targetView="dashboard" icon={<StatsIcon />} text="Dashboard" />
          <NavItem targetView="chat" icon={<ChatIcon />} text="Chat" />
        </nav>
      </footer>
    </div>
  );
}
