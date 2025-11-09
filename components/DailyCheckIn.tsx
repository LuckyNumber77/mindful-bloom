
import React from 'react';
import type { Mood, MoodInfo, DailyCheckIn } from '../types';

interface DailyCheckInProps {
  onCheckIn: (mood: Mood) => void;
  moods: MoodInfo[];
  todayCheckIn?: DailyCheckIn;
}

const DailyCheckInComponent: React.FC<DailyCheckInProps> = ({ onCheckIn, moods, todayCheckIn }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {moods.map((moodInfo) => (
        <button
          key={moodInfo.name}
          onClick={() => onCheckIn(moodInfo.name)}
          className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 ${
            todayCheckIn?.mood === moodInfo.name
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : 'ring-1 ring-gray-200 hover:ring-blue-300'
          }`}
          style={{ backgroundColor: moodInfo.pastelColor }}
        >
          <span className="text-3xl">{moodInfo.emoji}</span>
          <span className="text-xs font-medium text-gray-600 mt-1">{moodInfo.name}</span>
        </button>
      ))}
    </div>
  );
};

export default DailyCheckInComponent;
