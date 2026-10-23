import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  AlertCircle,
  Monitor,
  Clock,
  HardDrive,
  FileCode,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { VideoItem } from '../types';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onDownload: (video: VideoItem) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const isPotentiallyUnsupported =
    video.extension.toLowerCase() === '.mkv' ||
    video.extension.toLowerCase() === '.avi';

  const handleVideoError = () => {
    setPlaybackError(
      'Браузер не смог воспроизвести этот файл напрямую из-за ограничений встроенных кодеков контейнера. Вы можете скачать оригинальный файл без перекодирования для просмотра в VLC или стороннем видеоплеере.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-xs select-none">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-[#141512] border border-[#34352F] rounded-xs shadow-2xl flex flex-col max-h-[94vh] overflow-hidden"
      >
        {/* Inspection Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#191A17] border-b border-[#34352F] text-xs font-mono">
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-1 text-[#999A90] hover:text-[#F0EFE8] py-0.5 px-1.5 border border-[#34352F] hover:border-[#999A90] rounded-xs transition-colors"
              title="Return to library (Esc)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>ARCHIVE</span>
            </button>
            <span className="text-[#34352F]">|</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-[#22231F] text-[#C5E86C] border border-[#34352F] shrink-0">
              {video.extension.replace('.', '')}
            </span>
            <span className="text-[#F0EFE8] font-medium truncate font-sans text-xs" title={video.filename}>
              {video.filename}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onDownload(video)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-[#C5E86C] hover:bg-[#D4F285] text-[#111210] font-mono text-xs font-semibold rounded-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD RAW</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-[#999A90] hover:text-[#F0EFE8] border border-[#34352F] hover:border-[#999A90] rounded-xs transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] sm:min-h-[460px] max-h-[64vh] overflow-hidden border-b border-[#34352F]">
          <video
            ref={videoRef}
            src={video.streamUrl}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onError={handleVideoError}
            className="w-full h-full max-h-[64vh] object-contain"
          >
            HTML5 video not supported.
          </video>

          {/* Fallback alert if video cannot decode */}
          {playbackError && (
            <div className="absolute inset-0 bg-[#111210]/95 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-12 h-12 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#F0EFE8] mb-1.5 font-sans">
                Кодек требует внешнего плеера
              </h3>
              <p className="text-[#999A90] text-xs max-w-md mb-5 leading-relaxed font-sans">
                {playbackError}
              </p>
              <button
                onClick={() => onDownload(video)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#C5E86C] hover:bg-[#D4F285] text-[#111210] font-mono text-xs font-semibold rounded-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>СКАЧАТЬ ОРИГИНАЛЬНЫЙ ФАЙЛ ({video.sizeFormatted})</span>
              </button>
            </div>
          )}
        </div>

        {/* Warning banner for MKV/AVI */}
        {isPotentiallyUnsupported && !playbackError && (
          <div className="bg-[#191A17] border-b border-[#34352F] px-4 py-2 flex items-center space-x-2 text-xs font-mono text-[#999A90]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Контейнер <b>{video.extension.toUpperCase()}</b>: если аудио/видео не декодируется браузером, скачайте оригинальный файл без сжатия.
            </span>
          </div>
        )}

        {/* Technical Metadata Bar */}
        <div className="bg-[#141512] px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-[#999A90]">
          <div className="border border-[#34352F] p-2 bg-[#191A17]">
            <div className="text-[10px] text-[#999A90]/70 mb-0.5 uppercase">File Size</div>
            <div className="text-[#F0EFE8] font-semibold">{video.sizeFormatted}</div>
            <div className="text-[10px] text-[#999A90]/60 tabular-nums">({video.sizeBytes.toLocaleString()} bytes)</div>
          </div>

          <div className="border border-[#34352F] p-2 bg-[#191A17]">
            <div className="text-[10px] text-[#999A90]/70 mb-0.5 uppercase">Duration</div>
            <div className="text-[#F0EFE8] font-semibold tabular-nums">{video.durationFormatted}</div>
            <div className="text-[10px] text-[#999A90]/60">{Math.round(video.durationSeconds)}s total</div>
          </div>

          <div className="border border-[#34352F] p-2 bg-[#191A17]">
            <div className="text-[10px] text-[#999A90]/70 mb-0.5 uppercase">Resolution</div>
            <div className="text-[#F0EFE8] font-semibold">
              {video.width && video.height ? `${video.width} × ${video.height}` : 'Standard'}
            </div>
            <div className="text-[10px] text-[#999A90]/60">16:9 Aspect</div>
          </div>

          <div className="border border-[#34352F] p-2 bg-[#191A17]">
            <div className="text-[10px] text-[#999A90]/70 mb-0.5 uppercase">Codecs</div>
            <div className="text-[#F0EFE8] font-semibold truncate" title={video.videoCodec || 'H.264'}>
              {video.videoCodec ? video.videoCodec.split(' ')[0] : 'H.264'} / {video.audioCodec ? video.audioCodec.split(' ')[0] : 'AAC'}
            </div>
            <div className="text-[10px] text-[#C5E86C] flex items-center space-x-1">
              <Zap className="w-2.5 h-2.5" />
              <span>Range 206 Stream</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-4 py-2 bg-[#111210] border-t border-[#34352F] flex items-center justify-between text-[11px] font-mono text-[#999A90]">
          <span>HOTKEYS: [SPACE] PAUSE • [F] FULLSCREEN • [ESC] RETURN</span>
          <span className="text-[#C5E86C]">LOSSLESS TRANSMISSION</span>
        </div>
      </div>
    </div>
  );
};
