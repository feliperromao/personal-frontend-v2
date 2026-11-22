import { useMemo, useState } from 'react';
import { ExpandLess, ExpandMore, OpenInNew, PlayCircleOutline } from '@mui/icons-material';
import { Alert, Box, Button, Collapse, Stack, Typography } from '@mui/material';
import { tokens } from '../../theme';

interface VideoCardProps {
  url: string;
  title?: string;
  collapsible?: boolean;
}

export type VideoSource =
  | { kind: 'iframe'; embedUrl: string; originalUrl: string; provider: string }
  | { kind: 'file'; embedUrl: string; originalUrl: string; provider: string }
  | { kind: 'external'; originalUrl: string; provider: string }
  | { kind: 'unavailable' };

const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);
const driveHosts = new Set(['drive.google.com', 'docs.google.com']);
const vimeoHosts = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
const directVideoExtensions = /\.(mp4|webm|ogg|mov)$/i;

function validYouTubeId(value: string | null | undefined) {
  return value && /^[a-zA-Z0-9_-]{11}$/.test(value) ? value : null;
}

export function resolveVideoSource(rawUrl: string): VideoSource {
  try {
    const parsed = new URL(rawUrl.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return { kind: 'unavailable' };
    const hostname = parsed.hostname.toLowerCase();
    const parts = parsed.pathname.split('/').filter(Boolean);

    if (youtubeHosts.has(hostname)) {
      const candidate = hostname === 'youtu.be'
        ? parts[0]
        : parsed.pathname === '/watch'
          ? parsed.searchParams.get('v')
          : ['embed', 'shorts', 'live'].includes(parts[0])
            ? parts[1]
            : null;
      const id = validYouTubeId(candidate);
      if (id) {
        return {
          kind: 'iframe',
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
          originalUrl: parsed.toString(),
          provider: 'YouTube',
        };
      }
    }

    if (driveHosts.has(hostname)) {
      const fileIndex = parts.indexOf('d');
      const id = fileIndex >= 0 ? parts[fileIndex + 1] : parsed.searchParams.get('id');
      if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
        return {
          kind: 'iframe',
          embedUrl: `https://drive.google.com/file/d/${id}/preview`,
          originalUrl: parsed.toString(),
          provider: 'Google Drive',
        };
      }
    }

    if (vimeoHosts.has(hostname)) {
      const id = [...parts].reverse().find((part) => /^\d+$/.test(part));
      if (id) {
        return {
          kind: 'iframe',
          embedUrl: `https://player.vimeo.com/video/${id}`,
          originalUrl: parsed.toString(),
          provider: 'Vimeo',
        };
      }
    }

    if (directVideoExtensions.test(parsed.pathname)) {
      return { kind: 'file', embedUrl: parsed.toString(), originalUrl: parsed.toString(), provider: 'Arquivo de vídeo' };
    }

    return { kind: 'external', originalUrl: parsed.toString(), provider: hostname };
  } catch {
    return { kind: 'unavailable' };
  }
}

export default function VideoCard({ url, title = 'exercício', collapsible = false }: VideoCardProps) {
  const source = useMemo(() => resolveVideoSource(url), [url]);
  const [expanded, setExpanded] = useState(!collapsible);
  const accessibleTitle = `Demonstração em vídeo: ${title}`;
  const contentId = `exercise-video-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'preview'}`;

  if (source.kind === 'unavailable') {
    return <Alert severity="warning">O endereço do vídeo é inválido. Avise seu personal para atualizar o exercício.</Alert>;
  }

  if (source.kind === 'external') {
    return (
      <Alert
        severity="info"
        icon={<PlayCircleOutline />}
        action={
          <Button component="a" href={source.originalUrl} target="_blank" rel="noopener noreferrer" color="inherit" startIcon={<OpenInNew />}>
            Abrir
          </Button>
        }
      >
        Este provedor não permite reprodução dentro do aplicativo. Abra o vídeo em uma nova aba.
      </Alert>
    );
  }

  return (
    <Box component="section" aria-label={accessibleTitle} sx={{ mt: 2 }}>
      {collapsible ? (
        <Button
          fullWidth
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={contentId}
          startIcon={<PlayCircleOutline />}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{
            minHeight: 56,
            px: 0,
            justifyContent: 'flex-start',
            borderBlock: `1px solid ${tokens.color.line}`,
            borderRadius: 0,
            '& .MuiButton-endIcon': { ml: 'auto' },
          }}
        >
          <Box component="span" sx={{ display: 'block', minWidth: 0, textAlign: 'left' }}>
            <Typography component="span" variant="h5" sx={{ display: 'block' }}>Demonstração em vídeo</Typography>
            <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
              {expanded ? 'Ocultar demonstração' : `Reprodução via ${source.provider}`}
            </Typography>
          </Box>
        </Button>
      ) : (
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 1 }}>
          <Box minWidth={0}>
            <Typography component="h3" variant="h5">Demonstração em vídeo</Typography>
            <Typography variant="body2" color="text.secondary">Reprodução via {source.provider}</Typography>
          </Box>
          <Button
            component="a"
            href={source.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<OpenInNew />}
            aria-label={`Abrir vídeo de ${title} em nova aba`}
            sx={{ flexShrink: 0 }}
          >
            Abrir
          </Button>
        </Stack>
      )}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box id={contentId} sx={{ pt: collapsible ? 1 : 0 }}>
          {collapsible && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button
                component="a"
                href={source.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                startIcon={<OpenInNew />}
                aria-label={`Abrir vídeo de ${title} em nova aba`}
              >
                Abrir em nova aba
              </Button>
            </Stack>
          )}
          <Box sx={{ aspectRatio: '16 / 9', bgcolor: tokens.color.ink, borderRadius: 2, overflow: 'hidden' }}>
            {source.kind === 'file' ? (
              <Box
                component="video"
                src={source.embedUrl}
                title={accessibleTitle}
                controls
                playsInline
                preload="metadata"
                sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
              >
                Seu navegador não consegue reproduzir este vídeo.
              </Box>
            ) : (
              <Box
                component="iframe"
                src={source.embedUrl}
                title={accessibleTitle}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sx={{ width: '100%', height: '100%', display: 'block', border: 0 }}
              />
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
