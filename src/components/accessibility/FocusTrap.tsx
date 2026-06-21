"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FocusTrapProps {
  /** Content rendered inside the trap */
  children: ReactNode;
  /** Whether the focus trap is currently active */
  active: boolean;
  /** Called when the user presses Escape */
  onEscape?: () => void;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([disabled])',
].join(", ");

/**
 * FocusTrap — Constrains keyboard focus to a container.
 *
 * Behaviour:
 * 1. On activation, focus moves to the first focusable child.
 * 2. Tab / Shift-Tab wraps within the container.
 * 3. Escape calls `onEscape` (to close modals).
 * 4. On unmount / deactivation, focus returns to the element
 *    that was focused before the trap activated (the "trigger").
 *
 * Used by Dialog, ConfirmModal, and any overlay that must meet
 * WCAG 2.4.3 (Focus Order) and 2.1.2 (No Keyboard Trap).
 */
/**
 * @description Component FocusTrap
 * @returns {JSX.Element}
 */
export function FocusTrap({ children, active, onEscape }: FocusTrapProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Remember the element that had focus before the trap opened
  useEffect((): void | (() => void) => {
    if (active) {
      triggerRef.current = document.activeElement;
    }
  }, [active]);

  // Restore focus when the trap deactivates or unmounts
  useEffect((): void | (() => void) => {
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Focus first element & set up Tab-wrapping + Escape handling
  useEffect((): void | (() => void) => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    function getFocusableElements(): HTMLElement[] {
      return Array.from(
        container?.querySelectorAll(FOCUSABLE_SELECTORS) ?? [],
      ) as HTMLElement[];
    }

    // Auto-focus the first focusable element
    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable[0]) {
        focusable[0].focus();
      }
    });

    function handleKeyDown(event: KeyboardEvent): void {
      // ─ Escape ─
      if (event.key === "Escape" && onEscape) {
        event.stopPropagation();
        onEscape();
        return;
      }

      // ─ Tab wrapping ─
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);

  return (
    <div ref={containerRef} role="presentation">
      {children}
    </div>
  );
}
