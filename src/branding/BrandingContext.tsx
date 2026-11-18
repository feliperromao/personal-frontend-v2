import { CssBaseline, ThemeProvider } from '@mui/material';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BrandingConfig } from '../domain/types';
import api from '../pages/@shared/api';
import { createAppTheme } from '../theme';

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'MyPersonal.App',
  primaryColor: '#5B21D1',
  footerColor: '#0B1226',
  logoUrl: '',
};

const STORAGE_KEY = 'branding';
const HEX_COLOR = /^#[0-9A-F]{6}$/i;

function normalizeBranding(value?: Partial<BrandingConfig> | null): BrandingConfig {
  const appName = value?.appName?.trim();
  return {
    appName: appName && appName.length <= 40 ? appName : DEFAULT_BRANDING.appName,
    primaryColor: HEX_COLOR.test(value?.primaryColor || '') ? value!.primaryColor! : DEFAULT_BRANDING.primaryColor,
    footerColor: HEX_COLOR.test(value?.footerColor || '') ? value!.footerColor! : DEFAULT_BRANDING.footerColor,
    logoUrl: typeof value?.logoUrl === 'string' ? value.logoUrl : '',
  };
}

function readStoredBranding(): BrandingConfig {
  try {
    return normalizeBranding(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return DEFAULT_BRANDING;
  }
}

interface BrandingContextValue {
  branding: BrandingConfig;
  applyBranding: (branding: BrandingConfig) => void;
  refreshBranding: () => Promise<void>;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: DEFAULT_BRANDING,
  applyBranding: () => undefined,
  refreshBranding: async () => undefined,
  resetBranding: () => undefined,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(readStoredBranding);

  const applyBranding = useCallback((nextBranding: BrandingConfig) => {
    const normalized = normalizeBranding(nextBranding);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setBranding(normalized);
  }, []);

  const refreshBranding = useCallback(async () => {
    if (!localStorage.getItem('auth-token')) return;
    const { data } = await api.get<BrandingConfig>('/branding');
    applyBranding(data);
  }, [applyBranding]);

  const resetBranding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBranding(DEFAULT_BRANDING);
  }, []);

  useEffect(() => {
    refreshBranding().catch(() => undefined);
  }, [refreshBranding]);

  useEffect(() => {
    document.title = branding.appName;
  }, [branding.appName]);

  const theme = useMemo(() => createAppTheme(branding), [branding]);
  const value = useMemo(
    () => ({ branding, applyBranding, refreshBranding, resetBranding }),
    [applyBranding, branding, refreshBranding, resetBranding],
  );

  return (
    <BrandingContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
