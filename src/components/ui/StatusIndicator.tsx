import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';

export default function StatusIndicator() {
  const { isOnline, pendingOperations } = useOffline();
  
  return (
    <div className="flex items-center space-x-2">
      <span className="relative flex h-3 w-3">
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        )}
      </span>
      <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
        {isOnline ? 'Online' : 'Offline'} {pendingOperations.length > 0 && `(${pendingOperations.length} pending)`}
      </span>
    </div>
  );
}
