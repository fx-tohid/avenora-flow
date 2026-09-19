/**
 * All dates use the *device's local* calendar day, written as 'YYYY-MM-DD'.
 * Never use toISOString() for a day key: that is UTC and would flip the day
 * at the wrong moment for most time zones.
 */

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

export function addDays(dayKey: string, amount: number): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + amount);
  return toDayKey(date);
}

export function yesterdayKey(): string {
  return addDays(todayKey(), -1);
}

/** Whole days between two day keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(ay, am - 1, ad).getTime();
  const end = new Date(by, bm - 1, bd).getTime();
  return Math.round((end - start) / msPerDay);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 'SEPTEMBER 19' style heading used by the history screen. */
export function formatDayHeading(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const today = todayKey();
  if (dayKey === today) return 'TODAY';
  if (dayKey === addDays(today, -1)) return 'YESTERDAY';
  const label = `${MONTHS[m - 1]} ${d}`.toUpperCase();
  // Only show the year for days outside the current year.
  return y === new Date().getFullYear() ? label : `${label}, ${y}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}
