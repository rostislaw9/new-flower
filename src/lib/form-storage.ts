/**
 * Locale-aware form state persistence.
 *
 * Saves form state to sessionStorage tagged with the current locale.
 * On mount, restores state ONLY if the stored locale differs from the
 * current locale (i.e. the user switched locales). On a normal page
 * reload or navigation within the same locale, the stored state is
 * cleared and not restored.
 */

interface StoredFormState<T> {
  locale: string;
  data: T;
}

export function saveFormState<T>(key: string, data: T, locale: string): void {
  try {
    const payload: StoredFormState<T> = { locale, data };
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

/**
 * Returns the stored form data if the stored locale differs from the
 * current locale (locale switch). Returns `null` otherwise.
 * Does NOT clear stale data — the caller's save effect will overwrite it.
 */
export function loadFormState<T>(key: string, currentLocale: string): T | null {
  try {
    const saved = sessionStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as StoredFormState<T>;
    if (parsed.locale !== currentLocale) {
      return parsed.data;
    }

    // Same locale — not a locale change, don't restore
    return null;
  } catch {
    return null;
  }
}

export function clearFormState(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}
