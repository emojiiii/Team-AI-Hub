import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Simple localStorage-backed state hook.
 * Each key is independent — use workspace-scoped keys for per-workspace state.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Cache the parsed value to maintain referential stability for objects
  const cacheRef = useRef<{ key: string; raw: string | null; parsed: T }>({
    key,
    raw: null,
    parsed: defaultValue,
  });

  const value = useSyncExternalStore(
    (cb) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener("storage", handler);
      window.addEventListener("local-storage-update", cb);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("local-storage-update", cb);
      };
    },
    () => {
      const raw = localStorage.getItem(key);
      // Only re-parse if the raw string actually changed
      if (key === cacheRef.current.key && raw === cacheRef.current.raw) return cacheRef.current.parsed;
      try {
        const parsed = raw ? (JSON.parse(raw) as T) : defaultValue;
        cacheRef.current = { key, raw, parsed };
        return parsed;
      } catch {
        cacheRef.current = { key, raw, parsed: defaultValue };
        return defaultValue;
      }
    },
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      try {
        const raw = localStorage.getItem(key);
        const prev = raw ? (JSON.parse(raw) as T) : defaultValue;
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        const newRaw = JSON.stringify(resolved);
        if (newRaw === raw && key === cacheRef.current.key) return;
        localStorage.setItem(key, newRaw);
        // Update cache immediately to avoid stale reads
        cacheRef.current = { key, raw: newRaw, parsed: resolved };
      } catch { /* ignore */ }
      window.dispatchEvent(new Event("local-storage-update"));
    },
    [key, defaultValue],
  );

  return [value, setValue];
}
