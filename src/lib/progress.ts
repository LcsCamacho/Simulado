import type { DailyGoalProgress, SimuladoResult } from "./types";

export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeStreak(progress: DailyGoalProgress): number {
  const solvedByDay = progress.solvedByDay;
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = toDayKey(cursor);
    if ((solvedByDay[key] ?? 0) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getPreviousAttempt(
  history: SimuladoResult[],
  currentId: string,
): SimuladoResult | null {
  const filtered = history.filter((item) => item.id !== currentId);
  return filtered[0] ?? null;
}

export function formatDuration(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${String(remMinutes).padStart(2, "0")}m`;
  }
  return `${minutes} min`;
}

export function formatQuestionTime(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem > 0 ? `${minutes}m ${rem}s` : `${minutes}m`;
}

export function averageQuestionTime(questions: { timeSpentSec: number }[]): number {
  if (!questions.length) return 0;
  const total = questions.reduce((sum, q) => sum + (q.timeSpentSec ?? 0), 0);
  return Math.round(total / questions.length);
}

