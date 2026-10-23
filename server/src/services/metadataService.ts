import { execFile } from 'child_process';
import util from 'util';
import fs from 'fs';

const execFileAsync = util.promisify(execFile);

export interface VideoMetadata {
  durationSeconds: number;
  width?: number;
  height?: number;
  videoCodec?: string;
  audioCodec?: string;
  bitrateKbps?: number;
}

let ffmpegPath: string | null = null;
let ffmpegChecked = false;

/**
 * Finds the working ffmpeg executable path on Windows.
 */
export async function getFfmpegPath(): Promise<string | null> {
  if (ffmpegChecked) return ffmpegPath;
  ffmpegChecked = true;

  const candidates = [
    'ffmpeg',
    'ffmpeg.exe',
    'C:\\Users\\Abdulaziz\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\ffmpeg.exe'
  ];

  for (const candidate of candidates) {
    try {
      await execFileAsync(candidate, ['-version']);
      ffmpegPath = candidate;
      return ffmpegPath;
    } catch {
      // try next
    }
  }

  return null;
}

/**
 * Extracts metadata for a video file using ffmpeg.
 */
export async function extractVideoMetadata(filePath: string): Promise<VideoMetadata | null> {
  const binary = await getFfmpegPath();
  if (!binary) return null;

  try {
    // ffmpeg -i file will exit with code 1 if no output file is provided, but prints full metadata to stderr
    let stderr = '';
    try {
      await execFileAsync(binary, ['-i', filePath], { maxBuffer: 10 * 1024 * 1024 });
    } catch (err: any) {
      stderr = err.stderr || '';
    }

    if (!stderr) return null;

    const metadata: VideoMetadata = {
      durationSeconds: 0
    };

    // Duration regex: Duration: 01:31:40.20, start: 0.000000, bitrate: 10695 kb/s
    const durMatch = stderr.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
    if (durMatch) {
      const h = parseFloat(durMatch[1]);
      const m = parseFloat(durMatch[2]);
      const s = parseFloat(durMatch[3]);
      metadata.durationSeconds = h * 3600 + m * 60 + s;
    }

    // Bitrate regex
    const bitrateMatch = stderr.match(/bitrate:\s*(\d+)\s*kb\/s/);
    if (bitrateMatch) {
      metadata.bitrateKbps = parseInt(bitrateMatch[1], 10);
    }

    // Stream line for Video: Stream #0:0[0x1](eng): Video: h264 ..., 1920x1080 ...
    const videoStreamMatch = stderr.match(/Stream #[0-9:]+.*Video:\s*([^,\n]+).*?,\s*(\d{2,5})x(\d{2,5})/);
    if (videoStreamMatch) {
      metadata.videoCodec = videoStreamMatch[1].trim();
      metadata.width = parseInt(videoStreamMatch[2], 10);
      metadata.height = parseInt(videoStreamMatch[3], 10);
    }

    // Stream line for Audio: Stream #0:1[0x2](eng): Audio: aac ...
    const audioStreamMatch = stderr.match(/Stream #[0-9:]+.*Audio:\s*([^,\n]+)/);
    if (audioStreamMatch) {
      metadata.audioCodec = audioStreamMatch[1].trim();
    }

    return metadata;
  } catch (error) {
    console.error(`[MetadataService] Error reading metadata for ${filePath}:`, error);
    return null;
  }
}
