import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface OnlineStatus {
  online: boolean;
  lastChangedAt: number;
}

export interface InstallPromptState {
  canInstall: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  dismissed: boolean;
}

interface PwaContextValue extends OnlineStatus, InstallPromptState {
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  dismissInstall: () => void;
}

const PwaContext = createContext<PwaContextValue | null>(null);

const isRunningStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

export function PwaProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [lastChangedAt, setLastChangedAt] = useState(Date.now());
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setStandalone] = useState(isRunningStandalone);
  const [dismissed, setDismissed] = useState(localStorage.getItem('install-prompt-dismissed') === '1');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handleOnline = () => { setOnline(true); setLastChangedAt(Date.now()); };
    const handleOffline = () => { setOnline(false); setLastChangedAt(Date.now()); };
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => { setInstallEvent(null); setStandalone(true); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent) return 'unavailable' as const;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    return outcome;
  }, [installEvent]);

  const dismissInstall = useCallback(() => {
    localStorage.setItem('install-prompt-dismissed', '1');
    localStorage.removeItem('install-prompt-pending');
    setDismissed(true);
  }, []);

  const value = useMemo(() => ({
    online,
    lastChangedAt,
    canInstall: Boolean(installEvent),
    isIOS,
    isStandalone,
    dismissed,
    promptInstall,
    dismissInstall,
  }), [dismissed, installEvent, isIOS, isStandalone, lastChangedAt, online, promptInstall, dismissInstall]);

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwa deve ser usado dentro de PwaProvider');
  return context;
}
