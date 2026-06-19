"use server";

import { buildSimulado } from "@/lib/enem";
import type { SimuladoConfig } from "@/lib/types";

export async function startSimulado(config: SimuladoConfig) {
  const simulado = await buildSimulado(config);
  return { config, questions: simulado.public };
}
