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

export interface SystemInfo {
  platform: string;
  release: string;
  nodeVersion: string;
  uptimeSeconds: number;
  memoryUsageMb: number;
}

export interface SystemConfig {
  videoDirectory: string;
  videoDirectoryExists: boolean;
  ffmpegAvailable: boolean;
  ffmpegPath: string;
}

export interface SystemResponse {
  success: boolean;
  system: SystemInfo;
  config: SystemConfig;
  library: LibraryStatus;
}

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'size-desc'
  | 'size-asc'
  | 'name-asc'
  | 'name-desc'
  | 'duration-desc';

export type ViewMode = 'grid' | 'list';

export type LibraryFilterView = 'all' | 'recent';
