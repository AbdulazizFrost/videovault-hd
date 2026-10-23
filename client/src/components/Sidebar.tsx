import React from 'react';
import { Film, Clock, HardDrive, Folder, CheckCircle, Database } from 'lucide-react';
import { LibraryStatus, VideoItem, LibraryFilterView } from '../types';

interface SidebarProps {
  status: LibraryStatus | null;
  videos: VideoItem[];
  activeView: LibraryFilterView;
  onViewChange: (view: LibraryFilterView) => void;
  selectedFormat: string;
  onFormatChange: (fmt: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  status,
  videos,
  activeView,
  onViewChange,
  selectedFormat,
  onFormatChange,
  isOpenMobile,
  onCloseMobile
}) => {
  // Dynamically compute format counts from actual loaded videos
  const formatCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of videos) {
      const ext = v.extension.toUpperCase().replace('.', '');
      counts[ext] = (counts[ext] || 0) + 1;
    }
    return counts;
  }, [videos]);

  const availableFormats = React.useMemo(() => {
    const standard = ['MP4', 'MKV', 'AVI', 'MOV', 'WEBM', 'M4V'];
    const dynamic = Object.keys(formatCounts);
    return Array.from(new Set([...dynamic, ...standard])).filter(
      (f) => formatCounts[f] !== undefined || ['MP4', 'MKV', 'AVI'].includes(f)
    );
  }, [formatCounts]);

  const totalSize = status?.totalSizeFormatted || '0 B';
  const totalCount = videos.length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-12 left-0 z-30 h-[calc(100vh-3rem)] w-[220px] shrink-0 bg-[#141512] border-r border-[#34352F] flex flex-col justify-between transition-transform duration-200 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-6 overflow-y-auto">
          {/* SECTION 1: LIBRARY */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-mono font-bold tracking-widest text-[#999A90] uppercase">
              Library
            </div>
            <nav className="space-y-0.5">
              {/* All Items */}
              <button
                onClick={() => {
                  onViewChange('all');
                  onFormatChange('all');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-xs transition-colors ${
                  activeView === 'all' && selectedFormat === 'all'
                    ? 'bg-[#22231F] text-[#F0EFE8] border-l-2 border-[#C5E86C]'
                    : 'text-[#999A90] hover:text-[#F0EFE8] hover:bg-[#191A17]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Film className="w-3.5 h-3.5 text-[#999A90]" />
                  <span>All Media</span>
                </div>
                <span className="font-mono text-[11px] text-[#999A90] tabular-nums">
                  {totalCount}
                </span>
              </button>

              {/* Recent Items */}
              <button
                onClick={() => {
                  onViewChange('recent');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-xs transition-colors ${
                  activeView === 'recent'
                    ? 'bg-[#22231F] text-[#F0EFE8] border-l-2 border-[#C5E86C]'
                    : 'text-[#999A90] hover:text-[#F0EFE8] hover:bg-[#191A17]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-[#999A90]" />
                  <span>Recent</span>
                </div>
                <span className="font-mono text-[11px] text-[#999A90] tabular-nums">
                  {totalCount}
                </span>
              </button>
            </nav>
          </div>

          {/* SECTION 2: VIDEO FORMATS */}
          <div>
            <div className="px-2 pb-2 text-[10px] font-mono font-bold tracking-widest text-[#999A90] uppercase">
              Video Formats
            </div>
            <nav className="space-y-0.5">
              {/* All formats option */}
              <button
                onClick={() => {
                  onFormatChange('all');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-xs transition-colors ${
                  selectedFormat === 'all'
                    ? 'text-[#C5E86C] font-semibold bg-[#22231F]/60'
                    : 'text-[#999A90] hover:text-[#F0EFE8] hover:bg-[#191A17]'
                }`}
              >
                <span className="font-mono text-[11px]">ALL FORMATS</span>
                <span className="font-mono text-[10px] tabular-nums">{totalCount}</span>
              </button>

              {availableFormats.map((fmt) => {
                const count = formatCounts[fmt] || 0;
                const isSelected = selectedFormat.toUpperCase() === fmt.toUpperCase();

                return (
                  <button
                    key={fmt}
                    onClick={() => {
                      onFormatChange(fmt);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-xs transition-colors ${
                      isSelected
                        ? 'text-[#C5E86C] font-semibold bg-[#22231F]/60'
                        : 'text-[#999A90] hover:text-[#F0EFE8] hover:bg-[#191A17]'
                    }`}
                  >
                    <span className="font-mono text-[11px]">.{fmt.toLowerCase()}</span>
                    <span
                      className={`font-mono text-[10px] tabular-nums px-1 rounded-xs ${
                        count > 0 ? 'text-[#F0EFE8] bg-[#22231F]' : 'text-[#999A90]/40'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* SECTION 3: STORAGE FOOTER */}
        <div className="p-3 border-t border-[#34352F] bg-[#111210]">
          <div className="text-[10px] font-mono font-bold tracking-widest text-[#999A90] uppercase mb-2 flex items-center justify-between">
            <span>Storage</span>
            <span className="text-[#C5E86C]">ONLINE</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-[#999A90]">
            <div className="flex items-center justify-between">
              <span>SIZE:</span>
              <span className="text-[#F0EFE8] font-semibold">{totalSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>FILES:</span>
              <span className="text-[#F0EFE8]">{totalCount}</span>
            </div>
            <div className="pt-1.5 border-t border-[#34352F]/60 text-[10px] truncate text-[#999A90]/80" title={status?.directoryPath}>
              {status?.directoryPath || 'D:\\QIZLAR BAZMI HD'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
