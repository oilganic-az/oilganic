import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Netlify SPA & Functions Configuration Tests', () => {
  it('verifies public/_redirects file exists and contains SPA rewrite rule', () => {
    const redirectsPath = path.resolve(__dirname, '../../../public/_redirects');
    expect(fs.existsSync(redirectsPath)).toBe(true);

    const content = fs.readFileSync(redirectsPath, 'utf-8');
    expect(content).toContain('/*  /index.html  200');
  });

  it('verifies netlify.toml exists and configures functions and SPA fallback', () => {
    const tomlPath = path.resolve(__dirname, '../../../netlify.toml');
    expect(fs.existsSync(tomlPath)).toBe(true);

    const content = fs.readFileSync(tomlPath, 'utf-8');
    expect(content).toContain('functions = "netlify/functions"');
    expect(content).toContain('from = "/*"');
    expect(content).toContain('to = "/index.html"');
  });

  it('verifies netlify/functions directory contains serverless functions', () => {
    const functionsDir = path.resolve(__dirname, '../../../netlify/functions');
    expect(fs.existsSync(functionsDir)).toBe(true);

    const healthFn = path.join(functionsDir, 'health.ts');
    const adminFn = path.join(functionsDir, 'admin-status.ts');
    expect(fs.existsSync(healthFn)).toBe(true);
    expect(fs.existsSync(adminFn)).toBe(true);
  });
});
