import { NextRequest, NextResponse } from "next/server";
import { estimateTri } from "@/lib/enem";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { correct?: number; total?: number };
  const correct = Number(body.correct ?? 0);
  const total = Number(body.total ?? 0);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  return NextResponse.json({ triScore: estimateTri(correct, total) });
}

