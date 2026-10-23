import React, { useEffect, useMemo, useState } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { VideoCard } from './components/VideoCard';
import { VideoListRow } from './components/VideoListRow';
import { VideoModal } from './components/VideoModal';
import { SystemInfoModal } from './components/SystemInfoModal';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import { fetchVideos, refreshVideos } from './services/api';
import { VideoItem, LibraryStatus, SortOption, ViewMode, LibraryFilterView } from './types';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [status, setStatus] = useState<LibraryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & State
  const [activeView, setActiveView] = useState<LibraryFilterView>('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals & Panels
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  // Load videos on startup
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await fetchVideos();
      setVideos(data.videos);
      setStatus(data.status);
    } catch (err: any) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await refreshVideos();
      setVideos(data.videos);
      setStatus(data.status);
      setToast({
        message: 'ARCHIVE RESCANNED',
        subMessage: `${data.videos.length} videos indexed`
      });
    } catch (err: any) {
      console.error('Failed to refresh:', err);
      setToast({
        message: 'SCAN ERROR',
        subMessage: err?.message || 'Could not communicate with local daemon'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = (video: VideoItem) => {
    // Initiate direct lossless stream download
    const link = document.createElement('a');
    link.href = video.downloadUrl;
    link.setAttribute('download', video.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      message: 'DOWNLOADING RAW FILE',
      subMessage: `${video.filename} (${video.sizeFormatted})`
    });
  };

  // Filter & Sorting Logic
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((v) => v.filename.toLowerCase().includes(q));
    }

    // Filter by format
    if (selectedFormat !== 'all') {
      const fmt = selectedFormat.toLowerCase();
      result = result.filter(
        (v) => v.extension.toLowerCase().replace('.', '') === fmt
      );
    }

    // Filter by Library View: Recent (e.g. top recent by date)
    if (activeView === 'recent') {
      result.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
      return result;
    }

    // Regular Sort Options
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.mtime).getTime() - new Date(a.mtime).getTime();
        case 'date-asc':
          return new Date(a.mtime).getTime() - new Date(b.mtime).getTime();
        case 'size-desc':
          return b.sizeBytes - a.sizeBytes;
        case 'size-asc':
          return a.sizeBytes - b.sizeBytes;
        case 'name-asc':
          return a.filename.localeCompare(b.filename, 'ru', { numeric: true });
        case 'name-desc':
          return b.filename.localeCompare(a.filename, 'ru', { numeric: true });
        case 'duration-desc':
          return b.durationSeconds - a.durationSeconds;
        default:
          return 0;
      }
    });

    return result;
  }, [videos, searchQuery, selectedFormat, activeView, sortOption]);

  const hasSearchOrFilter = searchQuery.trim() !== '' || selectedFormat !== 'all' || activeView !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-[#111210] text-[#F0EFE8]">
      {/* Top Header */}
      <TopBar
        status={status}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenSystemInfo={() => setIsSystemInfoOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          status={status}
          videos={videos}
          activeView={activeView}
          onViewChange={setActiveView}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Catalog Main Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-[#111210]">
          <Toolbar
            status={status}
            filteredCount={filteredVideos.length}
            totalCount={videos.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Catalog Listing */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[#999A90] space-y-3 font-mono text-xs">
              <RefreshCw className="w-5 h-5 text-[#C5E86C] animate-spin" />
              <span>READING MEDIA VOLUME...</span>
            </div>
          ) : filteredVideos.length === 0 ? (
            <EmptyState
              status={status}
              hasSearchOrFilter={hasSearchOrFilter}
              onClearFilters={() => {
                setSearchQuery('');
                setSelectedFormat('all');
                setActiveView('all');
              }}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          ) : viewMode === 'grid' ? (
            /* Responsive Density Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={(v) => setSelectedVideo(v)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            /* Dense Technical Table View */
            <div className="space-y-1.5">
              {filteredVideos.map((video) => (
                <VideoListRow
                  key={video.id}
                  video={video}
                  onPlay={(v) => setSelectedVideo(v)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Video Inspection Deck (Modal) */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onDownload={handleDownload}
        />
      )}

      {/* System Diagnostics Console */}
      {isSystemInfoOpen && (
        <SystemInfoModal onClose={() => setIsSystemInfoOpen(false)} />
      )}

      {/* Technical Toast */}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
