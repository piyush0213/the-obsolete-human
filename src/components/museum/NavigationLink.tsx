"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationLinkProps {
  href: string;
  label: string;
  ariaLabel: string;
}

/**
 * NavigationLink — Client-side nav link with aria-current="page".
 *
 * Highlights the active route and sets the proper ARIA attribute
 * so screen readers announce the currently active page.
 */
/**
 * @description Component NavigationLink
 * @returns {JSX.Element}
 */
export function NavigationLink({ href, label, ariaLabel }: NavigationLinkProps): JSX.Element {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-sans transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-museum-accent",
        isActive
          ? "text-museum-accent bg-museum-accent/10 border border-museum-accent/20"
          : "text-museum-text-muted hover:text-museum-text hover:bg-museum-bg-elevated",
      )}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
