'use client';
/**
 * @file useReducedMotion.ts
 * @description Implements hooks/useReducedMotion.ts for The Obsolete Human Museum.
 */

import { useState, useEffect } from 'react';

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

  useEffect((): void | (() => void) => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
