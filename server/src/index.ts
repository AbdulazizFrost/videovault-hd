import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PORT, HOST, VIDEO_DIR } from './config.js';
import { videoRouter } from './routes/videoRoutes.js';
import { systemRouter } from './routes/systemRoutes.js';
import { scannerService } from './services/scannerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range', 'Authorization'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Disposition']
}));

app.use(express.json());

// API Routes
app.use('/api/videos', videoRouter);
app.use('/api/system', systemRouter);

// Resolve client/dist path whether launched from root, server folder, or built dist
const candidateDistPaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist')
];

let clientDistPath: string | null = null;
for (const p of candidateDistPaths) {
  if (fs.existsSync(p)) {
    clientDistPath = p;
    break;
  }
}

if (clientDistPath) {
  console.log(`[Static] Serving frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
} else {
  console.log('[Static] Frontend dist folder not found. In development mode, use client dev server.');
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Внутренняя ошибка сервера'
  });
});

// Start server
app.listen(PORT, HOST, async () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 VideoVault HD Server is running!`);
  console.log(`  🔗 Local URL:  http://${HOST}:${PORT}`);
  console.log(`  📁 Video Folder: ${VIDEO_DIR}`);
  console.log(`======================================================\n`);

  // Initial library scan
  await scannerService.scanLibrary();
});
