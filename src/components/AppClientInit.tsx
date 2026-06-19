"use client";

import { useEffect } from "react";
import { getPreferences } from "@/lib/storage";

export function AppClientInit() {
  useEffect(() => {
    const prefs = getPreferences();
    document.documentElement.dataset.theme = prefs.theme;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}

