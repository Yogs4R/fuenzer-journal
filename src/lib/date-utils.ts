/**
 * Date Utility for Fuenzer Journal
 * Ensures consistent local timezone formatting and prevents off-by-one UTC conversion shifts.
 */

/**
 * Robustly parses any timestamp (number, string, Firestore Timestamp {seconds, nanoseconds}, Date)
 * into milliseconds since epoch.
 */
export function parseTimestamp(timestamp: any): number {
  if (timestamp === null || timestamp === undefined) return Date.now();
  if (typeof timestamp === 'number') {
    // If it's in seconds (10 digits), convert to ms
    if (timestamp < 10000000000) return timestamp * 1000;
    return timestamp;
  }
  if (typeof timestamp === 'object') {
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().getTime();
    }
    if (typeof timestamp.seconds === 'number') {
      return timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1000000);
    }
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
  }
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now();
}

/**
 * Returns a 'YYYY-MM-DD' string in the user's LOCAL calendar date
 */
export function getLocalDateString(timestamp: any = new Date()): string {
  const ms = parseTimestamp(timestamp);
  const d = new Date(ms);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a journal date for display in the user's local timezone
 */
export function formatJournalDate(
  timestamp: any,
  options?: Intl.DateTimeFormatOptions
): string {
  if (timestamp === null || timestamp === undefined) return '';

  const ms = parseTimestamp(timestamp);
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };

  return d.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats time in local timezone (e.g., '2:45 PM')
 */
export function formatJournalTime(timestamp: any): string {
  if (timestamp === null || timestamp === undefined) return '';

  const ms = parseTimestamp(timestamp);
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats full timestamp with relative badge ('Today', 'Yesterday', or 'Aug 25, 2026')
 */
export function formatRelativeJournalDate(timestamp: any): string {
  if (timestamp === null || timestamp === undefined) return '';

  const entryDateStr = getLocalDateString(timestamp);
  const todayDateStr = getLocalDateString(new Date());

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayDateStr = getLocalDateString(yesterdayDate);

  if (entryDateStr === todayDateStr) {
    return `Today at ${formatJournalTime(timestamp)}`;
  } else if (entryDateStr === yesterdayDateStr) {
    return `Yesterday at ${formatJournalTime(timestamp)}`;
  }

  return `${formatJournalDate(timestamp)} at ${formatJournalTime(timestamp)}`;
}

