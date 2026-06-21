'use client';
/**
 * @file useFieldNotes.ts
 * @description Implements hooks/useFieldNotes.ts for The Obsolete Human Museum.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { FieldNote, FieldNoteEntry } from '@/types';
import { sanitizeText } from '@/lib/sanitizers';

// ─── localStorage helpers (SSR-safe) ────────────────────────

const STORAGE_KEY_PREFIX = 'the-obsolete-human:field-notes:';

function loadNotes(specimenId: string): FieldNoteEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + specimenId);
    return raw ? (JSON.parse(raw) as FieldNoteEntry[]) : [];
  } catch {
    return [];
  }
}

function saveNotes(specimenId: string, notes: FieldNoteEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY_PREFIX + specimenId,
      JSON.stringify(notes)
    );
  } catch {
    // localStorage full — silently degrade
  }
}

// ─── Auto-generated daily observations ──────────────────────

const DAILY_OBSERVATIONS: readonly string[] = [
  'Specimen observed engaging in repetitive digital scrolling behavior. Duration exceeded expected thresholds.',
  'Energy consumption patterns suggest continued reliance on legacy infrastructure. Adaptation rate: minimal.',
  'Notable deviation in dietary procurement — specimen briefly considered a plant-based alternative before reverting.',
  'Transport emissions logged. Subject appeared unaware of the carbon signature trailing behind their vehicle.',
  'Specimen displayed acute anxiety when separated from personal electronics for more than 90 seconds.',
  'Housing temperature control set well beyond comfort requirements. AC unit compensating for poor insulation.',
  'Delivery drone arrival triggered a brief dopamine response. Contents: another item already owned in triplicate.',
  "Subject replaced a fully functional device with an incrementally improved model. Reason cited: 'the color.'",
];

function generateDailyNote(specimenId: string): FieldNoteEntry {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index =
    (dayOfYear + specimenId.charCodeAt(0)) % DAILY_OBSERVATIONS.length;

  return {
    id: `auto-${specimenId}-${dayOfYear}`,
    date: new Date().toISOString(),
    content: DAILY_OBSERVATIONS[index]!,
    severity:
      dayOfYear % 7 === 0
        ? 'critical'
        : dayOfYear % 3 === 0
          ? 'concern'
          : 'observation',
  };
}

// ─── Hook: useFieldNotes (new, localStorage-based) ─────────

/**
 * @description Custom hook usePersistedFieldNotes
 * @returns {any}
 */
export function usePersistedFieldNotes(specimenId: string): {
  notes: FieldNoteEntry[];
  isLoading: boolean;
  addNote: (content: string, severity?: FieldNoteEntry['severity']) => boolean;
  removeNote: (noteId: string) => void;
} {
  const [notes, setNotes] = useState<FieldNoteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasHydrated = useRef(false);

  // Hydrate from localStorage + inject daily note
  useEffect((): void | (() => void) => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const stored = loadNotes(specimenId);
    const dailyNote = generateDailyNote(specimenId);

    // Only add the daily note if it doesn't already exist
    const hasTodaysNote = stored.some((n) => n.id === dailyNote.id);
    const combined = hasTodaysNote ? stored : [dailyNote, ...stored];

    if (!hasTodaysNote) {
      saveNotes(specimenId, combined);
    }

    setNotes(combined);
    setIsLoading(false);
  }, [specimenId]);

  const addNote = useCallback(
    (content: string, severity: FieldNoteEntry['severity'] = 'observation') => {
      const sanitized = sanitizeText(content);
      if (sanitized.length < 10) return false;

      const entry: FieldNoteEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        content: sanitized,
        severity,
      };

      setNotes((prev) => {
        const updated = [entry, ...prev];
        saveNotes(specimenId, updated);
        return updated;
      });
      return true;
    },
    [specimenId]
  );

  const removeNote = useCallback(
    (noteId: string) => {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== noteId);
        saveNotes(specimenId, updated);
        return updated;
      });
    },
    [specimenId]
  );

  return { notes, isLoading, addNote, removeNote };
}

// ─── Hook: useFieldNotes (legacy, in-memory) ───────────────
// Used by existing gallery FieldNotes component.

/**
 * @description Custom hook useFieldNotes
 * @returns {any}
 */
export function useFieldNotes(initialNotes: FieldNote[] = []): {
  notes: FieldNote[];
  isSubmitting: boolean;
  error: string | null;
  addNote: (
    specimenId: string,
    content: string,
    classification: FieldNote['classification']
  ) => boolean;
  removeNote: (noteId: string) => void;
  clearError: () => void;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
} {
  const [notes, setNotes] = useState<FieldNote[]>(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNote = useCallback(
    (
      specimenId: string,
      content: string,
      classification: FieldNote['classification']
    ) => {
      setError(null);
      const sanitizedContent = sanitizeText(content);

      if (sanitizedContent.length < 10) {
        setError('Field note must be at least 10 characters.');
        return false;
      }

      if (sanitizedContent.length > 2000) {
        setError('Field note must not exceed 2000 characters.');
        return false;
      }

      const newNote: FieldNote = {
        id: crypto.randomUUID(),
        specimenId,
        author: 'Field Researcher',
        date: new Date().toISOString(),
        content: sanitizedContent,
        classification,
      };

      setNotes((prev) => [newNote, ...prev]);
      return true;
    },
    []
  );

  const removeNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notes,
    isSubmitting,
    error,
    addNote,
    removeNote,
    clearError,
    setIsSubmitting,
  };
}
