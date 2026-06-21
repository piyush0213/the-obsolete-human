'use client';
/**
 * @file page.tsx
 * @description Implements app/habitat/page.tsx for The Obsolete Human Museum.
 */

import React from 'react';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { announce } from '@/components/accessibility/ScreenReaderAnnouncer';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MAX_UPLOAD_SIZE_MB } from '@/lib/constants';

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

/**
 * @description Component HabitatPage
 * @returns {JSX.Element}
 */
function HabitatPageComponent(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [narration, setNarration] = useState<string | null>(null);
  const [fieldNote, setFieldNote] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      announce('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      announce('File too large. Maximum size is 5 MB.');
      return;
    }

    setAnalysisState('uploading');
    setNarration(null);
    setFieldNote(null);
    setErrorMessage(null);
    announce('Uploading habitat photograph...');

    const reader = new FileReader();
    reader.onload = (e): void => {
      setPreview(e.target?.result as string);
      setAnalysisState('idle');
      announce('Habitat photograph uploaded. Ready for analysis.');
    };
    reader.onerror = (): void => {
      setAnalysisState('error');
      setErrorMessage('Upload failed. Please try again.');
      announce('Upload failed. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const analyzeHabitat = useCallback(async () => {
    if (!preview) return;

    setAnalysisState('analyzing');
    setErrorMessage(null);
    announce(
      'Analyzing habitat. Dr. Thorne is examining your nesting chamber...'
    );

    try {
      const response = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'habitat',
          userMessage:
            "Analyze this human's living space based on the photograph. Describe what you observe about their nesting chamber, consumer artifacts, and display behaviors.",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error ?? "The museum's AI systems are temporarily unavailable."
        );
      }

      const data = await response.json();
      setNarration(data.data.text);
      setAnalysisState('done');
      announce('Habitat analysis complete. Narration is now available.');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Analysis failed. Please try again.';
      setAnalysisState('error');
      setErrorMessage(message);
      announce(`Analysis failed: ${message}`);
    }
  }, [preview]);

  const generateFieldNote = useCallback(async () => {
    setFieldNote(null);
    announce('Generating field note...');

    try {
      const response = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'field_note',
          userMessage:
            'The human was observed in their natural habitat today. They appeared to be organizing their nesting materials while simultaneously consuming a caffeinated beverage.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate field note.');
      }

      const data = await response.json();
      setFieldNote(data.data.text);
      announce('Field note generated successfully.');
    } catch {
      announce('Failed to generate field note. Please try again.');
    }
  }, []);

  const removePreview = useCallback((): void => {
    setPreview(null);
    setNarration(null);
    setFieldNote(null);
    setAnalysisState('idle');
    setErrorMessage(null);
    announce('Photo removed. Upload area restored.');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── Header ── */}
        <header className="text-center space-y-4">
          <p className="font-mono text-xs text-museum-secondary uppercase tracking-[0.3em]">
            Wing B — Environmental Studies
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-museum-text tracking-tight">
            The Habitat Cam
          </h1>
          <p className="text-museum-text-muted max-w-2xl mx-auto leading-relaxed">
            Upload a photograph of your living space. Our AI narrator will
            analyze your nesting chamber with the detached scientific precision
            of a BBC nature documentary.
          </p>
        </header>

        {/* ── Upload Area ── */}
        <section aria-label="Habitat photograph upload">
          {!preview ? (
            <div
              className={cn(
                'relative w-full min-h-[240px] rounded-xl overflow-hidden border-2 border-dashed transition-colors cursor-pointer',
                isDragging
                  ? 'border-museum-accent bg-museum-accent/10'
                  : 'border-museum-border bg-gradient-to-br from-museum-bg to-museum-bg-elevated'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload a photograph of your habitat. Drag and drop or press Enter to browse files."
              aria-describedby="upload-format-hint"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                id="habitat-upload"
                aria-label="Choose image file for habitat analysis"
                tabIndex={-1}
              />

              {analysisState === 'uploading' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-2 border-museum-accent border-t-transparent',
                      !prefersReducedMotion && 'animate-spin'
                    )}
                    role="status"
                    aria-label="Uploading photograph"
                  >
                    <span className="sr-only">Uploading...</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-12">
                  <div className="w-16 h-16 rounded-full bg-museum-accent/10 border border-museum-accent/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-museum-accent"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-museum-text font-sans">
                      {isDragging
                        ? 'Drop your habitat photo here'
                        : 'Drag and drop a photo of your living space'}
                    </p>
                    <p className="text-xs text-museum-text-muted mt-1">
                      or click to browse files
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Preview ── */
            <div className="relative rounded-xl overflow-hidden border border-museum-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded photograph of your habitat for analysis"
                className="w-full h-auto max-h-[400px] object-cover"
              />
              <button
                type="button"
                onClick={removePreview}
                className="absolute top-3 right-3 p-2 rounded-full bg-museum-bg/80 backdrop-blur text-museum-text-muted hover:text-museum-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent transition-colors"
                aria-label="Remove uploaded photograph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <p
            id="upload-format-hint"
            className="text-[10px] text-museum-text-muted/50 font-mono mt-2"
          >
            Accepted: JPEG, PNG, WebP. Max 5 MB.
          </p>
        </section>

        {/* ── Action Buttons ── */}
        {preview && analysisState !== 'analyzing' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={analyzeHabitat} size="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Analyze Habitat
            </Button>
          </div>
        )}

        {/* ── Loading State ── */}
        {analysisState === 'analyzing' && (
          <div role="status" aria-label="Analyzing habitat">
            <p className="sr-only">Analyzing habitat, please wait.</p>
            <div className="space-y-4">
              <Skeleton variant="text" lines={3} />
              <Skeleton variant="rect" className="h-20" />
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {analysisState === 'error' && errorMessage && (
          <div
            className="p-4 rounded-lg border border-museum-danger/30 bg-museum-danger/10 text-sm text-museum-danger"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* ── AI Narration — Museum Plaque ── */}
        {narration && (
          <figure className="space-y-4">
            <div className="museum-plaque plaque-glow">
              <p className="text-base leading-relaxed">{narration}</p>
            </div>
            <figcaption className="text-center text-[10px] text-museum-text-muted/60 font-mono uppercase tracking-widest">
              Habitat Narration — AI Field Analysis
            </figcaption>
          </figure>
        )}

        {/* ── Generate Field Note ── */}
        {narration && (
          <div className="text-center space-y-4">
            <Button onClick={generateFieldNote} variant="secondary" size="md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Generate Field Note
            </Button>

            {fieldNote && (
              <figure className="mt-4">
                <blockquote className="museum-plaque text-sm">
                  <p>{fieldNote}</p>
                </blockquote>
                <figcaption className="text-center text-[10px] text-museum-text-muted/60 font-mono uppercase tracking-widest mt-3">
                  Field Note — Zoological Observation
                </figcaption>
              </figure>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(HabitatPageComponent);
