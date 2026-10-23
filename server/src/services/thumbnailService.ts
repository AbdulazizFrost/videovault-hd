import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import util from 'util';
import { THUMBNAIL_DIR } from '../config.js';
import { getFfmpegPath } from './metadataService.js';

const execFileAsync = util.promisify(execFile);

// Cache of ongoing generation promises to avoid duplicate parallel ffmpeg runs for the same video
const pendingGenerations = new Map<string, Promise<string | null>>();

/**
 * Returns the path of an existing thumbnail if present.
 */
export function getExistingThumbnailPath(id: string): string | null {
  const thumbPath = path.join(THUMBNAIL_DIR, `${id}.jpg`);
  if (fs.existsSync(thumbPath)) {
    return thumbPath;
  }
  return null;
}

/**
 * Generates a thumbnail for a given video file using ffmpeg.
 */
export async function generateThumbnail(
  id: string,
  filePath: string,
  durationSeconds: number = 10
): Promise<string | null> {
  const existing = getExistingThumbnailPath(id);
  if (existing) return existing;

  // If already generating this thumbnail, wait for the pending task
  if (pendingGenerations.has(id)) {
    return pendingGenerations.get(id)!;
  }

  const task = (async () => {
    const binary = await getFfmpegPath();
    if (!binary) return null;

    const outPath = path.join(THUMBNAIL_DIR, `${id}.jpg`);
    const tempPath = path.join(THUMBNAIL_DIR, `${id}.temp.jpg`);

    // Pick a frame at 10% of the video or at 5 seconds
    let seekSeconds = 5;
    if (durationSeconds > 10) {
      seekSeconds = Math.min(60, Math.max(5, Math.floor(durationSeconds * 0.1)));
    } else if (durationSeconds > 0) {
      seekSeconds = Math.floor(durationSeconds / 2);
    }

    const seekStr = new Date(seekSeconds * 1000).toISOString().substr(11, 8);

    try {
      // Seek BEFORE -i for instant fast seek without decoding the whole file
      const args = [
        '-ss', seekStr,
        '-i', filePath,
        '-vframes', '1',
        '-q:v', '2',
        '-vf', 'scale=640:-1',
        tempPath,
        '-y'
      ];

      await execFileAsync(binary, args, { timeout: 15000 });

      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, outPath);
        return outPath;
      }
      return null;
    } catch (err) {
      console.warn(`[ThumbnailService] Thumbnail extraction failed for ${filePath}:`, (err as any)?.message || err);
      // Clean up temp file if present
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch {}
      }
      return null;
    } finally {
      pendingGenerations.delete(id);
    }
  })();

  pendingGenerations.set(id, task);
  return task;
}
