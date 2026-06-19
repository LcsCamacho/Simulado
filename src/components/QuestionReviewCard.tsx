import { getAlternativeText } from "@/lib/enem";
import { formatQuestionTime } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { QuestionResult } from "@/lib/types";
import { QuestionContext } from "./QuestionContext";
import { QuestionImage } from "./QuestionImage";

interface QuestionReviewCardProps {
  question: QuestionResult;
  highlighted?: boolean;
}

export function QuestionReviewCard({
  question: q,
  highlighted = false,
}: QuestionReviewCardProps) {
  const statusLabel = q.selected === null
    ? "Pulada"
    : q.isCorrect
      ? "Acertou"
      : "Errou";

  return (
    <article
      id={`review-${q.id}`}
      className={cn(
        "scroll-mt-24 rounded-button border bg-surface-container-low p-4 transition",
        q.selected === null
          ? "border-outline-variant"
          : q.isCorrect
            ? "border-primary/40"
            : "border-error/40",
        highlighted && "ring-2 ring-primary",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-label-md font-semibold text-on-surface">
          Questão {q.index}: {q.title}
        </p>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-caption font-semibold",
            q.selected === null
              ? "bg-surface-container-high text-on-surface-variant"
              : q.isCorrect
                ? "bg-primary-container text-on-primary-container"
                : "bg-error-container text-on-error-container",
          )}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-2 text-caption text-on-surface-variant">
        Tempo na questão: {formatQuestionTime(q.timeSpentSec ?? 0)}
      </p>

      {q.question?.context && (
        <div className="mt-3">
          <QuestionContext content={q.question.context} />
        </div>
      )}

      <div className="mt-2 space-y-2 text-body-md">
        <p className={q.isCorrect ? "text-primary" : "text-on-surface-variant"}>
          Sua resposta:{" "}
          <strong>{getAlternativeText(q.question?.alternatives ?? [], q.selected)}</strong>
        </p>
        {!q.isCorrect && (
          <p className="text-primary">
            Resposta correta:{" "}
            <strong>{getAlternativeText(q.question?.alternatives ?? [], q.correct)}</strong>
          </p>
        )}
      </div>

      {q.question?.alternatives && (
        <div className="mt-3 grid gap-2">
          {q.question.alternatives
            .filter((alt) => alt.file)
            .map((alt) => (
              <QuestionImage
                key={`${q.id}-${alt.letter}`}
                src={alt.file!}
                alt={`Alternativa ${alt.letter}`}
                zoomable
              />
            ))}
        </div>
      )}
    </article>
  );
}
