export default function ContaPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-card border border-outline-variant/30 bg-surface-container-lowest p-6">
      <h1 className="text-headline-md font-bold text-on-background">Conta</h1>
      <p className="text-body-md text-on-surface-variant">
        Etapa avançada: sincronização entre dispositivos.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-body-md text-on-surface">
        <li>Token guest disponível em `/api/auth/guest`</li>
        <li>Persistência atual: localStorage</li>
        <li>Próximo passo: backend + autenticação real</li>
      </ul>
    </div>
  );
}

