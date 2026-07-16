/**
 * Feature flags for optional modules.
 * Set `productsModule` to `true` to restore the Products UI (sidebar, routes, pages).
 * Set `companyStampSignature` to `true` to restore stamp/signature upload in Settings + PDF rendering.
 */
export const FEATURES = {
  productsModule: false,
  /** Temporary off — DB columns (`stamp_url`, `signature_url`) remain for future use. */
  companyStampSignature: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
