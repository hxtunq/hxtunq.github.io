/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from "react";

export type ThemePreference = "light" | "orange" | "dark" | "sakura" | "system";
export type ResolvedTheme = "light" | "orange" | "dark" | "sakura";

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem("theme") as string | null;
    if (saved === "light" || saved === "orange" || saved === "dark" || saved === "sakura" || saved === "system") {
      return saved as ThemePreference;
    }
    if (saved === "claude") {
      return "orange";
    }
  } catch (e) {
    console.error("Error reading theme preference from localStorage", e);
  }
  return "system";
}

export function applyThemeClass(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "orange", "claude", "sakura");
  if (resolved === "orange") {
    root.classList.add("orange");
  } else if (resolved === "sakura") {
    root.classList.add("sakura");
  } else if (resolved === "dark") {
    root.classList.add("dark");
  }
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Derive effective theme: if preference is system, follow systemTheme; otherwise use preference
  const resolvedTheme: ResolvedTheme = preference === "system" ? systemTheme : preference;
  const isDark = resolvedTheme === "dark";

  // Apply theme classes to root
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
      else if (prev === "light") next = "orange";
      else if (prev === "orange") next = "sakura";
      else if (prev === "sakura") next = "dark";
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
