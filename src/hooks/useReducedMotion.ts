"use client";

import { useState, useEffect } from "react";

/**
 * useReducedMotion — Detects the `prefers-reduced-motion` media query.
 *
 * Returns `true` when the user has requested reduced motion in their
 * OS settings, enabling components to disable or scale-down animations.
 *
 * Uses `false` as the initial SSR-safe default (animations enabled)
 * and hydrates to the real value in a layout effect on mount.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
