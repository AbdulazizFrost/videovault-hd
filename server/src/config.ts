import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Try loading .env from current directory or parent directory
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

export const PORT = parseInt(process.env.PORT || '5000', 10);
export const HOST = process.env.HOST || '127.0.0.1';

// Default target folder as requested
export const VIDEO_DIR = process.env.VIDEO_DIR || 'D:\\QIZLAR BAZMI HD';

// Thumbnails cache folder
export const THUMBNAIL_DIR = path.resolve(
  process.cwd(),
  process.env.THUMBNAIL_DIR || './.cache/thumbnails'
);

// Supported video file extensions
export const SUPPORTED_EXTENSIONS = new Set([
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.webm',
  '.m4v'
]);

// MIME types mapping
export const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo'
};

// Ensure thumbnail cache directory exists
if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
}
