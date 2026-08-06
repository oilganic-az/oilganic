import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Brand Icons and Manifest Verification', () => {
  const repoRoot = process.cwd();

  const requiredIconPaths = [
    'public/favicon.svg',
    'public/favicon.ico',
    'public/icons/favicon-16x16.png',
    'public/icons/favicon-32x32.png',
    'public/icons/favicon-48x48.png',
    'public/icons/icon-96x96.png',
    'public/icons/apple-touch-icon-180x180.png',
    'public/icons/icon-192x192.png',
    'public/icons/icon-512x512.png',
    'public/icons/icon-maskable-192x192.png',
    'public/icons/icon-maskable-512x512.png',
    'public/og-image.png'
  ];

  it('verifies all required icon files and OG image exist', () => {
    for (const relPath of requiredIconPaths) {
      const fullPath = path.join(repoRoot, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('verifies webmanifest contains required icon sizes and maskable purpose', () => {
    const manifestPath = path.join(repoRoot, 'public', 'site.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.name).toContain('Oilganic');
    expect(manifest.theme_color).toBe('#033A25');

    const iconSizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');

    const hasMaskable = manifest.icons.some((i: { purpose?: string }) => i.purpose?.includes('maskable'));
    expect(hasMaskable).toBe(true);
  });
});
