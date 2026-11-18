import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BrandMark from '../components/BrandMark';
import { BrandingProvider } from './BrandingContext';

describe('BrandingProvider', () => {
  afterEach(() => localStorage.clear());

  it('restaura a identidade salva e atualiza o título da página', () => {
    localStorage.setItem('branding', JSON.stringify({
      appName: 'Studio Aurora',
      primaryColor: '#BE123C',
      footerColor: '#1F2937',
      logoUrl: '',
    }));

    render(<BrandingProvider><BrandMark /></BrandingProvider>);

    expect(screen.getByText('Studio Aurora')).toBeInTheDocument();
    expect(document.title).toBe('Studio Aurora');
  });
});
