import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { scannerService } from '../services/scannerService.js';
import { VIDEO_DIR } from '../config.js';
import { resolveSafeVideoPath } from '../utils/security.js';
import { streamVideoFile } from '../utils/stream.js';
import { createContentDisposition } from '../utils/formatters.js';
import { getExistingThumbnailPath, generateThumbnail } from '../services/thumbnailService.js';

export const videoRouter = Router();

// Placeholder SVG for videos without generated thumbnails
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" fill="none">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <circle cx="320" cy="180" r="48" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <polygon points="312,162 336,180 312,198" fill="url(#icon)"/>
  <text x="320" y="255" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14" font-weight="500">VideoVault HD</text>
</svg>`;

/**
 * GET /api/videos
 * Returns all available video items and folder status
 */
videoRouter.get('/', async (_req: Request, res: Response) => {
  const status = scannerService.getStatus();
  const videos = scannerService.getVideos();
  res.json({
    success: true,
    status,
    videos
  });
});

/**
 * POST /api/videos/refresh
 * Manually forces a rescan of the video directory
 */
videoRouter.post('/refresh', async (_req: Request, res: Response) => {
  await scannerService.scanLibrary();
  const status = scannerService.getStatus();
  const videos = scannerService.getVideos();
  res.json({
    success: true,
    status,
    videos
  });
});

/**
 * GET /api/videos/:id
 * Returns single video metadata
 */
videoRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const video = scannerService.getVideo(id);
  if (!video) {
    return res.status(404).json({ success: false, error: 'Видео не найдено' });
  }
  res.json({ success: true, video });
});

/**
 * GET /api/videos/:id/stream
 * Streams video using HTTP 206 Range Requests for seeking and smooth playback
 */
videoRouter.get('/:id/stream', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const video = scannerService.getVideo(id);

  if (!video) {
    return res.status(404).json({ success: false, error: 'Видео не найдено в библиотеке' });
  }

  const safePath = resolveSafeVideoPath(video.relativePath);
  if (!safePath || !fs.existsSync(safePath)) {
    return res.status(404).json({ success: false, error: 'Файл не найден на диске или доступ запрещен' });
  }

  try {
    const stats = fs.statSync(safePath);
    streamVideoFile(req, res, safePath, stats);
  } catch (err: any) {
    console.error(`[Stream] Error streaming ${video.filename}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Ошибка передачи видеопотока' });
    }
  }
});

/**
 * GET /api/videos/:id/download
 * Downloads original file without re-encoding, preserving exact original quality
 */
videoRouter.get('/:id/download', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const video = scannerService.getVideo(id);

  if (!video) {
    return res.status(404).json({ success: false, error: 'Видео не найдено в библиотеке' });
  }

  const safePath = resolveSafeVideoPath(video.relativePath);
  if (!safePath || !fs.existsSync(safePath)) {
    return res.status(404).json({ success: false, error: 'Файл не найден на диске или был перемещён' });
  }

  try {
    const stats = fs.statSync(safePath);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', createContentDisposition(video.filename, 'attachment'));
    res.setHeader('Cache-Control', 'no-cache');

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    const readStream = fs.createReadStream(safePath);

    req.on('close', () => {
      readStream.destroy();
    });

    readStream.on('error', (err) => {
      console.error(`[Download] Stream error for ${video.filename}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Ошибка при скачивании файла' });
      }
      readStream.destroy();
    });

    readStream.pipe(res);
  } catch (err: any) {
    console.error(`[Download] Failed to initiate download:`, err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Не удалось начать скачивание' });
    }
  }
});

/**
 * GET /api/videos/:id/thumbnail
 * Serves thumbnail image or fallback SVG
 */
videoRouter.get('/:id/thumbnail', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const video = scannerService.getVideo(id);

  const existingThumb = getExistingThumbnailPath(id);
  if (existingThumb && fs.existsSync(existingThumb)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(existingThumb).pipe(res);
  }

  if (video) {
    const safePath = resolveSafeVideoPath(video.relativePath);
    if (safePath && fs.existsSync(safePath)) {
      try {
        const thumbPath = await generateThumbnail(id, safePath, video.durationSeconds);
        if (thumbPath && fs.existsSync(thumbPath)) {
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return fs.createReadStream(thumbPath).pipe(res);
        }
      } catch {
        // fallback to placeholder SVG
      }
    }
  }

  // Fallback SVG
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(PLACEHOLDER_SVG);
});
