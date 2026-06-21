"use client";

import type { ConservationStatus as ConservationStatusType } from "@/types";
import { CONSERVATION_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ConservationStatusProps {
  status: ConservationStatusType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * ConservationStatus — Visual indicator for a specimen's threat level.
 *
 * WCAG compliance: Does NOT rely on colour alone.
 * Every status includes:
 *  1. A colour-coded dot (decorative)
 *  2. An icon symbol (⬤ ◉ ◈ ◇ etc.)
 *  3. A text label
 *  4. An `aria-label` with the full status description
 *
 * Status changes are surfaced to screen readers via `role="status"`.
 */

const STATUS_ICONS: Record<ConservationStatusType, string> = {
  EXTINCT: "✕",
  CRITICALLY_ENDANGERED: "‼",
  ENDANGERED: "!",
  VULNERABLE: "▲",
  NEAR_THREATENED: "◆",
  LEAST_CONCERN: "●",
};

export function ConservationStatus({
  status,
  size = "md",
  showLabel = true,
  className,
}: ConservationStatusProps) {
  const config = CONSERVATION_STATUS_CONFIG[status];
  const icon = STATUS_ICONS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider border",
        config.bgColor,
        config.color,
        {
          "px-2 py-0.5 text-[9px]": size === "sm",
          "px-3 py-1 text-[10px]": size === "md",
          "px-4 py-1.5 text-xs": size === "lg",
        },
        className,
      )}
      role="status"
      aria-label={`Conservation status: ${config.label}. ${config.description}`}
    >
      {/* Icon — not decorative, provides a non-colour signal */}
      <span
        className={cn("font-bold leading-none", {
          "text-[8px]": size === "sm",
          "text-[10px]": size === "md",
          "text-xs": size === "lg",
        })}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Colour dot — purely decorative */}
      <span
        className={cn(
          "rounded-full",
          config.color === "text-museum-danger"
            ? "bg-museum-danger"
            : "bg-current",
          {
            "w-1.5 h-1.5": size === "sm",
            "w-2 h-2": size === "md",
            "w-2.5 h-2.5": size === "lg",
          },
        )}
        aria-hidden="true"
      />

      {/* Text label — always present for screen readers */}
      {showLabel ? (
        config.label
      ) : (
        <span className="sr-only">{config.label}</span>
      )}
    </span>
  );
}
