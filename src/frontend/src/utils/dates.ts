/**
 * Date utilities for consistent timezone handling across the application.
 * All dates use the user's local timezone.
 */

/**
 * Get the start of today in local timezone as milliseconds timestamp
 */
export function getToday(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * Get the start of the current month in local timezone as milliseconds timestamp
 */
export function getCurrentMonth(): number {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * Check if a timestamp (in milliseconds) is today in local timezone
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a timestamp (in milliseconds) is in the current month in local timezone
 */
export function isCurrentMonth(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

/**
 * Format a timestamp (in milliseconds) as a readable date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp (in milliseconds) as a readable date and time string
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
