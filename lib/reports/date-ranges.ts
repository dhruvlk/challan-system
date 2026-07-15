import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

export type ReportPeriodPreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'custom'
  | 'all';

export type DateRange = {
  from: string | null;
  to: string | null;
};

export function toDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function resolvePeriodRange(
  preset: ReportPeriodPreset,
  customFrom?: string,
  customTo?: string,
  reference: Date = new Date()
): DateRange {
  const now = reference;

  switch (preset) {
    case 'today':
      return { from: toDateKey(startOfDay(now)), to: toDateKey(endOfDay(now)) };
    case 'yesterday': {
      const y = subDays(now, 1);
      return { from: toDateKey(startOfDay(y)), to: toDateKey(endOfDay(y)) };
    }
    case 'this_week':
      return {
        from: toDateKey(startOfWeek(now, { weekStartsOn: 1 })),
        to: toDateKey(endOfWeek(now, { weekStartsOn: 1 })),
      };
    case 'last_week': {
      const last = subWeeks(now, 1);
      return {
        from: toDateKey(startOfWeek(last, { weekStartsOn: 1 })),
        to: toDateKey(endOfWeek(last, { weekStartsOn: 1 })),
      };
    }
    case 'this_month':
      return { from: toDateKey(startOfMonth(now)), to: toDateKey(endOfMonth(now)) };
    case 'last_month': {
      const last = subMonths(now, 1);
      return { from: toDateKey(startOfMonth(last)), to: toDateKey(endOfMonth(last)) };
    }
    case 'this_year':
      return { from: toDateKey(startOfYear(now)), to: toDateKey(endOfYear(now)) };
    case 'last_year': {
      const last = subYears(now, 1);
      return { from: toDateKey(startOfYear(last)), to: toDateKey(endOfYear(last)) };
    }
    case 'custom':
      return {
        from: customFrom?.trim() || null,
        to: customTo?.trim() || null,
      };
    case 'all':
    default:
      return { from: null, to: null };
  }
}

export function isDateInRange(date: string | null | undefined, range: DateRange): boolean {
  if (!date) return false;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

export const PERIOD_PRESET_LABELS: Record<ReportPeriodPreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  last_week: 'Last Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_year: 'This Year',
  last_year: 'Last Year',
  custom: 'Custom Range',
  all: 'All Time',
};

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
