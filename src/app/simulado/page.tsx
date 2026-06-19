import { SimuladoSetup } from "@/components/SimuladoSetup";
import { fetchExams } from "@/lib/enem";
import type { SimuladoConfig } from "@/lib/types";

interface SimuladoPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function SimuladoPage({ searchParams }: SimuladoPageProps) {
  const params = await searchParams;
  const exams = await fetchExams();
  const defaultYear = Number(params.year) || exams[0]?.year || 2023;

  const initialConfig: SimuladoConfig = {
    year: defaultYear,
    discipline: "all",
    count: 10,
    timed: false,
    minutes: 30,
    mode: "custom",
  };

  return <SimuladoSetup initialConfig={initialConfig} exams={exams} />;
}
