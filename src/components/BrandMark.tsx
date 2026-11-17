import { Box, Typography } from '@mui/material';

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export default function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  const ink = inverse ? '#FFFFFF' : '#0B1226';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.75, color: ink, minWidth: 0 }}>
      <Box
        component="svg"
        viewBox="0 0 48 40"
        aria-hidden="true"
        sx={{ width: 36, height: 30, flex: '0 0 auto' }}
      >
        <path d="M3 31 11 10h10l-8 21H3Z" fill="#5B21D1" />
        <path d="M17 31 25 4h10l-8 27H17Z" fill="#7A3CE0" />
        <path d="M31 31 39 0h8l-8 31h-8Z" fill={ink} />
      </Box>
      {!compact && (
        <Typography component="span" sx={{ fontWeight: 700, fontSize: '1.2rem', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
          MyPersonal.App
        </Typography>
      )}
    </Box>
  );
}
