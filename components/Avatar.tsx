
import React from 'react';
import type { Mood } from '../types';
import { MOOD_MAP } from '../constants';

interface AvatarProps {
  mood?: Mood;
}

const Avatar: React.FC<AvatarProps> = ({ mood }) => {
  const moodInfo = mood ? MOOD_MAP[mood] : null;
  const bgColor = moodInfo ? moodInfo.color : '#E5E7EB'; // Default gray
  const emoji = moodInfo ? moodInfo.emoji : '🌱';

  return (
    <div
      className="w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-500 ease-in-out shadow-lg"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-6xl">{emoji}</span>
    </div>
  );
};

export default Avatar;
