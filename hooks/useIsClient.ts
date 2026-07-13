import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

/** True after client hydration — avoids setState-in-effect for theme/UI gating. */
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
