import { useRef, useCallback, useState } from "react";

export function useSmartRefresh(fetchFn: () => Promise<void>, minInterval = 2000) {
  const lastFetch = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (isRefreshing || now - lastFetch.current < minInterval) return;

    setIsRefreshing(true);
    lastFetch.current = now;
    try {
      await fetchFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn, minInterval, isRefreshing]);

  const canRefresh = !isRefreshing && Date.now() - lastFetch.current >= minInterval;

  return { refresh, isRefreshing, canRefresh };
}
