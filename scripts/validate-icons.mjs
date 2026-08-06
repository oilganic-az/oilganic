import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = process.cwd();

function fail(msg) {
  console.error(`❌ Icon Validation Error: ${msg}`);
  process.exit(1);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

const requiredFiles = [
  { path: 'public/favicon.svg', type: 'svg' },
  { path: 'public/favicon.ico', type: 'ico' },
  { path: 'public/icons/favicon-16x16.png', type: 'png', width: 16, height: 16 },
  { path: 'public/icons/favicon-32x32.png', type: 'png', width: 32, height: 32 },
  { path: 'public/icons/favicon-48x48.png', type: 'png', width: 48, height: 48 },
  { path: 'public/icons/icon-96x96.png', type: 'png', width: 96, height: 96 },
  { path: 'public/icons/apple-touch-icon-180x180.png', type: 'png', width: 180, height: 180 },
  { path: 'public/icons/icon-192x192.png', type: 'png', width: 192, height: 192 },
  { path: 'public/icons/icon-512x512.png', type: 'png', width: 512, height: 512 },
  { path: 'public/icons/icon-maskable-192x192.png', type: 'png', width: 192, height: 192 },
  { path: 'public/icons/icon-maskable-512x512.png', type: 'png', width: 512, height: 512 },
  { path: 'public/og-image.png', type: 'png', width: 1200, height: 630 }
];

console.log('🔍 Validating brand icons, favicons, and Open Graph assets...');

for (const file of requiredFiles) {
  const absolutePath = path.join(repoRoot, file.path);
  assert(fs.existsSync(absolutePath), `Tələb olunan fayl yoxdur: ${file.path}`);

  if (file.type === 'png') {
    const meta = await sharp(absolutePath).metadata();
    assert(
      meta.width === file.width && meta.height === file.height,
      `Ölçü uyğunsuzluğu ${file.path}: gözlənilən ${file.width}x${file.height}, fakti ${meta.width}x${meta.height}`
    );
  }
}

// Validate manifest
const manifestPath = path.join(repoRoot, 'public', 'site.webmanifest');
assert(fs.existsSync(manifestPath), 'public/site.webmanifest tapılmadı');

const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
let manifest;
try {
  manifest = JSON.parse(manifestRaw);
} catch (e) {
  fail(`Manifest parse olunmadı: ${e.message}`);
}

assert(Array.isArray(manifest.icons), 'Manifest daxilində icons massivi yoxdur');

const manifestSizes = manifest.icons.map(i => i.sizes);
assert(manifestSizes.includes('192x192'), 'Manifest-də 192x192 icon yoxdur');
assert(manifestSizes.includes('512x512'), 'Manifest-də 512x512 icon yoxdur');

const hasMaskable = manifest.icons.some(i => i.purpose?.includes('maskable'));
assert(hasMaskable, 'Manifest-də maskable icon yoxdur');

// Validate index.html references
const indexHtmlPath = path.join(repoRoot, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

assert(indexHtml.includes('rel="icon"') || indexHtml.includes("rel='icon'"), 'index.html rel="icon" tagı tapılmadı');
assert(indexHtml.includes('site.webmanifest'), 'index.html site.webmanifest linki tapılmadı');
assert(indexHtml.includes('theme-color'), 'index.html theme-color meta tagı tapılmadı');

console.log(
  JSON.stringify(
    {
      status: 'PASS',
      validatedFiles: requiredFiles.length,
      ogImageDimensions: '1200x630',
      manifestIcons: manifest.icons.length
    },
    null,
    2
  )
);
