import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Sitemap & Robots Verification', () => {
  const repoRoot = process.cwd();
  const sitemapPath = path.join(repoRoot, 'public', 'sitemap.xml');
  const robotsPath = path.join(repoRoot, 'public', 'robots.txt');
  const catalogPath = path.join(repoRoot, 'src', 'data', 'catalog.generated.json');

  it('verifies generated sitemap.xml exists and is non-empty', () => {
    expect(fs.existsSync(sitemapPath)).toBe(true);
    const content = fs.readFileSync(sitemapPath, 'utf8');
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it('verifies sitemap contains canonical https://oilganic.az domain and all products', () => {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const catalogRaw = fs.readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(catalogRaw);

    expect(catalog.products.length).toBe(172);

    for (const product of catalog.products) {
      const productUrl = `<loc>https://oilganic.az/products/${product.slug}</loc>`;
      expect(sitemapContent).toContain(productUrl);
    }
  });

  it('verifies sitemap URLs exclude admin, login, 404, query strings, and localhost', () => {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const urls = Array.from(sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)).map(m => m[1]);

    expect(urls.length).toBeGreaterThan(172);

    for (const url of urls) {
      expect(url).not.toContain('/admin');
      expect(url).not.toContain('/404');
      expect(url).not.toContain('localhost');
      expect(url).not.toContain('netlify');
      expect(url).not.toContain('?');
      expect(url).not.toContain('#');
      expect(url.startsWith('https://oilganic.az')).toBe(true);
    }
  });

  it('verifies robots.txt disallows admin routes and references sitemap.xml', () => {
    expect(fs.existsSync(robotsPath)).toBe(true);
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    expect(robotsContent).toContain('User-agent: *');
    expect(robotsContent).toContain('Disallow: /admin/');
    expect(robotsContent).toContain('Sitemap: https://oilganic.az/sitemap.xml');
  });
});
