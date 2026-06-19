"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DISCIPLINE_LABELS } from "@/lib/disciplines";
import { prefetchQuestionImages } from "@/lib/question-images";
import { toDayKey } from "@/lib/progress";
import {
  addSolvedQuestions,
  clearActiveSession,
  getActiveSession,
  getPreferences,
  pushHistory,
  setActiveSession,
  setLatestResult,
  setPreferences,
  upsertNotebook,
} from "@/lib/storage";
import type { PublicQuestion, SimuladoConfig, SimuladoSession } from "@/lib/types";
import { QuestionCard, Timer } from "./QuestionCard";
import { QuestionMap } from "./QuestionMap";

interface SimuladoBootstrap {
  config: SimuladoConfig;
  questions: PublicQuestion[];
}

export function SimuladoRunner() {
  const router = useRouter();
  const [session, setSession] = useState<SimuladoBootstrap | null>(null);
  const [ready, setReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | null | undefined>
  >({});
  const [questionTimeSec, setQuestionTimeSec] = useState<Record<string, number>>(
    {},
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [fontScale, setFontScale] = useState<0.95 | 1 | 1.1>(1);
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const prefs = getPreferences();
    setFocusMode(prefs.focusMode);
    setFontScale(prefs.fontScale);

    const active = getActiveSession();
    if (active) {
      setSession({ config: active.config, questions: active.questions });
      setCurrentIndex(active.currentIndex);
      setAnswers(active.answers);
      setQuestionTimeSec(active.questionTimeSec);
      setRemainingSeconds(active.remainingSeconds);
      setPaused(active.paused);
      setStartedAt(active.startedAt);
      setReady(true);
      return;
    }

    const raw = sessionStorage.getItem("simulado-session");
    const parsed = raw ? (JSON.parse(raw) as SimuladoBootstrap) : null;
    if (!parsed) {
      setReady(true);
      return;
    }
    setSession(parsed);
    setRemainingSeconds(parsed.config.timed ? parsed.config.minutes * 60 : null);
    setStartedAt(new Date().toISOString());
    setReady(true);
  }, []);

  const config = session?.config;
  const questions = session?.questions ?? [];
  const current = questions[currentIndex];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  useEffect(() => {
    prefetchQuestionImages(questions[currentIndex]);
    prefetchQuestionImages(questions[currentIndex + 1]);
  }, [currentIndex, questions]);

  useEffect(() => {
    if (!questions.length || !config) return;
    const persisted: SimuladoSession = {
      config,
      questions,
      answers,
      questionTimeSec,
      currentIndex,
      startedAt,
      updatedAt: new Date().toISOString(),
      remainingSeconds,
      paused,
    };
    setActiveSession(persisted);
  }, [
    config,
    questions,
    answers,
    questionTimeSec,
    currentIndex,
    startedAt,
    remainingSeconds,
    paused,
  ]);

  useEffect(() => {
    if (!current || paused || submitting) return;
    const id = window.setInterval(() => {
      setQuestionTimeSec((prev) => ({
        ...prev,
        [current.id]: (prev[current.id] ?? 0) + 1,
      }));
      if (config?.timed) {
        setRemainingSeconds((prev) => {
          if (prev === null) return null;
          return Math.max(0, prev - 1);
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [current, config?.timed, paused, submitting]);

  useEffect(() => {
    if (!current) return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (event.key === "ArrowRight" && currentIndex < questions.length - 1) {
        setCurrentIndex((idx) => idx + 1);
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((idx) => idx - 1);
      }

      const letter = event.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(letter)) {
        setAnswers((prev) => ({ ...prev, [current.id]: letter }));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, currentIndex, questions.length]);

  const finishSimulado = useCallback(async () => {
    if (!config) return;
    setSubmitting(true);
    setPaused(true);

    try {
      const payload = {
        year: config.year,
        answers: questions.map((q) => ({
          id: q.id,
          selected: answers[q.id] ?? null,
        })),
        questionTimeSec,
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Erro ao corrigir");
      setLatestResult(result);
      pushHistory(result);
      addSolvedQuestions(toDayKey(new Date()), result.total);
      upsertNotebook(
        result.questions
          .filter((q: { isCorrect: boolean }) => !q.isCorrect)
          .map(
            (q: {
              id: string;
              question: PublicQuestion;
              selected: string | null;
              correct: string;
            }) => ({
              id: q.id,
              question: q.question,
              selected: q.selected,
              correct: q.correct,
              year: config.year,
              savedAt: new Date().toISOString(),
              lastAttemptId: result.id,
            }),
          ),
      );
      sessionStorage.removeItem("simulado-session");
      clearActiveSession();
      router.push("/resultado");
    } catch {
      setSubmitting(false);
      setPaused(false);
    }
  }, [config, questions, answers, questionTimeSec, router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <p className="text-on-surface-variant">Carregando simulado...</p>
      </div>
    );
  }

  if (!session || !config || !questions.length) {
    return (
      <div className="mx-auto max-w-xl rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <p className="text-on-surface-variant">Nenhum simulado em andamento.</p>
        <button
          type="button"
          onClick={() => router.push("/simulado")}
          className="mt-4 rounded-full bg-primary px-6 py-3 text-on-primary"
        >
          Configurar simulado
        </button>
      </div>
    );
  }

  const selected = current ? answers[current.id] : undefined;

  function skipQuestion() {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: null }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }
  const disciplineLabel =
    config.discipline === "all"
      ? "Todas as áreas"
      : DISCIPLINE_LABELS[config.discipline];
  const answeredCount = Object.values(answers).filter((value) => value).length;
  const skippedCount = Object.values(answers).filter((value) => value === null).length;

  return (
    <div
      className="mx-auto max-w-[800px] pb-24"
      style={{ fontSize: `${fontScale}em` }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wider text-primary">
            {disciplineLabel}
          </p>
          <h1 className="text-headline-md font-bold text-on-surface">
            ENEM {config.year}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !focusMode;
              setFocusMode(next);
              setPreferences({ ...getPreferences(), focusMode: next });
            }}
            className="rounded-full border border-outline-variant px-3 py-2 text-label-md text-on-surface-variant"
          >
            {focusMode ? "Sair foco" : "Modo foco"}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = fontScale === 0.95 ? 1 : fontScale === 1 ? 1.1 : 0.95;
              setFontScale(next);
              setPreferences({ ...getPreferences(), fontScale: next });
            }}
            className="rounded-full border border-outline-variant px-3 py-2 text-label-md text-on-surface-variant"
          >
            Fonte
          </button>
        </div>
        {config.timed && remainingSeconds !== null && (
          <Timer
            secondsLeft={remainingSeconds}
            paused={paused}
            onTogglePause={() => setPaused((prev) => !prev)}
            onExpire={finishSimulado}
          />
        )}
      </div>

      {!focusMode && (
        <>
          <div className="mb-2 flex items-center justify-between text-label-md text-on-surface-variant">
            <span>
              Questão {currentIndex + 1} de {questions.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar mb-3">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="mb-6 flex items-center gap-4 text-caption text-on-surface-variant">
            <span>Respondidas: {answeredCount}</span>
            <span>Puladas: {skippedCount}</span>
          </div>
          <QuestionMap
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onJump={setCurrentIndex}
          />
        </>
      )}

      {current && (
        <QuestionCard
          question={current}
          selected={selected}
          onSelect={(letter) =>
            setAnswers((prev) => ({ ...prev, [current.id]: letter }))
          }
          onSkip={skipQuestion}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-3 px-4 py-4">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="rounded-full border-2 border-primary px-5 py-3 text-label-md font-semibold text-primary disabled:opacity-40"
          >
            Anterior
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
              className="rounded-full bg-primary px-6 py-3 text-label-md font-semibold text-on-primary"
            >
              Próxima
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void finishSimulado()}
              className="rounded-full bg-primary px-6 py-3 text-label-md font-semibold text-on-primary disabled:opacity-60"
            >
              {submitting ? "Corrigindo..." : "Finalizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
