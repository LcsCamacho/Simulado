import { NextRequest, NextResponse } from "next/server";
import type { Discipline } from "@/lib/types";

const TOPICS: Record<Discipline, string[]> = {
  linguagens: ["interpretação", "gramática", "literatura"],
  matematica: ["aritmética", "funções", "geometria"],
  "ciencias-humanas": ["história", "geografia", "sociologia"],
  "ciencias-natureza": ["física", "química", "biologia"],
};

export async function GET(request: NextRequest) {
  const discipline = request.nextUrl.searchParams.get("discipline") as
    | Discipline
    | null;
  if (discipline && TOPICS[discipline]) {
    return NextResponse.json({
      discipline,
      topics: TOPICS[discipline],
      source: "fallback-local",
      note: "API pública não fornece tópico oficial por questão.",
    });
  }
  return NextResponse.json({
    all: TOPICS,
    source: "fallback-local",
    note: "API pública não fornece tópico oficial por questão.",
  });
}

