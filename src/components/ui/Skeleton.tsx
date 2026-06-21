import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: "text" | "card" | "circle" | "rect";
}

/**
 * @description Component Skeleton
 * @returns {JSX.Element}
 */
export function Skeleton({
  className,
  lines = 1,
  variant = "text",
}: SkeletonProps): JSX.Element {
  const baseClasses =
    "motion-safe:animate-pulse bg-museum-bg-elevated rounded";

  if (variant === "card") {
    return (
      <div
        className={cn(
          baseClasses,
          "w-full h-48 rounded-xl border border-museum-border",
          className,
        )}
        role="status"
        aria-label="Loading content"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={cn(baseClasses, "w-12 h-12 rounded-full", className)}
        role="status"
        aria-label="Loading content"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={cn(baseClasses, "w-full h-24 rounded-lg", className)}
        role="status"
        aria-label="Loading content"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-2"
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            baseClasses,
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full",
            className,
          )}
        />
      ))}
    </div>
  );
}
