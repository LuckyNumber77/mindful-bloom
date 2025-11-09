
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DailyCheckIn, DailyTasks } from '../types';

export async function getAiReflection(
    journalEntry: string, 
    checkInHistory: DailyCheckIn[], 
    taskHistory: DailyTasks[]
): Promise<string> {
   const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
 if (!apiKey) {
   return "API key not configured. Please set up your environment.";
 }
  
  try {
    const ai = new GoogleGenerativeAI(apiKey);

    const recentMoods = checkInHistory.slice(0, 5).map(c => `- ${c.date}: ${c.mood}`).join('\n');
    const recentTasks = taskHistory.slice(0, 5).map(t => {
      const completed = t.tasks.filter(task => task.completed).length;
      const total = t.tasks.length;
      return `- ${t.date}: ${completed}/${total} tasks completed.`;
    }).join('\n');

    const systemInstruction = `You are a gentle and supportive AI companion named Bloom. Your goal is to provide mindfulness reminders, suggest coping tips, or offer relaxation techniques based on the user's journal entry and recent mood/task history. Do not diagnose, treat, or give medical advice. Keep responses short (2-3 sentences), encouraging, and calm. Frame your response as a gentle reflection or suggestion.`;
    
    const prompt = `
      Based on the following user data, provide a short, gentle, and supportive reflection.

      Today's Journal Entry:
      "${journalEntry}"

      Recent Moods (last 5 days):
      ${recentMoods || 'No mood history yet.'}

      Recent Task Completion (last 5 days):
      ${recentTasks || 'No task history yet.'}
    `;
    
const model = ai.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction,
});

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: { temperature: 0.7 },
  });

  return result.response.text();
  } catch (error) {
    console.error("Error fetching AI reflection:", error);
    return "I'm having a little trouble connecting right now. Let's try again in a moment.";
  }
}
