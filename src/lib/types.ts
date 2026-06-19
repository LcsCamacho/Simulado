export type Discipline =
  | "ciencias-humanas"
  | "ciencias-natureza"
  | "linguagens"
  | "matematica";

export interface ExamSummary {
  title: string;
  year: number;
  disciplines: { label: string; value: Discipline }[];
}

export interface Alternative {
  letter: string;
  text: string | null;
  file: string | null;
}

export interface EnemQuestion {
  title: string;
  index: number;
  discipline: Discipline;
  language: string | null;
  year: number;
  context: string | null;
  files: string[];
  correctAlternative: string;
  alternativesIntroduction: string | null;
  alternatives: Alternative[];
}

export interface PublicQuestion {
  id: string;
  title: string;
  index: number;
  discipline: Discipline;
  year: number;
  context: string | null;
  files: string[];
  alternativesIntroduction: string | null;
  alternatives: Alternative[];
}

export interface SimuladoConfig {
  year: number;
  discipline: Discipline | "all";
  count: number;
  timed: boolean;
  minutes: number;
  mode?: "custom" | "full-area" | "full-enem";
}

export interface SubmitAnswer {
  id: string;
  selected: string | null;
}

export interface QuestionResult {
  id: string;
  index: number;
  title: string;
  selected: string | null;
  correct: string;
  isCorrect: boolean;
  question: PublicQuestion;
  timeSpentSec: number;
}

export interface SimuladoResult {
  id: string;
  year: number;
  discipline: Discipline | "all";
  total: number;
  correct: number;
  percentage: number;
  durationSec: number;
  completedAt: string;
  triScore: number;
  byDiscipline: Partial<Record<Discipline, { total: number; correct: number }>>;
  questions: QuestionResult[];
}

export interface SimuladoSession {
  config: SimuladoConfig;
  questions: PublicQuestion[];
  answers: Record<string, string | null | undefined>;
  questionTimeSec: Record<string, number>;
  currentIndex: number;
  startedAt: string;
  updatedAt: string;
  remainingSeconds: number | null;
  paused: boolean;
}

export interface ErrorNotebookEntry {
  id: string;
  question: PublicQuestion;
  selected: string | null;
  correct: string;
  year: number;
  savedAt: string;
  lastAttemptId: string;
}

export interface DailyGoalProgress {
  goal: number;
  solvedByDay: Record<string, number>;
}
