import React, { useState } from 'react';
import { Play, Download, Film, HardDrive, Clock, Monitor } from 'lucide-react';
import { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onDownload: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, onDownload }) => {
  const [imgError, setImgError] = useState(false);

  // Compute resolution badge (e.g. 1080p, 4K, 720p)
  const resolutionLabel = React.useMemo(() => {
    if (!video.height) return null;
    if (video.height >= 2160) return '4K';
    if (video.height >= 1440) return '1440p';
    if (video.height >= 1080) return '1080p';
    if (video.height >= 720) return '720p';
    return `${video.width}x${video.height}`;
  }, [video.height, video.width]);

  // Format date
  const dateFormatted = React.useMemo(() => {
    try {
      const d = new Date(video.mtime);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }, [video.mtime]);

  return (
    <div className="group bg-[#191A17] border border-[#34352F] hover:border-[#999A90] rounded-xs flex flex-col justify-between transition-colors duration-150">
      {/* 16:9 Thumbnail Area */}
      <div
        onClick={() => onPlay(video)}
        className="relative aspect-video w-full bg-[#111210] overflow-hidden cursor-pointer select-none border-b border-[#34352F]"
      >
        {!imgError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.filename}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-opacity duration-150 group-hover:opacity-90"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#141512] text-[#999A90]">
            <Film className="w-8 h-8 mb-1.5 text-[#34352F]" />
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#999A90]">
              {video.extension.replace('.', '')} ARCHIVE
            </span>
          </div>
        )}

        {/* Hover Contextual Action Bar */}
        <div className="absolute inset-0 bg-[#111210]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center space-x-2 p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(video);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#C5E86C] text-[#111210] font-mono text-xs font-semibold rounded-xs hover:bg-[#D4F285] transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(video);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#22231F] text-[#F0EFE8] border border-[#34352F] hover:border-[#999A90] font-mono text-xs rounded-xs transition-colors"
            title="Download original file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>RAW</span>
          </button>
        </div>

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 flex items-center space-x-1 pointer-events-none">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#111210]/90 text-[#F0EFE8] border border-[#34352F]">
            {video.extension.replace('.', '')}
          </span>
          {resolutionLabel && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#111210]/90 text-[#999A90] border border-[#34352F]">
              {resolutionLabel}
            </span>
          )}
        </div>

        {/* Duration Badge */}
        {video.durationSeconds > 0 && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-[#111210]/90 border border-[#34352F] text-[10px] font-mono text-[#F0EFE8] tabular-nums pointer-events-none">
            {video.durationFormatted}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Filename */}
          <h3
            onClick={() => onPlay(video)}
            className="text-xs font-medium text-[#F0EFE8] leading-snug line-clamp-2 hover:text-[#C5E86C] cursor-pointer transition-colors"
            title={video.filename}
          >
            {video.filename}
          </h3>
        </div>

        {/* Bottom Technical Spec Row */}
        <div className="pt-2 mt-2 border-t border-[#34352F]/70 flex items-center justify-between text-[11px] font-mono text-[#999A90]">
          <span className="text-[#F0EFE8] font-medium">{video.sizeFormatted}</span>
          <span>{dateFormatted}</span>
        </div>
      </div>
    </div>
  );
};
