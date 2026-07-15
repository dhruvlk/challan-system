import type { Company } from '@/types';

/** Apply company brand colors as CSS variables on :root (works with light/dark). */
export function applyCompanyTheme(company: Company | null | undefined) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (company?.theme_primary?.trim()) {
    root.style.setProperty('--primary', company.theme_primary.trim());
    root.style.setProperty('--ring', company.theme_primary.trim());
    root.style.setProperty('--sidebar-primary', company.theme_primary.trim());
  } else {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--sidebar-primary');
  }

  if (company?.theme_secondary?.trim()) {
    root.style.setProperty('--secondary', company.theme_secondary.trim());
    root.style.setProperty('--accent', company.theme_secondary.trim());
  } else {
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
  }
}
