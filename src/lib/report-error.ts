/** Central place to report unexpected UI errors. Swap console for Sentry etc. if you want. */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[duwelfare]", error, context);
}
