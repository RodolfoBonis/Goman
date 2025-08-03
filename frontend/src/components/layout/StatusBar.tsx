import React from 'react';
import { Wifi, WifiOff, Clock, HardDrive } from 'lucide-react';
import { useUIStore } from '@/store';
import { formatResponseTime, formatFileSize, cn } from '@/utils';

export const StatusBar: React.FC = () => {
  const { lastResponse, isExecutingRequest } = useUIStore();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getResponseSize = () => {
    if (!lastResponse) return 0;
    return new Blob([lastResponse.body]).size;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600 z-40">
      {/* Left Section - Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-500" />
              <span>Offline</span>
            </>
          )}
        </div>

        {isExecutingRequest && (
          <div className="flex items-center gap-1 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span>Sending request...</span>
          </div>
        )}
      </div>

      {/* Center Section - Request Stats */}
      {lastResponse && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatResponseTime(lastResponse.responseTime)}</span>
          </div>

          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(getResponseSize())}</span>
          </div>

          <div className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            lastResponse.status >= 200 && lastResponse.status < 300
              ? 'bg-green-100 text-green-700'
              : lastResponse.status >= 400
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          )}>
            {lastResponse.statusText}
          </div>
        </div>
      )}

      {/* Right Section - Shortcuts */}
      <div className="flex items-center gap-4">
        <span>⌘+Enter Send</span>
        <span>⌘+S Save</span>
        <span>⌘+/ Search</span>
      </div>
    </div>
  );
};