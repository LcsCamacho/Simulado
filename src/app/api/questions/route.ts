import { NextRequest, NextResponse } from "next/server";
import { buildSimulado } from "@/lib/enem";
import type { Discipline, SimuladoConfig } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SimuladoConfig>;

    const year = Number(body.year);
    const count = Number(body.count ?? 10);
    const discipline = (body.discipline ?? "all") as Discipline | "all";
    const timed = Boolean(body.timed);
    const minutes = Number(body.minutes ?? 30);

    if (!year || count < 1 || count > 180) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const config: SimuladoConfig = { year, discipline, count, timed, minutes };
    const simulado = await buildSimulado(config);

    return NextResponse.json({
      config,
      questions: simulado.public,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao montar simulado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
