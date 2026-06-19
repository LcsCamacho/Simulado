import Link from "next/link";
import { ExamYearCard } from "@/components/ExamYearCard";
import { fetchExams } from "@/lib/enem";

export default async function Home() {
  const exams = await fetchExams();
  const latestYear = exams[0]?.year ?? 0;

  return (
    <div>
      <section className="mx-auto mb-16 flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-secondary-container px-4 py-2 text-label-md font-semibold text-on-secondary-container">
          Questões oficiais · grátis
        </div>
        <h1 className="mb-4 text-headline-lg-mobile font-bold text-on-background md:text-headline-lg">
          Simulados ENEM com questões oficiais
        </h1>
        <p className="mb-8 max-w-2xl text-body-lg text-on-surface-variant">
          Monte provas por ano e área, responda no seu ritmo e veja o gabarito
          só no final. Dados via API pública do ENEM.
        </p>
        <Link
          href="/simulado"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-label-md font-semibold text-on-primary transition hover:bg-primary-container"
        >
          Começar agora
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </Link>
      </section>

      <section className="hidden gap-4 md:grid md:grid-cols-3">
        {[
          { label: "Provas", value: exams.length, icon: "description" },
          { label: "Questões", value: "2700+", icon: "quiz" },
          { label: "Grátis", value: "100%", icon: "verified" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6 text-center"
          >
            <span className="material-symbols-outlined mb-2 text-primary">
              {stat.icon}
            </span>
            <p className="text-headline-md font-bold text-on-surface">
              {stat.value}
            </p>
            <p className="text-caption text-on-surface-variant">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-md font-bold text-on-background">
              Provas disponíveis
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Escolha o ano e inicie seu simulado
            </p>
          </div>
          <a
            href="https://enem.dev"
            className="hidden text-label-md font-semibold text-primary hover:underline sm:block"
            target="_blank"
            rel="noreferrer"
          >
            API ENEM
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamYearCard
              key={exam.year}
              exam={exam}
              latestYear={latestYear}
            />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-card bg-primary-container p-8 text-center text-on-primary-container md:text-left">
        <h3 className="text-headline-md font-bold">Simulado personalizado</h3>
        <p className="mt-2 text-body-md opacity-90">
          Escolha área, quantidade de questões e ative o cronômetro.
        </p>
        <Link
          href="/simulado"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-6 py-3 text-label-md font-semibold text-primary"
        >
          Configurar simulado
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </Link>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-5">
          <p className="text-label-md font-semibold text-on-surface">
            Caderno de erros
          </p>
          <p className="mt-1 text-caption text-on-surface-variant">
            Salve questões erradas e refaça depois.
          </p>
          <Link href="/caderno" className="mt-3 inline-block text-primary">
            Abrir caderno
          </Link>
        </article>
        <article className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-5">
          <p className="text-label-md font-semibold text-on-surface">Histórico</p>
          <p className="mt-1 text-caption text-on-surface-variant">
            Compare tentativas e evolução por área.
          </p>
          <Link href="/desempenho" className="mt-3 inline-block text-primary">
            Ver evolução
          </Link>
        </article>
        <article className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-5">
          <p className="text-label-md font-semibold text-on-surface">Modo prova</p>
          <p className="mt-1 text-caption text-on-surface-variant">
            Use presets de prova completa com cronômetro.
          </p>
          <Link href="/simulado" className="mt-3 inline-block text-primary">
            Começar
          </Link>
        </article>
      </section>
    </div>
  );
}
