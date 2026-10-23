import fs from 'fs';
import path from 'path';
import { VIDEO_DIR, SUPPORTED_EXTENSIONS } from '../config.js';
import { generateVideoId, isPathSafe } from '../utils/security.js';
import { formatBytes, formatDuration } from '../utils/formatters.js';
import { extractVideoMetadata, VideoMetadata } from './metadataService.js';
import { generateThumbnail, getExistingThumbnailPath } from './thumbnailService.js';

export interface VideoItem {
  id: string;
  filename: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
  sizeFormatted: string;
  mtime: string;
  durationSeconds: number;
  durationFormatted: string;
  width?: number;
  height?: number;
  videoCodec?: string;
  audioCodec?: string;
  hasThumbnail: boolean;
  streamUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
}

export interface LibraryStatus {
  directoryExists: boolean;
  directoryPath: string;
  totalVideos: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  lastScanned: string;
  isScanning: boolean;
  error?: string;
}

class ScannerService {
  private videosMap = new Map<string, VideoItem>();
  private metadataCache = new Map<string, VideoMetadata>();
  private isScanning = false;
  private lastScannedDate: Date | null = null;
  private scanError: string | null = null;
  private fileWatcher: fs.FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.setupWatcher();
  }

  private setupWatcher() {
    try {
      if (fs.existsSync(VIDEO_DIR)) {
        this.fileWatcher = fs.watch(VIDEO_DIR, { recursive: false }, (_eventType, filename) => {
          if (!filename) return;
          const ext = path.extname(filename).toLowerCase();
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            // Debounce re-scan
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
              console.log(`[Scanner] Folder change detected (${filename}), re-scanning...`);
              this.scanLibrary().catch(console.error);
            }, 1000);
          }
        });
        console.log(`[Scanner] Watching folder: ${VIDEO_DIR}`);
      }
    } catch (err) {
      console.warn(`[Scanner] Could not attach file watcher to ${VIDEO_DIR}:`, (err as any)?.message || err);
    }
  }

  /**
   * Scans the VIDEO_DIR directory and updates video library.
   */
  public async scanLibrary(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;
    this.scanError = null;

    try {
      if (!fs.existsSync(VIDEO_DIR)) {
        this.scanError = `Папка не найдена: ${VIDEO_DIR}. Пожалуйста, проверьте подключение диска или измените VIDEO_DIR в .env`;
        this.videosMap.clear();
        this.lastScannedDate = new Date();
        return;
      }

      const entries = await fs.promises.readdir(VIDEO_DIR, { withFileTypes: true });
      const currentIds = new Set<string>();

      for (const entry of entries) {
        if (!entry.isFile()) continue;

        const ext = path.extname(entry.name).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

        const relativePath = entry.name;
        const fullPath = path.resolve(VIDEO_DIR, relativePath);

        if (!isPathSafe(VIDEO_DIR, fullPath)) continue;

        try {
          const stats = await fs.promises.stat(fullPath);
          const id = generateVideoId(relativePath);
          currentIds.add(id);

          const existingItem = this.videosMap.get(id);
          const hasThumb = !!getExistingThumbnailPath(id);

          const cachedMeta = this.metadataCache.get(id);

          const item: VideoItem = {
            id,
            filename: entry.name,
            relativePath,
            extension: ext,
            sizeBytes: stats.size,
            sizeFormatted: formatBytes(stats.size),
            mtime: stats.mtime.toISOString(),
            durationSeconds: cachedMeta?.durationSeconds || existingItem?.durationSeconds || 0,
            durationFormatted: formatDuration(cachedMeta?.durationSeconds || existingItem?.durationSeconds || 0),
            width: cachedMeta?.width || existingItem?.width,
            height: cachedMeta?.height || existingItem?.height,
            videoCodec: cachedMeta?.videoCodec || existingItem?.videoCodec,
            audioCodec: cachedMeta?.audioCodec || existingItem?.audioCodec,
            hasThumbnail: hasThumb,
            streamUrl: `/api/videos/${id}/stream`,
            downloadUrl: `/api/videos/${id}/download`,
            thumbnailUrl: `/api/videos/${id}/thumbnail`
          };

          this.videosMap.set(id, item);
        } catch (fileErr) {
          console.warn(`[Scanner] Error reading stats for ${entry.name}:`, fileErr);
        }
      }

      // Remove deleted files
      for (const [id] of this.videosMap) {
        if (!currentIds.has(id)) {
          this.videosMap.delete(id);
        }
      }

      this.lastScannedDate = new Date();
      console.log(`[Scanner] Scan finished: ${this.videosMap.size} videos found.`);

      // Enrich metadata and generate thumbnails in background
      this.enrichMetadataBackground();
    } catch (err: any) {
      this.scanError = `Ошибка при сканировании папки: ${err.message}`;
      console.error('[Scanner] Scan failed:', err);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Background worker to extract metadata and thumbnails without delaying the file list response.
   */
  private async enrichMetadataBackground() {
    for (const [id, item] of this.videosMap.entries()) {
      const fullPath = path.resolve(VIDEO_DIR, item.relativePath);

      // Check if metadata needs fetching
      if (!this.metadataCache.has(id)) {
        try {
          const meta = await extractVideoMetadata(fullPath);
          if (meta) {
            this.metadataCache.set(id, meta);
            item.durationSeconds = meta.durationSeconds;
            item.durationFormatted = formatDuration(meta.durationSeconds);
            item.width = meta.width;
            item.height = meta.height;
            item.videoCodec = meta.videoCodec;
            item.audioCodec = meta.audioCodec;
          }
        } catch (e) {
          // ignore background metadata errors
        }
      }

      // Check if thumbnail needs generating
      if (!item.hasThumbnail) {
        try {
          const thumb = await generateThumbnail(id, fullPath, item.durationSeconds);
          if (thumb) {
            item.hasThumbnail = true;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }

  public getVideos(): VideoItem[] {
    return Array.from(this.videosMap.values());
  }

  public getVideo(id: string): VideoItem | null {
    return this.videosMap.get(id) || null;
  }

  public getStatus(): LibraryStatus {
    const exists = fs.existsSync(VIDEO_DIR);
    const videos = this.getVideos();
    const totalSizeBytes = videos.reduce((acc, v) => acc + v.sizeBytes, 0);

    return {
      directoryExists: exists,
      directoryPath: VIDEO_DIR,
      totalVideos: videos.length,
      totalSizeBytes,
      totalSizeFormatted: formatBytes(totalSizeBytes),
      lastScanned: this.lastScannedDate ? this.lastScannedDate.toISOString() : new Date().toISOString(),
      isScanning: this.isScanning,
      error: this.scanError || (!exists ? `Папка не найдена: ${VIDEO_DIR}` : undefined)
    };
  }
}

export const scannerService = new ScannerService();
