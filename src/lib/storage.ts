import type {
  DailyGoalProgress,
  ErrorNotebookEntry,
  SimuladoResult,
  SimuladoSession,
} from "./types";

const STORAGE_KEYS = {
  activeSession: "simulado-active-session-v1",
  latestResult: "simulado-result-v2",
  history: "simulado-history-v1",
  notebook: "simulado-notebook-v1",
  goals: "simulado-goals-v1",
  preferences: "simulado-preferences-v1",
} as const;

export interface UserPreferences {
  theme: "light" | "dark";
  fontScale: 0.95 | 1 | 1.1;
  focusMode: boolean;
  dailyGoal: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  fontScale: 1,
  focusMode: false,
  dailyGoal: 20,
};

const DEFAULT_GOALS: DailyGoalProgress = {
  goal: 20,
  solvedByDay: {},
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isClient() {
  return typeof window !== "undefined";
}

export function getActiveSession(): SimuladoSession | null {
  if (!isClient()) return null;
  return safeParse<SimuladoSession | null>(
    localStorage.getItem(STORAGE_KEYS.activeSession),
    null,
  );
}

export function setActiveSession(session: SimuladoSession) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.activeSession, JSON.stringify(session));
}

export function clearActiveSession() {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.activeSession);
}

export function setLatestResult(result: SimuladoResult) {
  if (!isClient()) return;
  sessionStorage.setItem(STORAGE_KEYS.latestResult, JSON.stringify(result));
}

export function getLatestResult(): SimuladoResult | null {
  if (!isClient()) return null;
  const sessionValue = sessionStorage.getItem(STORAGE_KEYS.latestResult);
  const localValue = localStorage.getItem(STORAGE_KEYS.latestResult);
  return safeParse<SimuladoResult | null>(sessionValue ?? localValue, null);
}

export function getHistory(): SimuladoResult[] {
  if (!isClient()) return [];
  return safeParse<SimuladoResult[]>(
    localStorage.getItem(STORAGE_KEYS.history),
    [],
  );
}

export function pushHistory(result: SimuladoResult) {
  if (!isClient()) return;
  const current = getHistory();
  const next = [result, ...current].slice(0, 120);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
}

export function getNotebook(): ErrorNotebookEntry[] {
  if (!isClient()) return [];
  return safeParse<ErrorNotebookEntry[]>(
    localStorage.getItem(STORAGE_KEYS.notebook),
    [],
  );
}

export function upsertNotebook(entries: ErrorNotebookEntry[]) {
  if (!isClient()) return;
  const current = getNotebook();
  const byId = new Map(current.map((entry) => [entry.id, entry]));
  for (const entry of entries) {
    byId.set(entry.id, entry);
  }
  localStorage.setItem(
    STORAGE_KEYS.notebook,
    JSON.stringify([...byId.values()]),
  );
}

export function removeNotebookEntry(id: string) {
  if (!isClient()) return;
  const next = getNotebook().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEYS.notebook, JSON.stringify(next));
}

export function getPreferences(): UserPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  return {
    ...DEFAULT_PREFERENCES,
    ...safeParse<Partial<UserPreferences>>(
      localStorage.getItem(STORAGE_KEYS.preferences),
      {},
    ),
  };
}

export function setPreferences(preferences: UserPreferences) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
}

export function getGoalProgress(): DailyGoalProgress {
  if (!isClient()) return DEFAULT_GOALS;
  const parsed = safeParse<DailyGoalProgress>(
    localStorage.getItem(STORAGE_KEYS.goals),
    DEFAULT_GOALS,
  );
  return {
    goal: parsed.goal || DEFAULT_GOALS.goal,
    solvedByDay: parsed.solvedByDay || {},
  };
}

export function addSolvedQuestions(dayKey: string, amount: number) {
  if (!isClient()) return;
  const progress = getGoalProgress();
  progress.solvedByDay[dayKey] = (progress.solvedByDay[dayKey] ?? 0) + amount;
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(progress));
}

export function setDailyGoal(goal: number) {
  if (!isClient()) return;
  const progress = getGoalProgress();
  progress.goal = goal;
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(progress));
}

