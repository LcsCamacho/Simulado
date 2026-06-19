import { cache } from "react";
import type {
  Alternative,
  Discipline,
  EnemQuestion,
  ExamSummary,
  PublicQuestion,
  QuestionResult,
  SimuladoConfig,
} from "./types";

const ENEM_BASE = "https://api.enem.dev/v1";
const PAGE_SIZE = 50;

interface QuestionsPage {
  metadata: { hasMore: boolean; total: number };
  questions: EnemQuestion[];
}

async function fetchQuestionsPage(
  year: number,
  offset: number,
): Promise<QuestionsPage> {
  const res = await fetch(
    `${ENEM_BASE}/exams/${year}/questions?limit=${PAGE_SIZE}&offset=${offset}`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    throw new Error("Falha ao carregar questões");
  }

  return res.json();
}

export const fetchExams = cache(async (): Promise<ExamSummary[]> => {
  const res = await fetch(`${ENEM_BASE}/exams`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error("Falha ao carregar provas do ENEM");
  }

  return res.json();
});

export const fetchAllQuestions = cache(
  async (year: number): Promise<EnemQuestion[]> => {
    const first = await fetchQuestionsPage(year, 0);
    const { total } = first.metadata;

    if (total <= PAGE_SIZE) {
      return first.questions;
    }

    const offsets: number[] = [];
    for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
      offsets.push(offset);
    }

    const rest = await Promise.all(
      offsets.map((offset) => fetchQuestionsPage(year, offset)),
    );

    return [first.questions, ...rest.map((p) => p.questions)].flat();
  },
);

export function parseQuestionId(
  id: string,
): { year: number; index: number } | null {
  const match = id.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  return { year: Number(match[1]), index: Number(match[2]) };
}

export async function fetchQuestionsByIndices(
  year: number,
  indices: number[],
): Promise<EnemQuestion[]> {
  const indexSet = new Set(indices);
  if (indexSet.size === 0) return [];

  const offsets = new Set<number>();
  for (const index of indexSet) {
    offsets.add(Math.floor((index - 1) / PAGE_SIZE) * PAGE_SIZE);
  }

  const pages = await Promise.all(
    [...offsets].map((offset) => fetchQuestionsPage(year, offset)),
  );

  return pages
    .flatMap((p) => p.questions)
    .filter((q) => indexSet.has(q.index));
}

export function toPublicQuestion(question: EnemQuestion): PublicQuestion {
  return {
    id: `${question.year}-${question.index}`,
    title: question.title,
    index: question.index,
    discipline: question.discipline,
    year: question.year,
    context: question.context,
    files: question.files,
    alternativesIntroduction: question.alternativesIntroduction,
    alternatives: question.alternatives.map(({ letter, text, file }) => ({
      letter,
      text,
      file,
    })),
  };
}

export function filterQuestions(
  questions: EnemQuestion[],
  discipline: Discipline | "all",
): EnemQuestion[] {
  if (discipline === "all") return questions;
  return questions.filter((q) => q.discipline === discipline);
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function buildSimulado(
  config: SimuladoConfig,
): Promise<{ public: PublicQuestion[]; private: EnemQuestion[] }> {
  const all = await fetchAllQuestions(config.year);
  const filtered = filterQuestions(all, config.discipline);
  const selected = shuffle(filtered).slice(0, config.count);

  if (selected.length === 0) {
    throw new Error("Nenhuma questão encontrada para os filtros selecionados");
  }

  return {
    public: selected.map(toPublicQuestion),
    private: selected,
  };
}

export function gradeSimulado(
  questions: EnemQuestion[],
  answers: Record<string, string | null>,
  questionTimeSec: Record<string, number> = {},
) {
  const results: QuestionResult[] = questions.map((q) => {
    const id = `${q.year}-${q.index}`;
    const selected = answers[id] ?? null;
    const correct = q.correctAlternative;

    return {
      id,
      index: q.index,
      title: q.title,
      selected,
      correct,
      isCorrect: selected === correct,
      timeSpentSec: questionTimeSec[id] ?? 0,
      question: toPublicQuestion(q),
    };
  });

  const correct = results.filter((r) => r.isCorrect).length;
  const totalTime = Object.values(questionTimeSec).reduce((sum, t) => sum + t, 0);
  const byDiscipline = questions.reduce<
    Partial<Record<Discipline, { total: number; correct: number }>>
  >((acc, q) => {
    const key = q.discipline;
    if (!acc[key]) {
      acc[key] = { total: 0, correct: 0 };
    }
    acc[key]!.total += 1;
    if (answers[`${q.year}-${q.index}`] === q.correctAlternative) {
      acc[key]!.correct += 1;
    }
    return acc;
  }, {});
  const triScore = estimateTri(correct, questions.length);

  return {
    id: crypto.randomUUID(),
    year: questions[0]?.year ?? 0,
    discipline: inferDiscipline(questions),
    total: results.length,
    correct,
    percentage: Math.round((correct / results.length) * 100),
    durationSec: totalTime,
    completedAt: new Date().toISOString(),
    triScore,
    byDiscipline,
    questions: results,
  };
}

function inferDiscipline(questions: EnemQuestion[]): Discipline | "all" {
  const set = new Set(questions.map((q) => q.discipline));
  return set.size === 1 ? (questions[0]?.discipline ?? "all") : "all";
}

export function estimateTri(correct: number, total: number): number {
  if (!total) return 0;
  const ratio = correct / total;
  return Math.round(250 + ratio * 750);
}

export function getAlternativeText(
  alternatives: Alternative[],
  letter: string | null,
): string {
  if (!letter) return "Pulada";
  const found = alternatives.find((alt) => alt.letter === letter);
  return found?.text?.trim() || `Alternativa ${letter}`;
}
