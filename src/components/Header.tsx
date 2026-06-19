import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-4 sm:px-gutter">
        <Link href="/" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">menu</span>
          <div>
            <p className="text-headline-md font-bold text-primary">
              Simulados ENEM
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-label-md font-semibold text-on-surface-variant md:flex">
          <Link href="/" className="transition hover:text-primary">
            Início
          </Link>
          <Link href="/simulado" className="transition hover:text-primary">
            Simulado
          </Link>
          <Link href="/desempenho" className="transition hover:text-primary">
            Histórico
          </Link>
          <Link href="/caderno" className="transition hover:text-primary">
            Caderno
          </Link>
          <Link href="/conta" className="transition hover:text-primary">
            Conta
          </Link>
          <Link
            href="/simulado"
            className="rounded-full bg-primary px-4 py-2 text-on-primary transition hover:bg-primary-container"
          >
            Novo simulado
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-fixed bg-primary text-sm font-bold text-on-primary">
            EN
          </div>
        </div>
      </div>
    </header>
  );
}
