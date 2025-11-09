
export type Mood = 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Neutral' | 'Productive';

export interface MoodInfo {
  name: Mood;
  color: string;
  pastelColor: string;
  emoji: string;
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  mood: Mood;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyTasks {
  date: string; // YYYY-MM-DD
  tasks: Task[];
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  aiReflection?: string;
}
