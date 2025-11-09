
import type { MoodInfo, Task } from './types';

export const MOODS: MoodInfo[] = [
  { name: 'Happy', color: '#FDFD96', pastelColor: '#FEFEE0', emoji: '😊' },
  { name: 'Calm', color: '#77DD77', pastelColor: '#D5F5D5', emoji: '😌' },
  { name: 'Productive', color: '#FFC0CB', pastelColor: '#FFEFF2', emoji: '🚀' },
  { name: 'Anxious', color: '#FFB347', pastelColor: '#FFEDD5', emoji: '😟' },
  { name: 'Sad', color: '#AEC6CF', pastelColor: '#E1E9EC', emoji: '😢' },
  { name: 'Neutral', color: '#D3D3D3', pastelColor: '#F0F0F0', emoji: '😐' },
];

export const MOOD_MAP = MOODS.reduce((acc, mood) => {
    acc[mood.name] = mood;
    return acc;
}, {} as Record<string, MoodInfo>);


export const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
    { text: 'Drink a glass of water', completed: false },
    { text: 'Stretch for 5 minutes', completed: false },
    { text: 'Go for a short walk', completed: false },
    { text: 'Tidy up one area', completed: false },
    { text: 'Practice mindful breathing for 1 minute', completed: false },
];
