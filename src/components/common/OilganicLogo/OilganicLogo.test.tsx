import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OilganicLogo } from './OilganicLogo';
import { OilganicEmblemSVG, OilganicLogoSVG } from './OilganicLogoSVG';

describe('OilganicLogo Components', () => {
  it('renders OilganicEmblemSVG with correct viewBox and elements', () => {
    const { container } = render(<OilganicEmblemSVG size={100} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 512 512');
    expect(svg?.getAttribute('width')).toBe('100');
  });

  it('renders OilganicLogo in SVG mode by default', () => {
    render(<OilganicLogo variant="header" theme="light" />);
    const imgElement = screen.getByRole('img', { name: /Oilganic/i });
    expect(imgElement).toBeInTheDocument();
  });

  it('renders OilganicLogo in PNG mode when specified', () => {
    const { container } = render(<OilganicLogo mode="png" theme="light" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/brand/oilganic-logo-official.png');
  });

  it('renders OilganicLogo in PNG mode for dark theme', () => {
    const { container } = render(<OilganicLogo mode="png" theme="dark" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/brand/oilganic-logo-official-dark.png');
  });

  it('renders symbol variant correctly', () => {
    const { container } = render(<OilganicLogoSVG variant="symbol" size={80} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 512 512');
  });
});
