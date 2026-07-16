/**
 * Feature flags for optional modules.
 * Set flags to `true` to restore temporarily disabled UI.
 */
export const FEATURES = {
  productsModule: false,
  /**
   * Company Settings page (branding, prefixes, banks, terms, theme).
   * DB columns and SettingsClient remain for future re-enable.
   */
  companySettingsModule: false,
  /** Stamp/signature upload + PDF images (requires companySettingsModule). */
  companyStampSignature: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
