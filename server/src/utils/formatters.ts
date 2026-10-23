/**
 * Formats bytes into a human-readable string (e.g. 7.35 GB, 450 MB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formats duration in seconds into HH:MM:SS or MM:SS string.
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const paddedHrs = String(hrs).padStart(2, '0');
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Creates a compliant Content-Disposition header supporting RFC 5987 / RFC 6266.
 * Correctly preserves Cyrillic, Uzbek characters, emojis, spaces, and punctuation.
 */
export function createContentDisposition(filename: string, disposition: 'inline' | 'attachment' = 'attachment'): string {
  // ASCII fallback: replace non-ASCII characters with underscores or basic transliteration
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  // UTF-8 encoded filename per RFC 5987
  const utf8Filename = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');

  return `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${utf8Filename}`;
}
