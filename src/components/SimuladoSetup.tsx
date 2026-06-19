"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startSimulado } from "@/app/simulado/actions";
import { AREA_OPTIONS, DISCIPLINE_ICONS } from "@/lib/disciplines";
import { getActiveSession } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { ExamSummary, SimuladoConfig } from "@/lib/types";

interface SimuladoSetupProps {
  initialConfig: SimuladoConfig;
  exams: ExamSummary[];
}

export function SimuladoSetup({ initialConfig, exams }: SimuladoSetupProps) {
  const router = useRouter();
  const [config, setConfig] = useState<SimuladoConfig>(initialConfig);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    setHasResume(Boolean(getActiveSession()));
  }, []);

  function applyPreset(mode: "custom" | "full-area" | "full-enem") {
    if (mode === "full-enem") {
      setConfig((c) => ({
        ...c,
        discipline: "all",
        count: 180,
        timed: true,
        minutes: 300,
        mode,
      }));
      return;
    }
    if (mode === "full-area") {
      setConfig((c) => ({
        ...c,
        discipline: c.discipline === "all" ? "linguagens" : c.discipline,
        count: 45,
        timed: true,
        minutes: 135,
        mode,
      }));
      return;
    }
    setConfig((c) => ({
      ...c,
      count: 10,
      timed: false,
      minutes: 30,
      mode,
    }));
  }

  function handleStart() {
    setError(null);
    startTransition(async () => {
      try {
        const data = await startSimulado(config);
        sessionStorage.setItem("simulado-session", JSON.stringify(data));
        router.push("/simulado/executar");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-label-md text-on-surface-variant transition hover:text-primary"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Voltar ao painel
      </Link>

      <section className="mb-10 text-center md:text-left">
        <h1 className="text-headline-lg-mobile font-bold text-on-background md:text-headline-lg">
          Configurar Simulado
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Personalize sua prova para focar no que importa.
        </p>
      </section>

      <div className="space-y-10 rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        {hasResume && (
          <div className="rounded-button border border-primary/30 bg-primary/5 p-4">
            <p className="text-body-md text-on-surface">
              Você tem um simulado em andamento.
            </p>
            <button
              type="button"
              onClick={() => router.push("/simulado/executar")}
              className="mt-3 rounded-full bg-primary px-5 py-2 text-label-md font-semibold text-on-primary"
            >
              Retomar simulado
            </button>
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-label-md font-semibold text-primary">
            <span className="material-symbols-outlined">workspace_premium</span>
            Modo de prova
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => applyPreset("custom")}
              className="rounded-button border border-outline-variant bg-surface px-4 py-3 text-label-md font-semibold text-on-surface"
            >
              Treino rápido
            </button>
            <button
              type="button"
              onClick={() => applyPreset("full-area")}
              className="rounded-button border border-outline-variant bg-surface px-4 py-3 text-label-md font-semibold text-on-surface"
            >
              Prova por área
            </button>
            <button
              type="button"
              onClick={() => applyPreset("full-enem")}
              className="rounded-button border border-outline-variant bg-surface px-4 py-3 text-label-md font-semibold text-on-surface"
            >
              ENEM completo
            </button>
          </div>
        </div>

        <div className="rounded-button border border-outline-variant bg-surface-container-low px-4 py-3 text-caption text-on-surface-variant">
          Simulado por assunto: pendente de fonte oficial de tópicos por questão.
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-label-md font-semibold text-primary">
            <span className="material-symbols-outlined">calendar_today</span>
            Ano do ENEM
          </label>
          <div className="relative">
            <select
              value={config.year}
              onChange={(e) =>
                setConfig((c) => ({ ...c, year: Number(e.target.value) }))
              }
              className="h-14 w-full cursor-pointer appearance-none rounded-button border border-outline-variant bg-surface px-4 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            >
              {exams.map((exam) => (
                <option key={exam.year} value={exam.year}>
                  {exam.title}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-label-md font-semibold text-primary">
            <span className="material-symbols-outlined">category</span>
            Área do conhecimento
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {AREA_OPTIONS.map((area) => {
              const active = config.discipline === area.value;

              return (
                <label
                  key={area.value}
                  className={cn(
                    "cursor-pointer rounded-button border-2 p-4 transition",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant bg-surface hover:border-primary/40",
                  )}
                >
                  <input
                    type="radio"
                    name="discipline"
                    value={area.value}
                    checked={active}
                    onChange={() =>
                      setConfig((c) => ({ ...c, discipline: area.value }))
                    }
                    className="sr-only"
                  />
                  <span className="material-symbols-outlined mb-2 block text-primary">
                    {DISCIPLINE_ICONS[area.value]}
                  </span>
                  <span className="block text-label-md font-semibold text-on-surface">
                    {area.label}
                  </span>
                  <span className="mt-1 block text-caption text-on-surface-variant">
                    {area.description}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-label-md font-semibold text-primary">
              <span className="material-symbols-outlined">format_list_numbered</span>
              Quantidade de questões
            </label>
            <span className="rounded-full bg-secondary-container px-3 py-1 text-label-md font-semibold text-on-secondary-container">
              {config.count}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={config.discipline === "all" ? 180 : 90}
            step={5}
            value={config.count}
            onChange={(e) =>
              setConfig((c) => ({ ...c, count: Number(e.target.value) }))
            }
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between rounded-button border border-outline-variant bg-surface-container-low px-4 py-4">
          <div>
            <p className="text-label-md font-semibold text-on-surface">
              Ativar cronômetro
            </p>
            <p className="text-caption text-on-surface-variant">
              Simula tempo real de prova
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.timed}
            onClick={() => setConfig((c) => ({ ...c, timed: !c.timed }))}
            className={cn(
              "relative h-7 w-12 rounded-full transition",
              config.timed ? "bg-primary" : "bg-outline-variant",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition",
                config.timed && "translate-x-5",
              )}
            />
          </button>
        </div>

        {config.timed && (
          <div className="space-y-2">
            <label className="text-label-md font-semibold text-on-surface">
              Tempo total (minutos)
            </label>
            <input
              type="number"
              min={10}
              max={180}
              value={config.minutes}
              onChange={(e) =>
                setConfig((c) => ({ ...c, minutes: Number(e.target.value) }))
              }
              className="h-14 w-full rounded-button border border-outline-variant bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {error && (
          <p className="rounded-button bg-error-container px-4 py-3 text-body-md text-on-error-container">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={pending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-label-md font-semibold text-on-primary transition hover:bg-primary-container disabled:opacity-60"
        >
          {pending ? "Montando simulado..." : "Iniciar simulado"}
          {!pending && (
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
