import type { Discipline } from "./types";

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  "ciencias-humanas": "Ciências Humanas",
  "ciencias-natureza": "Ciências da Natureza",
  linguagens: "Linguagens",
  matematica: "Matemática",
};

export const DISCIPLINE_ICONS: Record<Discipline | "all", string> = {
  all: "apps",
  "ciencias-humanas": "public",
  "ciencias-natureza": "biotech",
  linguagens: "translate",
  matematica: "calculate",
};

export const AREA_OPTIONS: Array<{
  value: Discipline | "all";
  label: string;
  description: string;
}> = [
  { value: "all", label: "Todas as áreas", description: "Prova completa mista" },
  {
    value: "linguagens",
    label: "Linguagens",
    description: "Códigos e suas tecnologias",
  },
  {
    value: "matematica",
    label: "Matemática",
    description: "Matemática e suas tecnologias",
  },
  {
    value: "ciencias-humanas",
    label: "Humanas",
    description: "Ciências humanas e sociais",
  },
  {
    value: "ciencias-natureza",
    label: "Natureza",
    description: "Ciências da natureza",
  },
];
