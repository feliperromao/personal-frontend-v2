import { describe, expect, it } from 'vitest';
import { resolveVideoSource } from './VideoCard';

describe('player de vídeo do exercício', () => {
  it.each([
    ['https://www.youtube.com/shorts/hlV6f0kHmeo', 'https://www.youtube-nocookie.com/embed/hlV6f0kHmeo?rel=0'],
    ['https://www.youtube.com/watch?v=UHa9U-O09_U', 'https://www.youtube-nocookie.com/embed/UHa9U-O09_U?rel=0'],
    ['https://youtu.be/hlV6f0kHmeo', 'https://www.youtube-nocookie.com/embed/hlV6f0kHmeo?rel=0'],
    ['https://drive.google.com/file/d/file_123/view', 'https://drive.google.com/file/d/file_123/preview'],
    ['https://vimeo.com/123456789', 'https://player.vimeo.com/video/123456789'],
  ])('converte %s para uma URL incorporável', (url, embedUrl) => {
    expect(resolveVideoSource(url)).toMatchObject({ kind: 'iframe', embedUrl });
  });

  it('usa o elemento de vídeo para um arquivo MP4', () => {
    expect(resolveVideoSource('https://cdn.example.com/videos/agachamento.mp4')).toMatchObject({
      kind: 'file',
      embedUrl: 'https://cdn.example.com/videos/agachamento.mp4',
    });
  });

  it('oferece abertura externa para um provedor desconhecido e rejeita protocolo inseguro', () => {
    expect(resolveVideoSource('https://videos.example.com/aula/123')).toMatchObject({ kind: 'external' });
    expect(resolveVideoSource('javascript:alert(1)')).toEqual({ kind: 'unavailable' });
  });
});
