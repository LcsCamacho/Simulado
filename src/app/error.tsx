"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-card border border-outline-variant bg-surface-container-lowest p-8 text-center">
      <p className="text-on-surface-variant">
        Não foi possível carregar esta página.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-primary px-6 py-3 text-on-primary"
      >
        Tentar novamente
      </button>
    </div>
  );
}
