import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineAlert() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 z-50 animate-bounce">
      <div className="glass bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xl max-w-sm">
        <div className="bg-red-500/20 p-2 rounded-xl text-red-400">
          <WifiOff className="h-5 w-5" />
        </div>
        <div className="text-left">
          <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
            Network Disconnected <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          </h5>
          <p className="text-[11px] text-red-200/75 mt-0.5 leading-normal">
            You are currently browsing offline. Cart changes will persist locally, but checkouts are disabled until online.
          </p>
        </div>
      </div>
    </div>
  );
}
