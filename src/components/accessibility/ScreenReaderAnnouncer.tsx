"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScreenReaderAnnouncer — ARIA live region for dynamic announcements.
 *
 * Uses `aria-live="polite"` and `aria-atomic="true"` so screen
 * readers announce the full updated text when it changes, without
 * interrupting the user's current task.
 *
 * Other components trigger announcements via the `announce()` helper
 * which dispatches a custom `museum:announce` event on `window`.
 */
export function ScreenReaderAnnouncer() {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleAnnounce(event: CustomEvent<string>) {
      // Clear → re-set forces screen readers to re-read even
      // if the new message is identical to the previous one.
      setMessage("");
      requestAnimationFrame(() => {
        setMessage(event.detail);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(""), 8000);
    }

    window.addEventListener(
      "museum:announce",
      handleAnnounce as EventListener,
    );
    return () => {
      window.removeEventListener(
        "museum:announce",
        handleAnnounce as EventListener,
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="screen-reader-announcer"
    >
      {message}
    </div>
  );
}

/**
 * Trigger a screen reader announcement from anywhere in the app.
 *
 * @example
 *   announce("Specimen classification updated to Endangered");
 *   announce("Upload complete. Image preview now available.");
 */
export function announce(message: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("museum:announce", { detail: message }),
    );
  }
}
