"use client";

import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/lib/types";

interface QuestionMapProps {
  questions: PublicQuestion[];
  answers: Record<string, string | null | undefined>;
  currentIndex: number;
  onJump: (index: number) => void;
}

export function QuestionMap({
  questions,
  answers,
  currentIndex,
  onJump,
}: QuestionMapProps) {
  return (
    <section className="mb-6 rounded-card border border-outline-variant/30 bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-label-md font-semibold text-on-surface">
          Mapa de questões
        </h2>
        <div className="flex items-center gap-3 text-caption text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Respondida
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-tertiary" />
            Pulada
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-outline-variant" />
            Em branco
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
        {questions.map((question, idx) => {
          const answer = answers[question.id];
          const stateClass =
            answer === null
              ? "bg-tertiary-container text-on-background"
              : answer
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant";

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onJump(idx)}
              className={cn(
                "rounded-button border px-2 py-2 text-label-md font-semibold transition",
                stateClass,
                idx === currentIndex
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-outline-variant",
              )}
            >
              {String(idx + 1).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </section>
  );
}

