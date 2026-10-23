import { VideoItem, LibraryStatus, SystemResponse } from '../types';

export interface VideosApiResponse {
  success: boolean;
  status: LibraryStatus;
  videos: VideoItem[];
  error?: string;
}

// Fallback catalog when visiting directly via GitHub Pages (where no local Node.js daemon is running)
const GITHUB_PAGES_FALLBACK_STATUS: LibraryStatus = {
  directoryExists: true,
  directoryPath: 'D:\\QIZLAR BAZMI HD',
  totalVideos: 2,
  totalSizeBytes: 12971237976,
  totalSizeFormatted: '12.08 GB',
  lastScanned: new Date().toISOString(),
  isScanning: false
};

const GITHUB_PAGES_FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: 'UUlaTEFSIEJBWk1JIDEubXA0',
    filename: 'QIZLAR BAZMI 1.mp4',
    relativePath: 'QIZLAR BAZMI 1.mp4',
    extension: '.mp4',
    sizeBytes: 7353650411,
    sizeFormatted: '6.85 GB',
    mtime: '2026-09-19T10:15:10.000Z',
    durationSeconds: 5500.2,
    durationFormatted: '01:31:40',
    width: 1920,
    height: 1080,
    videoCodec: 'H.264 (Main) AVC1',
    audioCodec: 'AAC-LC Stereo',
    hasThumbnail: false,
    streamUrl: '/api/videos/UUlaTEFSIEJBWk1JIDEubXA0/stream',
    downloadUrl: '/api/videos/UUlaTEFSIEJBWk1JIDEubXA0/download',
    thumbnailUrl: '/api/videos/UUlaTEFSIEJBWk1JIDEubXA0/thumbnail'
  },
  {
    id: 'UUlaTEFSIEJBWk1JIDIubXA0',
    filename: 'QIZLAR BAZMI 2.mp4',
    relativePath: 'QIZLAR BAZMI 2.mp4',
    extension: '.mp4',
    sizeBytes: 5617587565,
    sizeFormatted: '5.23 GB',
    mtime: '2026-09-19T10:53:48.000Z',
    durationSeconds: 4188.1,
    durationFormatted: '01:09:48',
    width: 1920,
    height: 1080,
    videoCodec: 'H.264 (Main) AVC1',
    audioCodec: 'AAC-LC Stereo',
    hasThumbnail: false,
    streamUrl: '/api/videos/UUlaTEFSIEJBWk1JIDIubXA0/stream',
    downloadUrl: '/api/videos/UUlaTEFSIEJBWk1JIDIubXA0/download',
    thumbnailUrl: '/api/videos/UUlaTEFSIEJBWk1JIDIubXA0/thumbnail'
  }
];

export async function fetchVideos(): Promise<VideosApiResponse> {
  try {
    const response = await fetch('/api/videos');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend daemon not reached (e.g. running on GitHub Pages)
  }

  // Graceful fallback for static GitHub Pages preview
  return {
    success: true,
    status: GITHUB_PAGES_FALLBACK_STATUS,
    videos: GITHUB_PAGES_FALLBACK_VIDEOS
  };
}

export async function refreshVideos(): Promise<VideosApiResponse> {
  try {
    const response = await fetch('/api/videos/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Backend daemon not reached
  }

  return {
    success: true,
    status: GITHUB_PAGES_FALLBACK_STATUS,
    videos: GITHUB_PAGES_FALLBACK_VIDEOS
  };
}

export async function fetchSystemInfo(): Promise<SystemResponse> {
  try {
    const response = await fetch('/api/system/info');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback info
  }

  return {
    success: true,
    system: {
      platform: 'win32',
      release: '10.0.26200 (Windows 11)',
      nodeVersion: 'v24.15.0',
      uptimeSeconds: 3600,
      memoryUsageMb: 12
    },
    config: {
      videoDirectory: 'D:\\QIZLAR BAZMI HD',
      videoDirectoryExists: true,
      ffmpegAvailable: true,
      ffmpegPath: 'ffmpeg (v7.1)'
    },
    library: GITHUB_PAGES_FALLBACK_STATUS
  };
}
