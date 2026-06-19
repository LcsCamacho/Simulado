"use client";

import { getExtraFileUrls } from "@/lib/question-images";
import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/lib/types";
import { QuestionContext } from "./QuestionContext";
import { QuestionImage } from "./QuestionImage";
import { useEffect } from "react";

interface QuestionCardProps {
  question: PublicQuestion;
  selected: string | null | undefined;
  onSelect: (letter: string) => void;
  onSkip: () => void;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
  onSkip,
}: QuestionCardProps) {
  const skipped = selected === null;
  const extraFiles = getExtraFileUrls(question);

  return (
    <article className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
      {question.context && <QuestionContext content={question.context} />}

      {extraFiles.length > 0 && (
        <div className="mb-6 space-y-4">
          {extraFiles.map((file) => (
            <QuestionImage
              key={file}
              src={file}
              alt="Material da questão"
              className="my-0"
            />
          ))}
        </div>
      )}

      {question.alternativesIntroduction && (
        <p className="mb-5 text-body-lg font-medium text-on-surface">
          {question.alternativesIntroduction}
        </p>
      )}

      <div className="space-y-3">
        {question.alternatives.map((alt) => {
          const active = selected === alt.letter;

          return (
            <button
              key={alt.letter}
              type="button"
              onClick={() => onSelect(alt.letter)}
              className={cn(
                "selectable-card flex w-full items-start gap-4 rounded-button border-2 px-4 py-4 text-left",
                active
                  ? "active border-primary"
                  : "border-outline-variant bg-surface-container-lowest hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-label-md font-bold",
                  active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface",
                )}
              >
                {alt.letter}
              </span>
              <div className="min-w-0 flex-1 pt-1.5">
                {alt.file ? (
                  <QuestionImage
                    src={alt.file}
                    alt={`Alternativa ${alt.letter}`}
                    zoomable={false}
                  />
                ) : alt.text ? (
                  <span className="text-body-md leading-6 text-on-surface-variant">
                    {alt.text}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-button border-2 px-4 py-3 text-label-md font-semibold transition",
          skipped
            ? "border-outline bg-surface-container text-on-surface-variant"
            : "border-outline-variant text-on-surface-variant hover:border-outline hover:bg-surface-container-low",
        )}
      >
        <span className="material-symbols-outlined text-[18px]">skip_next</span>
        Pular questão
      </button>
    </article>
  );
}

interface TimerProps {
  secondsLeft: number;
  paused: boolean;
  onTogglePause: () => void;
  onExpire: () => void;
}

export function Timer({
  secondsLeft,
  paused,
  onTogglePause,
  onExpire,
}: TimerProps) {
  useEffect(() => {
    if (secondsLeft <= 0) onExpire();
  }, [secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const urgent = secondsLeft <= 60;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-label-md font-semibold",
          urgent
            ? "bg-error-container text-on-error-container"
            : "bg-secondary-container text-on-secondary-container",
        )}
      >
        <span className="material-symbols-outlined text-[18px]">timer</span>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={onTogglePause}
        className="rounded-full border border-outline-variant px-3 py-2 text-label-md text-on-surface-variant"
      >
        {paused ? "Retomar" : "Pausar"}
      </button>
    </div>
  );
}
