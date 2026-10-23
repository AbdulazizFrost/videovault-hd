import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Terminal, RefreshCw } from 'lucide-react';
import { SystemResponse } from '../types';
import { fetchSystemInfo } from '../services/api';

interface SystemInfoModalProps {
  onClose: () => void;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({ onClose }) => {
  const [data, setData] = useState<SystemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchSystemInfo();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Не удалось связаться с локальным API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-[#141512] border border-[#34352F] rounded-xs shadow-2xl p-5 font-mono text-xs text-[#F0EFE8]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#34352F]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#C5E86C]" />
            <span className="font-bold tracking-wider uppercase text-[#F0EFE8]">
              SYSTEM CONSOLE / DIAGNOSTICS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#999A90] hover:text-[#F0EFE8] border border-[#34352F] hover:border-[#999A90] rounded-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3">
          {loading ? (
            <div className="py-8 flex items-center justify-center space-x-2 text-[#999A90]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C5E86C]" />
              <span>Querying local daemon...</span>
            </div>
          ) : error ? (
            <div className="p-3 border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <div className="space-y-3">
              {/* Target folder */}
              <div className="border border-[#34352F] p-3 bg-[#191A17] space-y-1">
                <div className="text-[10px] text-[#999A90] uppercase tracking-wider flex items-center justify-between">
                  <span>Target Volume</span>
                  {data.config.videoDirectoryExists ? (
                    <span className="text-[#C5E86C] flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ATTACHED</span>
                    </span>
                  ) : (
                    <span className="text-rose-400">UNAVAILABLE</span>
                  )}
                </div>
                <div className="p-2 bg-[#111210] border border-[#34352F] text-[11px] text-[#F0EFE8] break-all">
                  {data.config.videoDirectory}
                </div>
              </div>

              {/* FFmpeg status */}
              <div className="border border-[#34352F] p-3 bg-[#191A17] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#999A90] uppercase tracking-wider">FFmpeg Engine</div>
                  <div className="text-[11px] text-[#999A90] truncate max-w-xs">{data.config.ffmpegPath}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                  data.config.ffmpegAvailable
                    ? 'border-[#C5E86C]/40 text-[#C5E86C] bg-[#C5E86C]/10'
                    : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                }`}>
                  {data.config.ffmpegAvailable ? 'AVAILABLE' : 'ABSENT'}
                </span>
              </div>

              {/* Hardware / Runtime Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="border border-[#34352F] p-2 bg-[#191A17]">
                  <span className="text-[10px] text-[#999A90] block uppercase">Platform</span>
                  <span className="text-[#F0EFE8] font-bold">{data.system.platform} {data.system.release}</span>
                </div>
                <div className="border border-[#34352F] p-2 bg-[#191A17]">
                  <span className="text-[10px] text-[#999A90] block uppercase">Node.js</span>
                  <span className="text-[#F0EFE8] font-bold">{data.system.nodeVersion}</span>
                </div>
                <div className="border border-[#34352F] p-2 bg-[#191A17]">
                  <span className="text-[10px] text-[#999A90] block uppercase">Heap Memory</span>
                  <span className="text-[#C5E86C] font-bold">{data.system.memoryUsageMb} MB</span>
                </div>
                <div className="border border-[#34352F] p-2 bg-[#191A17]">
                  <span className="text-[10px] text-[#999A90] block uppercase">Uptime</span>
                  <span className="text-[#F0EFE8] font-bold">{Math.floor(data.system.uptimeSeconds / 60)} min</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#34352F] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#22231F] hover:bg-[#282A25] border border-[#34352F] hover:border-[#999A90] text-xs font-mono uppercase text-[#F0EFE8] rounded-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
