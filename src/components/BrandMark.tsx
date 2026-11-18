import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useBranding } from '../branding/BrandingContext';
import { BrandingConfig } from '../domain/types';

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
  foregroundColor?: string;
  brandingOverride?: BrandingConfig;
}

export default function BrandMark({ compact = false, inverse = false, foregroundColor, brandingOverride }: BrandMarkProps) {
  const { branding: currentBranding } = useBranding();
  const branding = brandingOverride || currentBranding;
  const [logoFailed, setLogoFailed] = useState(false);
  const ink = foregroundColor || (inverse ? '#FFFFFF' : '#0B1226');

  useEffect(() => setLogoFailed(false), [branding.logoUrl]);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.75, color: ink, minWidth: 0 }}>
      {branding.logoUrl && !logoFailed ? (
        <Box
          component="img"
          src={branding.logoUrl}
          alt=""
          onError={() => setLogoFailed(true)}
          sx={{ width: 38, height: 38, objectFit: 'contain', flex: '0 0 auto' }}
        />
      ) : (
        <Box
          component="svg"
          viewBox="0 0 48 40"
          aria-hidden="true"
          sx={{ width: 36, height: 30, flex: '0 0 auto' }}
        >
          <path d="M3 31 11 10h10l-8 21H3Z" fill={branding.primaryColor} />
          <path d="M17 31 25 4h10l-8 27H17Z" fill={branding.primaryColor} opacity=".78" />
          <path d="M31 31 39 0h8l-8 31h-8Z" fill={ink} />
        </Box>
      )}
      {!compact && (
        <Typography component="span" sx={{ fontWeight: 700, fontSize: '1.2rem', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
          {branding.appName}
        </Typography>
      )}
    </Box>
  );
}
