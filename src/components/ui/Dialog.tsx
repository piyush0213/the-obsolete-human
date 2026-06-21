'use client';
/**
 * @file Dialog.tsx
 * @description Implements components/ui/Dialog.tsx for The Obsolete Human Museum.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FocusTrap } from '@/components/accessibility/FocusTrap';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/**
 * @description Component Dialog
 * @returns {JSX.Element}
 */
export function Dialog({
  open,
  onClose,
  children,
  title,
  description,
  className,
}: DialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect((): void | (() => void) => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <FocusTrap active={open} onEscape={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby={description ? 'dialog-description' : undefined}
          className={cn(
            'relative z-10 w-full max-w-lg mx-4 rounded-xl border border-museum-border bg-museum-bg-elevated shadow-museum-lg p-6 motion-safe:animate-slide-up',
            className
          )}
        >
          <header className="mb-4">
            <h2
              id="dialog-title"
              className="font-serif text-2xl font-semibold text-museum-text"
            >
              {title}
            </h2>
            {description && (
              <p
                id="dialog-description"
                className="mt-1 text-sm text-museum-text-muted"
              >
                {description}
              </p>
            )}
          </header>

          <div>{children}</div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-museum-text-muted hover:text-museum-text hover:bg-museum-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent"
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </FocusTrap>
    </div>
  );
}
