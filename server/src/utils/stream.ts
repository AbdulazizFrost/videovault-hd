import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { MIME_TYPES } from '../config.js';

/**
 * Handles HTTP Range Requests (HTTP 206) for smooth seeking and memory-efficient streaming of large video files.
 */
export function streamVideoFile(req: Request, res: Response, filePath: string, stats: fs.Stats) {
  const fileSize = stats.size;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const range = req.headers.range;

  if (range) {
    // Parse Range header (e.g. "bytes=32324-")
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Validate range values
    if (isNaN(start) || start >= fileSize || (parts[1] && end >= fileSize) || start > end) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const fileStream = fs.createReadStream(filePath, { start, end });

    // Clean up if connection closes prematurely
    req.on('close', () => {
      fileStream.destroy();
    });

    fileStream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).end();
      }
      fileStream.destroy();
    });

    fileStream.pipe(res);
  } else {
    // No Range header, stream full content with Accept-Ranges declared
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const fileStream = fs.createReadStream(filePath);

    req.on('close', () => {
      fileStream.destroy();
    });

    fileStream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).end();
      }
      fileStream.destroy();
    });

    fileStream.pipe(res);
  }
}
