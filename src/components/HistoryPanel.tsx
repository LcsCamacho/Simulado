"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDuration } from "@/lib/progress";
import { getHistory } from "@/lib/storage";
import type { Discipline, SimuladoResult } from "@/lib/types";

export function HistoryPanel() {
  const [history] = useState<SimuladoResult[]>(() => getHistory());
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [year, setYear] = useState<string>("all");

  const filtered = useMemo(
    () =>
      history.filter((attempt) => {
        if (discipline !== "all" && attempt.discipline !== discipline) return false;
        if (year !== "all" && String(attempt.year) !== year) return false;
        return true;
      }),
    [history, discipline, year],
  );

  const years = [...new Set(history.map((item) => String(item.year)))];

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <h1 className="text-headline-md font-bold text-on-background">Histórico</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Evolução por tentativa.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value as Discipline | "all")}
            className="h-12 rounded-button border border-outline-variant bg-surface px-4"
          >
            <option value="all">Todas as áreas</option>
            <option value="linguagens">Linguagens</option>
            <option value="matematica">Matemática</option>
            <option value="ciencias-humanas">Humanas</option>
            <option value="ciencias-natureza">Natureza</option>
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-12 rounded-button border border-outline-variant bg-surface px-4"
          >
            <option value="all">Todos os anos</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-8 text-center">
          <p className="text-on-surface-variant">Sem tentativas para o filtro.</p>
          <Link
            href="/simulado"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-on-primary"
          >
            Fazer simulado
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((attempt) => (
            <article
              key={attempt.id}
              className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-label-md font-semibold text-on-surface">
                  {new Date(attempt.completedAt).toLocaleString("pt-BR")}
                </p>
                <span className="rounded-full bg-secondary-container px-3 py-1 text-label-md font-semibold text-on-secondary-container">
                  {attempt.percentage}%
                </span>
              </div>
              <p className="mt-2 text-body-md text-on-surface-variant">
                {attempt.correct}/{attempt.total} · TRI {attempt.triScore} ·{" "}
                {formatDuration(attempt.durationSec)}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

