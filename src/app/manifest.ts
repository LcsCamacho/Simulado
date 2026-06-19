import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Simulados ENEM",
    short_name: "Simulados",
    description: "Simulados ENEM com histórico, caderno de erros e modo prova.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9ff",
    theme_color: "#006948",
    lang: "pt-BR",
  };
}

