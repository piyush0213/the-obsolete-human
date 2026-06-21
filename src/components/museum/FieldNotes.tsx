"use client";

import { useState } from "react";
import type { FieldNote } from "@/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useFieldNotes } from "@/hooks/useFieldNotes";
import { formatMuseumDate, truncateText } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FieldNotesProps {
  specimenId: string;
  initialNotes?: FieldNote[];
}

const CLASSIFICATION_OPTIONS = [
  { value: "OBSERVATION", label: "Observation" },
  { value: "HYPOTHESIS", label: "Hypothesis" },
  { value: "CONCLUSION", label: "Conclusion" },
] as const;

const SEVERITY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  OBSERVATION: {
    bg: "bg-museum-secondary/20",
    text: "text-museum-secondary",
    icon: "◉",
  },
  HYPOTHESIS: {
    bg: "bg-museum-accent/20",
    text: "text-museum-accent",
    icon: "◈",
  },
  CONCLUSION: {
    bg: "bg-museum-primary/20",
    text: "text-museum-text",
    icon: "◆",
  },
};

/**
 * FieldNotes — Chronological journal of curator observations.
 *
 * Accessibility:
 * - Note list uses `role="log"` for chronological content
 * - Each entry is a `<li>` with `role="listitem"` and a descriptive `aria-label`
 * - Timestamps use `<time>` with machine-readable `dateTime`
 * - Classification icons are purely decorative (aria-hidden)
 * - Error messages use `role="alert"` for immediate announcement
 */
/**
 * @description Component FieldNotes
 * @returns {JSX.Element}
 */
export function FieldNotes({ specimenId, initialNotes = [] }: FieldNotesProps): JSX.Element {
  const { notes, error, addNote, removeNote, clearError } =
    useFieldNotes(initialNotes);
  const [content, setContent] = useState("");
  const [classification, setClassification] =
    useState<FieldNote["classification"]>("OBSERVATION");

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const success = addNote(specimenId, content, classification);
    if (success) {
      setContent("");
    }
  };

  return (
    <section aria-labelledby="field-notes-heading" className="space-y-6">
      <header>
        <h3
          id="field-notes-heading"
          className="font-serif text-xl text-museum-text flex items-center gap-2"
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
            className="text-museum-accent"
            aria-hidden="true"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Field Notes
        </h3>
        <p className="text-sm text-museum-text-muted mt-1">
          Record your observations on this behavioral specimen.
        </p>
      </header>

      {/* ── Entry form ── */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="field-note-content" className="sr-only">
            Field note content
          </label>
          <textarea
            id="field-note-content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) clearError();
            }}
            placeholder="Describe your observations of this specimen in the field..."
            rows={4}
            maxLength={2000}
            className="
              w-full rounded-lg border border-museum-border
              bg-museum-bg px-4 py-3
              font-sans text-sm text-museum-text
              placeholder:text-museum-text-muted/50
              transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-museum-accent
              focus-visible:ring-offset-1 focus-visible:ring-offset-museum-bg
              resize-none
            "
            aria-label="Write your field note observation"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "field-note-error" : undefined}
          />
          <p
            className="text-xs text-museum-text-muted mt-1 text-right font-mono"
            aria-live="off"
          >
            {content.length} / 2000
          </p>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              label="Classification"
              options={[...CLASSIFICATION_OPTIONS]}
              value={classification}
              onChange={(e) =>
                setClassification(
                  e.target.value as FieldNote["classification"],
                )
              }
              aria-label="Note classification type"
            />
          </div>
          <Button type="submit" size="md" aria-label="Submit field note">
            Record Note
          </Button>
        </div>

        {error && (
          <p
            id="field-note-error"
            className="text-sm text-museum-danger"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>

      {/* ── Chronological note log ── */}
      <ol
        role="log"
        aria-label="Field notes journal"
        className="space-y-3"
      >
        {notes.length === 0 && (
          <li className="text-sm text-museum-text-muted italic text-center py-8">
            No field notes recorded for this specimen. Be the first researcher
            to document your observations.
          </li>
        )}
        {notes.map((note) => {
          const dateFormatted = formatMuseumDate(note.date);
          const truncated = truncateText(note.content, 80);
          const style = SEVERITY_STYLES[note.classification] ?? SEVERITY_STYLES.OBSERVATION!;

          return (
            <li
              key={note.id}
              className="p-4 rounded-lg border border-museum-border bg-museum-bg/50 space-y-2"
              aria-label={`Field note from ${dateFormatted}: ${truncated}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Classification icon (decorative) */}
                  <span aria-hidden="true" className={cn("text-sm", style.text)}>
                    {style.icon}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border",
                      style.bg,
                      style.text,
                      `border-current/30`,
                    )}
                  >
                    {note.classification}
                  </span>
                  <time
                    dateTime={note.date}
                    className="text-xs text-museum-text-muted font-mono"
                  >
                    {dateFormatted}
                  </time>
                </div>
                <button
                  onClick={() => removeNote(note.id)}
                  className="
                    p-1 rounded
                    text-museum-text-muted/50 hover:text-museum-danger
                    transition-colors
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-museum-accent
                  "
                  aria-label={`Delete field note from ${dateFormatted}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
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
              <p className="text-sm text-museum-text leading-relaxed">
                {note.content}
              </p>
              <p className="text-xs text-museum-text-muted">
                — {note.author}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
