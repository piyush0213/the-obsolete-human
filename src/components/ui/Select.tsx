import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: readonly SelectOption[];
  error?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, options, error, placeholder, id, ...props },
    ref,
  ) => {
    const selectId =
      id ?? `select-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-sans font-medium text-museum-text-muted"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className={cn(
            "h-10 w-full rounded-lg border bg-museum-bg px-4 py-2 font-sans text-sm text-museum-text transition-colors duration-200 appearance-none cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent focus-visible:ring-offset-1 focus-visible:ring-offset-museum-bg",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-museum-danger"
              : "border-museum-border hover:border-museum-border-hover",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-xs text-museum-danger font-sans" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
