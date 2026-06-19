import dynamic from "next/dynamic";

const SimuladoRunner = dynamic(
  () =>
    import("@/components/SimuladoRunner").then((m) => ({
      default: m.SimuladoRunner,
    })),
  {
    loading: () => (
      <div className="mx-auto max-w-xl rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <p className="text-on-surface-variant">Carregando simulado...</p>
      </div>
    ),
  },
);

export default function ExecutarSimuladoPage() {
  return <SimuladoRunner />;
}
