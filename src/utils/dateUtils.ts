/**
 * Get the current date in the user's timezone as an ISO string (YYYY-MM-DD)
 */
export function getUserLocalDate(timezone: string): string {
  const now = new Date();
  return getDateInTimezone(now, timezone);
}

/**
 * Get a date in the specified timezone as an ISO string (YYYY-MM-DD)
 */
export function getDateInTimezone(date: Date, timezone: string): string {
  const year = date.toLocaleString('en-US', { timeZone: timezone, year: 'numeric' });
  const month = date.toLocaleString('en-US', { timeZone: timezone, month: '2-digit' });
  const day = date.toLocaleString('en-US', { timeZone: timezone, day: '2-digit' });
  return `${year}-${month}-${day}`;
}

/**
 * Get the start of day in milliseconds for a given date in the user's timezone
 */
export function getStartOfDayInTimezone(dateStr: string, _timezone: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create a date in the user's timezone
  const date = new Date(year, month - 1, day);
  return date.getTime();
}

/**
 * Get the end of day in milliseconds for a given date in the user's timezone
 */
export function getEndOfDayInTimezone(dateStr: string, _timezone: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // Set to end of day (23:59:59.999)
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Get yesterday's date in the user's timezone
 */
export function getYesterdayDate(timezone: string): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateInTimezone(yesterday, timezone);
}

/**
 * Get a date N days ago in the user's timezone
 */
export function getDaysAgo(daysAgo: number, timezone: string): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getDateInTimezone(date, timezone);
}

/**
 * Check if a timestamp falls on today's date in the user's timezone
 */
export function isToday(timestamp: number, timezone: string): boolean {
  const date = getDateInTimezone(new Date(timestamp), timezone);
  const today = getUserLocalDate(timezone);
  return date === today;
}

/**
 * Check if a timestamp falls on yesterday's date in the user's timezone
 */
export function isYesterday(timestamp: number, timezone: string): boolean {
  const date = getDateInTimezone(new Date(timestamp), timezone);
  const yesterday = getYesterdayDate(timezone);
  return date === yesterday;
}

/**
 * Get a friendly date label for grouping (Today, Yesterday, or formatted date)
 */
export function getDateLabel(timestamp: number, timezone: string): string {
  if (isToday(timestamp, timezone)) {
    return 'Today';
  }
  if (isYesterday(timestamp, timezone)) {
    return 'Yesterday';
  }

  const date = new Date(timestamp);
  const today = new Date();

  const month = date.toLocaleString('en-US', { timeZone: timezone, month: 'short' });
  const day = date.toLocaleString('en-US', { timeZone: timezone, day: 'numeric' });
  const year = date.toLocaleString('en-US', { timeZone: timezone, year: 'numeric' });

  if (date.getFullYear() !== today.getFullYear()) {
    return `${month} ${day}, ${year}`;
  }
  return `${month} ${day}`;
}

/**
 * Calculate the date range for loading records (from N days ago to yesterday)
 * Excludes today because today's data is shown separately
 */
export function getDateRangeForLoading(daysToLoad: number, timezone: string): string[] {
  const dates: string[] = [];
  for (let i = 1; i <= daysToLoad; i++) {
    dates.push(getDaysAgo(i, timezone));
  }
  return dates;
}

/**
 * Filter items by date range based on their timestamps
 */
export function filterByDateRange<T extends { timestamp: number }>(
  items: T[],
  startDate: string,
  endDate: string,
  _timezone: string
): T[] {
  // Simple filter: convert dates to timestamps and compare
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const startTimestamp = new Date(startYear, startMonth - 1, startDay).getTime();
  const endTimestamp = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999).getTime();

  return items.filter((item) => {
    return item.timestamp >= startTimestamp && item.timestamp <= endTimestamp;
  });
}
