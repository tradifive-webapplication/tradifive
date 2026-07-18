/**
 * Shared utility functions for formatting and calculations in trade journaling
 */

export function formatUTCDate(dateString: string | Date): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const year = d.getUTCFullYear();
  
  let hours = d.getUTCHours();
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = pad(hours);
  
  return `${month}/${day}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

export function formatHoldDuration(openedAt: string | Date, closedAt: string | Date | null | undefined): string {
  if (!closedAt) return "Active / Open Position";
  const start = new Date(openedAt).getTime();
  const end = new Date(closedAt).getTime();
  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs < 0) return "0s";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return `${diffDays}d ${remainingHours}h`;
  }
  if (diffHours > 0) {
    const remainingMins = diffMins % 60;
    return `${diffHours}h ${remainingMins}m`;
  }
  if (diffMins > 0) {
    const remainingSecs = diffSecs % 60;
    return `${diffMins}m ${remainingSecs}s`;
  }
  return `${diffSecs}s`;
}
