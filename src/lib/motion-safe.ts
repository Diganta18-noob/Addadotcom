export function isMotionReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionSafe<T>(fn: () => T, fallback: T): T {
  return isMotionReduced() ? fallback : fn();
}
