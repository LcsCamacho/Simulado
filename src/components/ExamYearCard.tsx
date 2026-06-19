import Link from "next/link";
import type { ExamSummary } from "@/lib/types";

interface ExamYearCardProps {
  exam: ExamSummary;
  latestYear: number;
}

export function ExamYearCard({ exam, latestYear }: ExamYearCardProps) {
  const isLatest = exam.year === latestYear;

  return (
    <Link
      href={`/simulado?year=${exam.year}`}
      className="tonal-lift group rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-button bg-primary-container text-on-primary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wider text-primary">
              Prova oficial
            </p>
            <h3 className="text-headline-md font-bold text-on-surface">
              {exam.title}
            </h3>
          </div>
        </div>
        {isLatest && (
          <span className="rounded-full bg-secondary-container px-3 py-1 text-caption font-semibold text-on-secondary-container">
            Novo
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {exam.disciplines.map((d) => (
          <span
            key={d.value}
            className="rounded-full bg-surface-container px-3 py-1 text-caption text-on-surface-variant"
          >
            {d.label.split(" e ")[0]}
          </span>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-1 text-label-md font-semibold text-primary">
        Iniciar simulado
        <span className="material-symbols-outlined text-[18px] transition group-hover:translate-x-0.5">
          play_circle
        </span>
      </p>
    </Link>
  );
}
