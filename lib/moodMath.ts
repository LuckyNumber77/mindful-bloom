// Map moods → numeric score for a blended "mood light"
export const MOOD_SCORE: Record<string, number> = {
  happy: 1.0,
  calm: 0.6,
  productive: 0.7,
  neutral: 0.5,
  anxious: 0.2,
  sad: 0.0,
};

export function moodToScore(m: string | null | undefined) {
  return MOOD_SCORE[m ?? "neutral"] ?? 0.5;
}

// Score → color (green → yellow → red)
export function scoreToHex(score: number) {
  const s = Math.max(0, Math.min(1, score));
  // 0 -> red(230,60,60), 0.5 -> yellow(245,200,70), 1 -> green(60,200,110)
  const lerp = (a:number,b:number,t:number)=>Math.round(a+(b-a)*t);
  let r:number,g:number,bv:number;
  if (s < 0.5) {
    const t = s/0.5; // red->yellow
    r = lerp(230,245,t); g = lerp(60,200,t); bv = lerp(60,70,t);
  } else {
    const t = (s-0.5)/0.5; // yellow->green
    r = lerp(245,60,t); g = lerp(200,200,t); bv = lerp(70,110,t);
  }
  const toHex = (n:number)=>n.toString(16).padStart(2,"0");
  return `#${toHex(r)}${toHex(g)}${toHex(bv)}`;
}
