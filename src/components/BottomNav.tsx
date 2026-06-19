"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/simulado", label: "Simulado", icon: "edit_note" },
  { href: "/desempenho", label: "Histórico", icon: "analytics" },
  { href: "/caderno", label: "Erros", icon: "menu_book" },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/simulado/executar")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface-container-lowest md:hidden">
      <div className="mx-auto flex max-w-container-max items-center justify-around px-4 py-2">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 text-caption transition ${
                active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {link.icon}
              </span>
              <span className="text-xs font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
