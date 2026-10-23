import React, { useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface ToastProps {
  message: string;
  subMessage?: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  subMessage,
  onClose,
  duration = 3500
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#191A17] border border-[#34352F] p-3 rounded-xs shadow-2xl flex items-start space-x-2.5 max-w-sm select-none font-mono text-xs">
        <div className="p-1 border border-[#C5E86C]/40 text-[#C5E86C] bg-[#C5E86C]/10 shrink-0">
          <Download className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <p className="font-semibold text-[#F0EFE8] uppercase tracking-wider text-[11px] truncate">
            {message}
          </p>
          {subMessage && (
            <p className="text-[11px] text-[#999A90] font-sans truncate mt-0.5">
              {subMessage}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#999A90] hover:text-[#F0EFE8] transition-colors p-0.5"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
