/* ============================================================
   ResearchFlow AI — Utility Functions
   ============================================================
   Add pure utility functions here.
   Example: cn(), formatDate(), debounce(), etc.
   ============================================================ */

/**
 * Conditionally join class names.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
