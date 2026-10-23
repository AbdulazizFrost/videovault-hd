import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { LibraryStatus } from '../types';

interface EmptyStateProps {
  status: LibraryStatus | null;
  hasSearchOrFilter: boolean;
  onClearFilters: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  status,
  hasSearchOrFilter,
  onClearFilters,
  onRefresh,
  isRefreshing
}) => {
  const dirExists = status?.directoryExists ?? true;

  if (!dirExists) {
    return (
      <div className="bg-[#191A17] border border-rose-500/40 p-8 rounded-xs max-w-xl mx-auto my-8 font-mono">
        <div className="flex items-center space-x-2 text-rose-400 mb-3 text-xs uppercase font-bold tracking-wider">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Storage Volume Not Accessible</span>
        </div>

        <p className="text-xs text-[#999A90] mb-3 font-sans leading-relaxed">
          The requested media directory could not be accessed by the local daemon:
        </p>

        <div className="p-2.5 bg-[#111210] border border-[#34352F] text-xs text-rose-300 mb-4 break-all">
          {status?.directoryPath || 'D:\\QIZLAR BAZMI HD'}
        </div>

        <div className="text-[11px] text-[#999A90] space-y-1 mb-5 border-l border-[#34352F] pl-3">
          <p>1. Check if the specified drive volume is mounted in Windows Explorer.</p>
          <p>2. Verify file permissions on the target directory.</p>
          <p>3. To change the target directory, modify <code>VIDEO_DIR</code> in <code>.env</code>.</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#C5E86C] hover:bg-[#D4F285] text-[#111210] text-xs font-mono font-semibold rounded-xs transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'CHECKING...' : 'RECHECK VOLUME'}</span>
        </button>
      </div>
    );
  }

  if (hasSearchOrFilter) {
    return (
      <div className="bg-[#191A17] border border-[#34352F] p-8 rounded-xs max-w-md mx-auto my-8 text-center font-mono">
        <div className="text-xs text-[#999A90] uppercase tracking-wider mb-2">
          NO MATCHING MEDIA RECORDS
        </div>
        <p className="text-xs text-[#999A90] mb-5 font-sans">
          No video files matched your current search criteria or active format filter.
        </p>
        <button
          onClick={onClearFilters}
          className="px-3 py-1.5 bg-[#22231F] hover:bg-[#282A25] border border-[#34352F] hover:border-[#999A90] text-xs text-[#F0EFE8] font-mono rounded-xs transition-colors"
        >
          RESET FILTERS
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#191A17] border border-[#34352F] p-8 rounded-xs max-w-md mx-auto my-8 text-center font-mono">
      <div className="text-xs text-[#999A90] uppercase tracking-wider mb-2">
        ARCHIVE VOLUME EMPTY
      </div>
      <p className="text-xs text-[#999A90] mb-5 font-sans">
        No supported video files (.mp4, .mkv, .avi, .mov, .webm, .m4v) found in <code>{status?.directoryPath}</code>.
      </p>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#C5E86C] hover:bg-[#D4F285] text-[#111210] text-xs font-mono font-semibold rounded-xs transition-colors disabled:opacity-40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>RESCAN ARCHIVE</span>
      </button>
    </div>
  );
};
