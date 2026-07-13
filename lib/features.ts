/**
 * Feature flags for optional modules.
 * Set `productsModule` to `true` to restore the Products UI (sidebar, routes, pages).
 */
export const FEATURES = {
  productsModule: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
