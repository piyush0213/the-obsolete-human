import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent focus-visible:ring-offset-2 focus-visible:ring-offset-museum-bg disabled:pointer-events-none disabled:opacity-50",
          "motion-safe:active:scale-[0.98]",
          {
            "bg-museum-accent text-museum-bg hover:bg-museum-accent-hover shadow-accent-glow":
              variant === "default",
            "bg-museum-secondary/20 text-museum-secondary hover:bg-museum-secondary/30 border border-museum-secondary/30":
              variant === "secondary",
            "bg-museum-danger/20 text-museum-danger hover:bg-museum-danger/30 border border-museum-danger/30":
              variant === "danger",
            "bg-transparent text-museum-text hover:bg-museum-bg-elevated":
              variant === "ghost",
            "bg-transparent text-museum-accent border border-museum-border hover:border-museum-border-hover hover:bg-museum-accent/5":
              variant === "outline",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-5 text-sm": size === "md",
            "h-12 px-8 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
