'use client';
/**
 * @file HabitatCam.tsx
 * @description Implements components/museum/HabitatCam.tsx for The Obsolete Human Museum.
 */

import React from 'react';

import { useState, useRef, useCallback } from 'react';
import type { HabitatData } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ConservationStatus } from '@/components/museum/ConservationStatus';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { announce } from '@/components/accessibility/ScreenReaderAnnouncer';
import { cn } from '@/lib/utils';

// Re-export for backward compatibility
export { SAMPLE_HABITATS } from '@/lib/habitats';

interface HabitatCamProps {
  habitat: HabitatData;
  className?: string;
}

/**
 * HabitatCam — Reconstructed habitat display with optional photo upload.
 *
 * Accessibility:
 * - File input has associated label via htmlFor
 * - Drag-and-drop is keyboard operable (Enter/Space opens file picker)
 * - Upload state changes are announced to screen readers
 * - Preview image has descriptive alt text
 * - Upload button has aria-describedby for format instructions
 * - Environmental data grouped with role="group"
 */
/**
 * @description Component HabitatCam
 * @returns {JSX.Element}
 */
function HabitatCamComponent({
  habitat,
  className,
}: HabitatCamProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'loading' | 'done'>(
    'idle'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatHintId = `upload-format-hint-${habitat.id}`;

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        announce('Invalid file type. Please upload a JPEG or PNG image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        announce('File too large. Maximum size is 5 MB.');
        return;
      }

      setUploadState('loading');
      announce('Uploading habitat photograph...');

      const reader = new FileReader();
      reader.onload = (e): void => {
        setPreview(e.target?.result as string);
        setUploadState('done');
        announce(
          `Habitat photograph uploaded for ${habitat.name}. Preview now available.`
        );
      };
      reader.onerror = (): void => {
        setUploadState('idle');
        announce('Upload failed. Please try again.');
      };
      reader.readAsDataURL(file);
    },
    [habitat.name]
  );

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

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{habitat.name}</CardTitle>
            <p className="font-mono text-xs text-museum-accent mt-1">
              {habitat.biome}
            </p>
          </div>
          <ConservationStatus status={habitat.threatLevel} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Upload / Preview area ── */}
        {!preview ? (
          <div
            className={cn(
              'relative w-full h-36 rounded-lg overflow-hidden border-2 border-dashed transition-colors cursor-pointer',
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
            aria-label={`Upload a photograph of ${habitat.name}. Drag and drop or press Enter to browse files.`}
            aria-describedby={formatHintId}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              id={`upload-${habitat.id}`}
              aria-label={`Choose image file for ${habitat.name}`}
              tabIndex={-1}
            />

            {uploadState === 'loading' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 border-museum-accent border-t-transparent',
                    !prefersReducedMotion && 'animate-spin'
                  )}
                  role="status"
                  aria-label="Uploading photograph"
                >
                  <span className="sr-only">Uploading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Ambient particles */}
                <div
                  className={cn(
                    'absolute inset-0',
                    !prefersReducedMotion && 'animate-pulse-slow'
                  )}
                  aria-hidden="true"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-museum-accent/30"
                      style={{
                        left: `${(i * 8.3 + 5) % 100}%`,
                        top: `${(i * 13.7 + 10) % 100}%`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Upload prompt */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-museum-text-muted/60"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-xs text-museum-text-muted/60 font-mono">
                    {isDragging ? 'Drop image here' : 'Upload habitat photo'}
                  </p>
                </div>

                {/* Camera indicator */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full bg-museum-danger',
                      !prefersReducedMotion && 'animate-pulse'
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[9px] text-museum-text-muted/60 uppercase tracking-widest">
                    Live Feed — Reconstruction
                  </span>
                </div>

                {/* Coordinates */}
                <div
                  className="absolute bottom-2 right-2 font-mono text-[9px] text-museum-text-muted/40"
                  aria-hidden="true"
                >
                  {habitat.coordinates.lat.toFixed(4)}°N,{' '}
                  {habitat.coordinates.lng.toFixed(4)}°W
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── Preview ── */
          <div className="relative w-full h-36 rounded-lg overflow-hidden border border-museum-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`Uploaded photograph of the ${habitat.name} habitat reconstruction in the ${habitat.biome} biome`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setUploadState('idle');
                announce('Photo removed. Upload area restored.');
              }}
              className="
                absolute top-2 right-2 p-1.5 rounded-full
                bg-museum-bg/80 backdrop-blur
                text-museum-text-muted hover:text-museum-danger
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-museum-accent
                transition-colors
              "
              aria-label="Remove uploaded photograph"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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

        {/* Format hint (always present for aria-describedby) */}
        <p
          id={formatHintId}
          className="text-[10px] text-museum-text-muted/50 font-mono"
        >
          Accepted: JPEG, PNG, WebP. Max 5 MB.
        </p>

        {/* Description */}
        <p className="text-sm text-museum-text-muted leading-relaxed">
          {habitat.description}
        </p>

        {/* ── Environmental readings ── */}
        <div
          className="grid grid-cols-3 gap-3"
          role="group"
          aria-label="Environmental readings"
        >
          <div className="text-center p-3 rounded-lg bg-museum-bg/50 border border-museum-border">
            <p className="font-mono text-lg text-museum-text">
              {habitat.temperature}°C
            </p>
            <p className="text-[10px] text-museum-text-muted uppercase tracking-wider mt-1">
              Temperature
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-museum-bg/50 border border-museum-border">
            <p className="font-mono text-lg text-museum-text">
              {habitat.humidity}%
            </p>
            <p className="text-[10px] text-museum-text-muted uppercase tracking-wider mt-1">
              Humidity
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-museum-bg/50 border border-museum-border">
            <p className="font-mono text-lg text-museum-text">
              {habitat.biodiversityIndex.toFixed(2)}
            </p>
            <p className="text-[10px] text-museum-text-muted uppercase tracking-wider mt-1">
              Biodiversity
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const HabitatCam = React.memo(HabitatCamComponent);
