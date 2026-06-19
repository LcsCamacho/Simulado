"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  averageQuestionTime,
  computeStreak,
  formatDuration,
  formatQuestionTime,
  getPreviousAttempt,
} from "@/lib/progress";
import { getGoalProgress, getHistory, getLatestResult, setDailyGoal } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { SimuladoResult } from "@/lib/types";
import { QuestionReviewCard } from "./QuestionReviewCard";

export function ResultsPanel() {
  const [result] = useState<SimuladoResult | null>(() => getLatestResult());
  const [history] = useState<SimuladoResult[]>(() => getHistory());
  const [goal, setGoal] = useState(() => getGoalProgress().goal);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");

  const byDiscipline = useMemo(
    () =>
      result
        ? Object.entries(result.byDiscipline).map(([discipline, stats]) => ({
            discipline,
            total: stats?.total ?? 0,
            correct: stats?.correct ?? 0,
            pct:
              stats?.total && stats.total > 0
                ? Math.round((stats.correct / stats.total) * 100)
                : 0,
          }))
        : [],
    [result],
  );

  const reviewQuestions = useMemo(() => {
    if (!result) return [];
    if (reviewFilter === "wrong") {
      return result.questions.filter((q) => !q.isCorrect);
    }
    return result.questions;
  }, [result, reviewFilter]);

  if (!result) {
    return (
      <div className="mx-auto max-w-xl rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <p className="text-on-surface-variant">Nenhum resultado encontrado.</p>
        <Link
          href="/simulado"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-on-primary"
        >
          Fazer simulado
        </Link>
      </div>
    );
  }

  const passed = result.percentage >= 60;
  const skipped = result.questions.filter((q) => q.selected === null).length;
  const errors = result.questions.filter(
    (q) => q.selected !== null && !q.isCorrect,
  ).length;
  const previousAttempt = getPreviousAttempt(history, result.id);
  const diff = previousAttempt
    ? result.percentage - previousAttempt.percentage
    : null;
  const streak = computeStreak(getGoalProgress());
  const avgTime = averageQuestionTime(result.questions);
  const shareResult = result;

  function scrollToReview(id: string) {
    setHighlightId(id);
    document.getElementById(`review-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleShare() {
    const text = `Fiz ${shareResult.correct}/${shareResult.total} no simulado ENEM (${shareResult.percentage}%). TRI aproximada: ${shareResult.triScore}.`;
    if (navigator.share) {
      await navigator.share({ text, title: "Meu resultado no simulado ENEM" });
      return;
    }
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <section className="relative overflow-hidden rounded-card border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-fixed/20 blur-3xl" />
        <div
          className="score-ring relative mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-full"
          style={
            {
              "--score-percent": `${result.percentage}%`,
            } as React.CSSProperties
          }
        >
          <div className="flex flex-col items-center">
            <span className="text-display-lg font-bold text-primary">
              {result.percentage}%
            </span>
            <span className="text-label-md text-on-surface-variant">
              Desempenho
            </span>
          </div>
        </div>

        <h1 className="text-headline-lg font-bold text-on-background">
          {passed ? "Excelente resultado!" : "Continue estudando"}
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Você acertou {result.correct} de {result.total} questões.
        </p>
        <p className="mt-2 text-body-md text-on-surface-variant">
          TRI aproximada: <strong>{result.triScore}</strong> · Duração:{" "}
          {formatDuration(result.durationSec)} · Média/questão:{" "}
          {formatQuestionTime(avgTime)}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-button bg-surface-container p-4">
            <span className="block text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Acertos
            </span>
            <span className="text-headline-md font-bold text-primary">
              {result.correct}
            </span>
          </div>
          <div className="rounded-button bg-surface-container p-4">
            <span className="block text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Erros
            </span>
            <span className="text-headline-md font-bold text-error">
              {String(errors).padStart(2, "0")}
            </span>
          </div>
          <div className="rounded-button bg-surface-container p-4">
            <span className="block text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Puladas
            </span>
            <span className="text-headline-md font-bold text-on-surface-variant">
              {String(skipped).padStart(2, "0")}
            </span>
          </div>
          <div className="rounded-button bg-surface-container p-4">
            <span className="block text-caption font-semibold uppercase tracking-wider text-on-surface-variant">
              Streak
            </span>
            <span className="text-headline-md font-bold text-on-background">
              {streak} dia(s)
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-headline-md font-semibold text-on-background">
          Motivação e rotina
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-button bg-surface-container p-4">
            <p className="text-caption text-on-surface-variant">Comparação</p>
            <p className="mt-1 text-body-md text-on-surface">
              {diff === null
                ? "Primeira tentativa registrada."
                : `${diff >= 0 ? "+" : ""}${diff}% vs tentativa anterior`}
            </p>
          </div>
          <div className="rounded-button bg-surface-container p-4">
            <label className="text-caption text-on-surface-variant">Meta diária</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={200}
                value={goal}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setGoal(value);
                  setDailyGoal(value);
                }}
                className="h-10 w-24 rounded-button border border-outline-variant bg-surface px-3"
              />
              <span className="text-body-md text-on-surface-variant">
                questões/dia
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="mt-4 rounded-full border-2 border-primary px-5 py-2 text-label-md font-semibold text-primary"
        >
          Compartilhar resultado
        </button>
      </section>

      <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-headline-md font-semibold text-on-background">
            Gabarito Detalhado
          </h2>
          <span className="rounded-full bg-secondary-container px-3 py-1 text-label-md font-semibold text-on-secondary-container">
            ENEM
          </span>
        </div>
        <p className="mb-4 text-caption text-on-surface-variant">
          Clique em uma questão para ir à revisão.
        </p>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
          {result.questions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => scrollToReview(q.id)}
              title={`Questão ${q.index}: sua ${q.selected ?? "—"}, correta ${q.correct} · ${formatQuestionTime(q.timeSpentSec ?? 0)}`}
              className={cn(
                "flex h-12 w-full cursor-pointer items-center justify-center rounded-button text-label-md font-semibold transition hover:scale-105 active:scale-95",
                q.selected === null
                  ? "bg-surface-container-high text-on-surface-variant"
                  : q.isCorrect
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-error-container text-on-error-container",
                highlightId === q.id && "ring-2 ring-primary ring-offset-2",
              )}
            >
              {String(q.index).padStart(2, "0")}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-headline-md font-semibold text-on-background">
            Revisão detalhada
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReviewFilter("all")}
              className={cn(
                "rounded-full px-4 py-2 text-label-md font-semibold",
                reviewFilter === "all"
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant",
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter("wrong")}
              className={cn(
                "rounded-full px-4 py-2 text-label-md font-semibold",
                reviewFilter === "wrong"
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant",
              )}
            >
              Só erros
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {reviewQuestions.length === 0 && (
            <p className="text-body-md text-on-surface-variant">
              Nenhuma questão neste filtro.
            </p>
          )}
          {reviewQuestions.map((q) => (
            <QuestionReviewCard
              key={q.id}
              question={q}
              highlighted={highlightId === q.id}
            />
          ))}
        </div>
      </section>

      <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-headline-md font-semibold text-on-background">
          Por área
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {byDiscipline.map((item) => (
            <div
              key={item.discipline}
              className="rounded-button border border-outline-variant bg-surface-container p-3"
            >
              <p className="text-label-md font-semibold capitalize">
                {item.discipline.replace("-", " ")}
              </p>
              <p className="text-caption text-on-surface-variant">
                {item.correct}/{item.total} · {item.pct}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/simulado"
          className="rounded-full bg-primary px-6 py-3 text-label-md font-semibold text-on-primary"
        >
          Novo simulado
        </Link>
        <Link
          href="/"
          className="rounded-full border-2 border-primary px-6 py-3 text-label-md font-semibold text-primary"
        >
          Voltar ao início
        </Link>
        <Link
          href="/desempenho"
          className="rounded-full border-2 border-primary px-6 py-3 text-label-md font-semibold text-primary"
        >
          Histórico
        </Link>
        <Link
          href="/caderno"
          className="rounded-full border-2 border-primary px-6 py-3 text-label-md font-semibold text-primary"
        >
          Caderno de erros
        </Link>
      </div>
    </div>
  );
}
