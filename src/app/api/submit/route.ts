import { NextRequest, NextResponse } from "next/server";
import {
  fetchQuestionsByIndices,
  gradeSimulado,
  parseQuestionId,
} from "@/lib/enem";
import type { SubmitAnswer } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      year: number;
      answers: SubmitAnswer[];
      questionTimeSec?: Record<string, number>;
    };

    const { year, answers } = body;

    if (!year || !answers?.length) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const indices = answers
      .map((a) => parseQuestionId(a.id)?.index)
      .filter((index): index is number => index !== undefined);

    const questions = await fetchQuestionsByIndices(year, indices);
    const answerMap = Object.fromEntries(
      answers.map((a) => [a.id, a.selected]),
    );

    const questionById = new Map(
      questions.map((q) => [`${q.year}-${q.index}`, q]),
    );
    const ordered = answers
      .map((a) => questionById.get(a.id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined);

    if (ordered.length !== answers.length) {
      return NextResponse.json(
        { error: "Questões não encontradas para correção" },
        { status: 400 },
      );
    }

    const result = gradeSimulado(ordered, answerMap, body.questionTimeSec ?? {});
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Erro ao corrigir simulado" },
      { status: 500 },
    );
  }
}
