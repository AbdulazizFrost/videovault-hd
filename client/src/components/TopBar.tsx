import React from 'react';
import { RefreshCw, Terminal, Menu, X } from 'lucide-react';
import { LibraryStatus } from '../types';

interface TopBarProps {
  status: LibraryStatus | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSystemInfo: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  status,
  isRefreshing,
  onRefresh,
  onOpenSystemInfo,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const isOnline = status?.directoryExists ?? false;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111210] border-b border-[#34352F] select-none">
      <div className="w-full px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Left: Brand / Editorial Mark */}
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 text-[#999A90] hover:text-[#F0EFE8] border border-[#34352F] hover:border-[#999A90] transition-colors"
            title="Меню архива"
            aria-label="Переключить боковое меню"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#F0EFE8]">
              VV <span className="text-[#34352F]">/</span> ARCHIVE
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] text-[#999A90] px-1.5 py-0.5 border border-[#34352F] rounded-xs">
              v1.0.4
            </span>
          </div>
        </div>

        {/* Right: Storage status & Actions */}
        <div className="flex items-center space-x-3">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 px-2 py-1 border border-[#34352F] rounded-xs bg-[#191A17] text-[11px] font-mono">
            <span className="relative flex h-1.5 w-1.5">
              {isOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5E86C] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C5E86C]" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
              )}
            </span>
            <span className="text-[#999A90] uppercase tracking-wider text-[10px]">
              {isOnline ? 'LOCAL STORAGE' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Rescan Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase text-[#F0EFE8] bg-[#191A17] hover:bg-[#22231F] border border-[#34352F] hover:border-[#999A90] rounded-xs transition-colors disabled:opacity-40"
            title="Пересканировать директорию видео"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#C5E86C]' : 'text-[#999A90]'}`} />
            <span>{isRefreshing ? 'SCANNING' : 'RESCAN'}</span>
          </button>

          {/* Diagnostics / System */}
          <button
            onClick={onOpenSystemInfo}
            className="flex items-center space-x-1 px-2 py-1 text-[11px] font-mono tracking-wider uppercase text-[#999A90] hover:text-[#F0EFE8] bg-[#191A17] hover:bg-[#22231F] border border-[#34352F] hover:border-[#999A90] rounded-xs transition-colors"
            title="Диагностика системы"
          >
            <Terminal className="w-3 h-3" />
            <span className="hidden sm:inline">SYSTEM</span>
          </button>
        </div>
      </div>
    </header>
  );
};
