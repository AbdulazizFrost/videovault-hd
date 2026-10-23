import path from 'path';
import crypto from 'crypto';
import { VIDEO_DIR } from '../config.js';

/**
 * Generates a stable unique ID for a relative file path.
 */
export function generateVideoId(relativePath: string): string {
  // Use URL-safe base64 encoding of the normalized relative path
  const normalized = relativePath.replace(/\\/g, '/');
  return Buffer.from(normalized, 'utf-8')
    .toString('base64url');
}

/**
 * Decodes a video ID back to the relative path.
 */
export function decodeVideoId(id: string): string | null {
  try {
    const decoded = Buffer.from(id, 'base64url').toString('utf-8');
    if (!decoded || decoded.includes('\0')) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Validates that a requested file path resides strictly inside the allowed root directory.
 * Prevents Directory Traversal (LFI) attacks.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);

    // On Windows, drive letters might differ in case, so normalize to lowercase for comparison
    const baseLower = resolvedBase.toLowerCase();
    const targetLower = resolvedTarget.toLowerCase();

    // The target must start with the base directory and be followed by a path separator
    if (baseLower === targetLower) return true;
    const prefix = baseLower.endsWith(path.sep) ? baseLower : baseLower + path.sep;
    return targetLower.startsWith(prefix);
  } catch {
    return false;
  }
}

/**
 * Safely resolves a relative path within the configured VIDEO_DIR.
 * Returns null if unsafe or invalid.
 */
export function resolveSafeVideoPath(relativePath: string): string | null {
  const fullPath = path.resolve(VIDEO_DIR, relativePath);
  if (!isPathSafe(VIDEO_DIR, fullPath)) {
    return null;
  }
  return fullPath;
}
