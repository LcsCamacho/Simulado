import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title?: string;
    correct?: string;
    selected?: string | null;
  };

  if (!body.title || !body.correct) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const selectedLabel = body.selected ? body.selected : "pulada";
  return NextResponse.json({
    explanation:
      `Questão: ${body.title}. ` +
      `Você marcou ${selectedLabel} e o gabarito é ${body.correct}. ` +
      "Revise o enunciado, elimine alternativas incompatíveis e valide unidades/termos-chave.",
    source: "heuristic-template",
  });
}

