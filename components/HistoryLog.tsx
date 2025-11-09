
import React from 'react';
import type { DailyCheckIn, DailyTasks } from '../types';
import { MOOD_MAP } from '../constants';

interface HistoryLogProps {
  checkIns: DailyCheckIn[];
  tasks: DailyTasks[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ checkIns, tasks }) => {
  const combinedHistory = checkIns.map(checkIn => {
    const taskData = tasks.find(t => t.date === checkIn.date);
    const completedTasks = taskData ? taskData.tasks.filter(t => t.completed).length : 0;
    const totalTasks = taskData ? taskData.tasks.length : 0;
    return {
      date: checkIn.date,
      mood: checkIn.mood,
      completedTasks,
      totalTasks,
    };
  });

  if (combinedHistory.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-2xl shadow-sm">
        <p className="text-gray-500">No history yet. Start by checking in on the Home screen!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Your Journey</h2>
      <div className="space-y-4">
        {combinedHistory.map(item => {
          const moodInfo = MOOD_MAP[item.mood];
          return (
            <div key={item.date} className="flex items-center p-4 rounded-lg" style={{backgroundColor: moodInfo.pastelColor}}>
              <div className="text-4xl mr-4">{moodInfo.emoji}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-700">{new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-gray-600">Mood: {item.mood}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">
                    Tasks: {item.completedTasks}/{item.totalTasks}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryLog;
