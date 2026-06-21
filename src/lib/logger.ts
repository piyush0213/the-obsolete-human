/**
 * @file logger.ts
 * @description Implements lib/logger.ts for The Obsolete Human Museum.
 */
/**
 * @description Centralized logger utility for the application to replace direct console calls.
 * This ensures clean production logs and prepares for Sentry/Datadog integration.
 */
export const logger = {
  /**
   * @description Logs informational messages
   * @param message - The message to log
   * @param data - Optional data payload
   * @returns void
   */
  info: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info(message, data || '');
    }
  },

  /**
   * @description Logs warnings
   * @param message - The warning message
   * @param data - Optional data payload
   * @returns void
   */
  warn: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(message, data || '');
    }
  },

  /**
   * @description Logs errors silently in production, or to a reporting service
   * @param message - The error message
   * @param error - The error object
   * @returns void
   */
  error: (message: string, error?: unknown): void => {
    // In a real app, send to Sentry here
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(message, error || '');
    }
  },
};
