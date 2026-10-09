import React, { createContext, useContext, useEffect, useState } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  pendingOperations: any[];
  addToQueue: (op: any) => void;
}

const OfflineContext = createContext<OfflineContextType>({} as OfflineContextType);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (op: any) => setPendingOperations(prev => [...prev, op]);

  return <OfflineContext.Provider value={{ isOnline, pendingOperations, addToQueue }}>{children}</OfflineContext.Provider>;
}

export const useOffline = () => useContext(OfflineContext);
