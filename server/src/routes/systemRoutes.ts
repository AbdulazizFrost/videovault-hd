import { Router, Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import { VIDEO_DIR } from '../config.js';
import { getFfmpegPath } from '../services/metadataService.js';
import { scannerService } from '../services/scannerService.js';

export const systemRouter = Router();

systemRouter.get('/info', async (_req: Request, res: Response) => {
  const ffmpeg = await getFfmpegPath();
  const dirExists = fs.existsSync(VIDEO_DIR);
  const status = scannerService.getStatus();

  res.json({
    success: true,
    system: {
      platform: os.platform(),
      release: os.release(),
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    config: {
      videoDirectory: VIDEO_DIR,
      videoDirectoryExists: dirExists,
      ffmpegAvailable: !!ffmpeg,
      ffmpegPath: ffmpeg || 'Not found'
    },
    library: status
  });
});
