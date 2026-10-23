import React from 'react';
import { Search, X, LayoutGrid, List, ArrowDownUp } from 'lucide-react';
import { SortOption, ViewMode, LibraryStatus } from '../types';

interface ToolbarProps {
  status: LibraryStatus | null;
  filteredCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  status,
  filteredCount,
  totalCount,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange
}) => {
  // Format last scanned date
  const lastScannedFormatted = React.useMemo(() => {
    if (!status?.lastScanned) return 'Just now';
    try {
      const d = new Date(status.lastScanned);
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  }, [status?.lastScanned]);

  return (
    <div className="mb-6 space-y-4">
      {/* Editorial Header */}
      <div className="border-b border-[#34352F] pb-4">
        <div className="text-[10px] font-mono tracking-widest text-[#999A90] uppercase mb-1">
          PERSONAL MEDIA ARCHIVE <span className="text-[#34352F]">•</span> LOCAL VOLUME
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F0EFE8]">
            Video library
          </h1>

          <div className="text-xs font-mono text-[#999A90] flex items-center space-x-3">
            <span>
              COUNT: <span className="text-[#F0EFE8] font-bold">{filteredCount}</span>
              {filteredCount !== totalCount && <span> OF {totalCount}</span>}
            </span>
            <span className="text-[#34352F]">|</span>
            <span>
              SCANNED: <span className="text-[#F0EFE8]">{lastScannedFormatted}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#999A90]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search archive by filename..."
            className="w-full pl-8 pr-8 py-1.5 bg-[#191A17] border border-[#34352F] text-xs font-mono text-[#F0EFE8] placeholder-[#999A90]/60 rounded-xs focus:outline-none focus:border-[#C5E86C] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#999A90] hover:text-[#F0EFE8]"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Sort dropdown */}
          <div className="relative flex items-center">
            <label htmlFor="archive-sort-select" className="sr-only">Сортировка видео</label>
            <div className="absolute left-2.5 text-[#999A90] pointer-events-none">
              <ArrowDownUp className="w-3 h-3" />
            </div>
            <select
              id="archive-sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="pl-7 pr-6 py-1.5 bg-[#191A17] border border-[#34352F] text-xs font-mono text-[#F0EFE8] rounded-xs focus:outline-none focus:border-[#C5E86C] transition-colors cursor-pointer appearance-none"
            >
              <option value="date-desc">DATE (NEWEST)</option>
              <option value="date-asc">DATE (OLDEST)</option>
              <option value="size-desc">SIZE (LARGEST)</option>
              <option value="size-asc">SIZE (SMALLEST)</option>
              <option value="name-asc">TITLE (A–Z)</option>
              <option value="name-desc">TITLE (Z–A)</option>
              <option value="duration-desc">DURATION (LONGEST)</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center border border-[#34352F] bg-[#191A17] rounded-xs p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#22231F] text-[#C5E86C]'
                  : 'text-[#999A90] hover:text-[#F0EFE8]'
              }`}
              title="Grid view"
              aria-label="Режим сетки"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#22231F] text-[#C5E86C]'
                  : 'text-[#999A90] hover:text-[#F0EFE8]'
              }`}
              title="List view"
              aria-label="Режим списка"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
