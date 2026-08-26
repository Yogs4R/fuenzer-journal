/**
 * Date Utility for Fuenzer Journal
 * Ensures consistent local timezone formatting and prevents off-by-one UTC conversion shifts.
 */

/**
 * Returns a 'YYYY-MM-DD' string in the user's LOCAL calendar date
 */
export function getLocalDateString(timestamp: number | string | Date = new Date()): string {
  const d =
    typeof timestamp === 'number' || typeof timestamp === 'string'
      ? new Date(timestamp)
      : timestamp;

  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(
      fallback.getDate()
    ).padStart(2, '0')}`;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a journal date for display in the user's local timezone
 */
export function formatJournalDate(
  timestamp: number | string | any,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!timestamp) return '';

  let ms = timestamp;
  if (typeof timestamp === 'object' && timestamp.seconds) {
    ms = timestamp.seconds * 1000;
  } else if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) ms = parsed;
  }

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
export function formatJournalTime(timestamp: number | string | any): string {
  if (!timestamp) return '';

  let ms = timestamp;
  if (typeof timestamp === 'object' && timestamp.seconds) {
    ms = timestamp.seconds * 1000;
  }

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
export function formatRelativeJournalDate(timestamp: number | string | any): string {
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

  return formatJournalDate(timestamp);
}
