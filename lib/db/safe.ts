/**
 * Safe DB wrappers — never throw at request time when the database
 * is unreachable (e.g. before env vars are configured). Logs and
 * returns the supplied fallback so SSR pages keep rendering.
 */
export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
  label = "db"
): Promise<T> {
  try {
    if (!process.env.DATABASE_URL) return fallback;
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[${label}] query failed, returning fallback:`, err);
    }
    return fallback;
  }
}
