/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem("theme") as ThemePreference | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch (e) {
    console.error("Error reading theme preference from localStorage", e);
  }
  return "system";
}

export function applyThemeClass(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Derive effective theme: if preference is system, follow systemTheme; otherwise use preference
  const resolvedTheme: ResolvedTheme = preference === "system" ? systemTheme : preference;
  const isDark = resolvedTheme === "dark";

  // Apply .dark class to root
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  // Listen to live system preference changes from the OS
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem("theme", pref);
    } catch (e) {
      console.error("Error saving theme preference to localStorage", e);
    }
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((prev) => {
      let next: ThemePreference = "light";
      if (prev === "system") next = "light";
      else if (prev === "light") next = "dark";
      else if (prev === "dark") next = "system";

      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        console.error("Error saving theme preference to localStorage", e);
      }
      return next;
    });
  }, []);

  return {
    preference,
    resolvedTheme,
    isDark,
    setPreference,
    cyclePreference,
  };
}
