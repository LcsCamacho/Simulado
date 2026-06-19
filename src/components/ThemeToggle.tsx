"use client";

import { useEffect, useState } from "react";
import { getPreferences, setPreferences } from "@/lib/storage";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const next = getPreferences().theme;
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    setPreferences({ ...getPreferences(), theme: next });
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-outline-variant px-3 py-2 text-label-md text-on-surface-variant"
      aria-label="Alternar tema"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}

