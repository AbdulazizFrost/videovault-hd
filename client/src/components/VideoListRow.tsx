import React, { useState } from 'react';
import { Play, Download, Film } from 'lucide-react';
import { VideoItem } from '../types';

interface VideoListRowProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onDownload: (video: VideoItem) => void;
}

export const VideoListRow: React.FC<VideoListRowProps> = ({ video, onPlay, onDownload }) => {
  const [imgError, setImgError] = useState(false);

  const resolutionLabel = React.useMemo(() => {
    if (!video.height) return '—';
    if (video.height >= 2160) return '4K UHD';
    if (video.height >= 1440) return '1440p';
    if (video.height >= 1080) return '1080p HD';
    if (video.height >= 720) return '720p';
    return `${video.width}x${video.height}`;
  }, [video.height, video.width]);

  const dateFormatted = React.useMemo(() => {
    try {
      const d = new Date(video.mtime);
      return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  }, [video.mtime]);

  return (
    <div className="group bg-[#191A17] hover:bg-[#22231F] border border-[#34352F] hover:border-[#999A90] p-2.5 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-150">
      {/* Left: Thumbnail & Title */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* Compact Thumbnail 16:9 */}
        <div
          onClick={() => onPlay(video)}
          className="relative w-20 h-12 bg-[#111210] border border-[#34352F] shrink-0 overflow-hidden cursor-pointer rounded-xs"
        >
          {!imgError ? (
            <img
              src={video.thumbnailUrl}
              alt={video.filename}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#999A90]">
              <Film className="w-4 h-4 text-[#34352F]" />
            </div>
          )}
          {video.durationSeconds > 0 && (
            <span className="absolute bottom-0.5 right-0.5 text-[9px] font-mono px-1 bg-[#111210]/90 text-[#F0EFE8] tabular-nums">
              {video.durationFormatted}
            </span>
          )}
        </div>

        {/* Title and Tech Badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C5E86C]">
              {video.extension.replace('.', '')}
            </span>
            <span className="text-[#34352F]">•</span>
            <span className="text-[11px] font-mono text-[#999A90]">
              {resolutionLabel}
            </span>
            {video.videoCodec && (
              <>
                <span className="text-[#34352F] hidden lg:inline">•</span>
                <span className="text-[10px] font-mono text-[#999A90]/70 truncate max-w-[120px] hidden lg:inline">
                  {video.videoCodec.split(' ')[0]}
                </span>
              </>
            )}
          </div>

          <h3
            onClick={() => onPlay(video)}
            className="text-xs font-medium text-[#F0EFE8] truncate hover:text-[#C5E86C] cursor-pointer"
            title={video.filename}
          >
            {video.filename}
          </h3>
        </div>
      </div>

      {/* Middle & Right: Technical Specs & Actions */}
      <div className="flex items-center justify-between md:justify-end space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#34352F]/60 text-xs font-mono">
        <div className="flex items-center space-x-4 text-[#999A90]">
          <span className="w-20 text-right text-[#F0EFE8] font-semibold">
            {video.sizeFormatted}
          </span>
          <span className="w-24 text-right hidden sm:inline text-[#999A90]">
            {dateFormatted}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onPlay(video)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#C5E86C] text-[#111210] text-xs font-mono font-semibold rounded-xs hover:bg-[#D4F285] transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>PLAY</span>
          </button>
          <button
            onClick={() => onDownload(video)}
            className="flex items-center space-x-1 px-2 py-1 bg-[#22231F] text-[#F0EFE8] border border-[#34352F] hover:border-[#999A90] text-xs font-mono rounded-xs transition-colors"
            title="Download original file"
          >
            <Download className="w-3 h-3 text-[#999A90]" />
            <span>RAW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
