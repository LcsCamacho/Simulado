"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface QuestionImageProps {
  src: string;
  alt: string;
  className?: string;
  zoomable?: boolean;
}

export function QuestionImage({
  src,
  alt,
  className,
  zoomable = true,
}: QuestionImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const closeZoom = useCallback(() => setZoomed(false), []);

  useEffect(() => {
    if (!zoomed) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeZoom();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoomed, closeZoom]);

  const image = (
    <>
      {!loaded && !error && (
        <div
          aria-hidden
          className="min-h-[80px] min-w-[160px] animate-pulse rounded-lg bg-surface-container"
        />
      )}
      {error ? (
        <p className="text-body-sm text-on-surface-variant">
          Não foi possível carregar a imagem.
        </p>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-auto max-w-full rounded-lg",
            !loaded && "absolute opacity-0",
            className,
          )}
        />
      )}
    </>
  );

  if (!zoomable) {
    return <div className="relative w-fit max-w-full">{image}</div>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => loaded && !error && setZoomed(true)}
        disabled={!loaded || error}
        className={cn(
          "group relative block w-fit max-w-full text-left",
          loaded && !error && "cursor-zoom-in",
        )}
        aria-label={alt ? `Ampliar: ${alt}` : "Ampliar imagem"}
      >
        {image}
        {loaded && !error && (
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-inverse-surface/70 p-1.5 text-inverse-on-surface opacity-0 transition group-hover:opacity-100">
            <span className="material-symbols-outlined block text-[18px]">
              zoom_in
            </span>
          </span>
        )}
      </button>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/90 p-4"
          onClick={closeZoom}
          role="dialog"
          aria-modal
          aria-label="Imagem ampliada"
        >
          <button
            type="button"
            onClick={closeZoom}
            className="absolute right-4 top-4 rounded-full bg-surface-container-lowest/20 p-2 text-inverse-on-surface"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
