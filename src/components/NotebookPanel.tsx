"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { removeNotebookEntry, setActiveSession } from "@/lib/storage";
import type { PublicQuestion } from "@/lib/types";
import { QuestionContext } from "./QuestionContext";

export function NotebookPanel() {
  const [items, setItems] = useState(() =>
    typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("simulado-notebook-v1") || "[]"),
  );

  const questions = useMemo(
    () => items.map((item: { question: PublicQuestion }) => item.question),
    [items],
  );

  function handleRefazer() {
    if (!questions.length) return;
    const first = questions[0];
    const config = {
      year: first.year,
      discipline: "all" as const,
      count: questions.length,
      timed: false,
      minutes: 45,
      mode: "custom" as const,
    };
    setActiveSession({
      config,
      questions,
      answers: {},
      questionTimeSec: {},
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remainingSeconds: null,
      paused: false,
    });
    window.location.href = "/simulado/executar";
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <h1 className="text-headline-md font-bold text-on-background">
          Caderno de erros
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Questões salvas para revisão.
        </p>
        {questions.length > 0 && (
          <button
            type="button"
            onClick={handleRefazer}
            className="mt-4 rounded-full bg-primary px-6 py-3 text-label-md font-semibold text-on-primary"
          >
            Refazer todas
          </button>
        )}
      </section>

      {items.length === 0 ? (
        <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-8 text-center">
          <p className="text-on-surface-variant">Nenhuma questão salva.</p>
          <Link
            href="/simulado"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-on-primary"
          >
            Fazer simulado
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          {items.map(
            (item: {
              id: string;
              question: PublicQuestion;
              selected: string | null;
              correct: string;
            }) => (
              <article
                key={item.id}
                className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-label-md font-semibold text-on-surface">
                    Questão {item.question.index}: {item.question.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      removeNotebookEntry(item.id);
                      setItems((prev: typeof items) =>
                        prev.filter((entry: { id: string }) => entry.id !== item.id),
                      );
                    }}
                    className="text-caption text-error"
                  >
                    remover
                  </button>
                </div>
                {item.question.context && (
                  <div className="mt-3">
                    <QuestionContext content={item.question.context} />
                  </div>
                )}
                <p className="text-body-md text-error">
                  Sua: {item.selected ?? "Pulada"} · Correta: {item.correct}
                </p>
              </article>
            ),
          )}
        </section>
      )}
    </div>
  );
}

