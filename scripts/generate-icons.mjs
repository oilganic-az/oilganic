import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = process.cwd();
const markSvgPath = path.join(repoRoot, 'public', 'brand', 'oilganic-mark.svg');

const iconsDir = path.join(repoRoot, 'public', 'icons');
const publicDir = path.join(repoRoot, 'public');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Copy mark SVG as public/favicon.svg
fs.copyFileSync(markSvgPath, path.join(publicDir, 'favicon.svg'));
console.log('✓ Created public/favicon.svg');

const markSvgBuffer = fs.readFileSync(markSvgPath);

// Helper to create transparent PNG icon of specific size
async function createPngIcon(size, outputPath) {
  await sharp(markSvgBuffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outputPath);
  console.log(`✓ Created ${path.relative(repoRoot, outputPath)} (${size}x${size})`);
}

// Helper to create maskable PNG icon (with safe zone padding)
// Safe zone for maskable icons is minimum 80% circle, so 10% padding on each side
async function createMaskableIcon(size, outputPath) {
  const padding = Math.round(size * 0.1);
  const innerSize = size - padding * 2;

  const resizedInner = await sharp(markSvgBuffer)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 3, g: 58, b: 37, alpha: 1 } // #033A25 official brand background
    }
  })
    .composite([{ input: resizedInner, left: padding, top: padding }])
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${path.relative(repoRoot, outputPath)} (maskable ${size}x${size})`);
}

// Create standard icons
await createPngIcon(16, path.join(iconsDir, 'favicon-16x16.png'));
await createPngIcon(32, path.join(iconsDir, 'favicon-32x32.png'));
await createPngIcon(48, path.join(iconsDir, 'favicon-48x48.png'));
await createPngIcon(96, path.join(iconsDir, 'icon-96x96.png'));
await createPngIcon(180, path.join(iconsDir, 'apple-touch-icon-180x180.png'));
await createPngIcon(192, path.join(iconsDir, 'icon-192x192.png'));
await createPngIcon(512, path.join(iconsDir, 'icon-512x512.png'));

// Create maskable icons
await createMaskableIcon(192, path.join(iconsDir, 'icon-maskable-192x192.png'));
await createMaskableIcon(512, path.join(iconsDir, 'icon-maskable-512x512.png'));

// Create multi-resolution ICO file containing 16x16, 32x32, 48x48 PNG frames
function buildIcoBuffer(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const directorySize = 16 * numImages;
  let currentDataOffset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(numImages, 4);

  const directoryEntries = [];
  const imageBuffers = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image size
    entry.writeUInt32LE(currentDataOffset, 12); // Data offset

    directoryEntries.push(entry);
    imageBuffers.push(buffer);

    currentDataOffset += buffer.length;
  }

  return Buffer.concat([header, ...directoryEntries, ...imageBuffers]);
}

const png16 = await fs.promises.readFile(path.join(iconsDir, 'favicon-16x16.png'));
const png32 = await fs.promises.readFile(path.join(iconsDir, 'favicon-32x32.png'));
const png48 = await fs.promises.readFile(path.join(iconsDir, 'favicon-48x48.png'));

const icoBuffer = buildIcoBuffer([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 }
]);

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('✓ Created public/favicon.ico (16x16, 32x32, 48x48)');

// Generate Open Graph image (1200x630)
async function createOgImage(outputPath) {
  const width = 1200;
  const height = 630;

  const markInnerSvg = `
    <g transform="translate(740, 65) scale(0.95)">
      <path d="M431 394C329.5 526 153.43 476.774 98 421C16.0093 338.5 8.9998 218 65.4998 137C147.587 91.2026 187.701 93.6415 254.5 137C254.5 137 150 99.5 83.5 191C73.313 205.017 14.0003 303.5 107.5 403C218.077 495.259 363.5 409.5 369 292.5C398.5 373 431 394 431 394Z" fill="#2F7D32"/>
      <path d="M294 74.9992C271 66.4992 471.224 151.043 435 374.501C392 381 324 -8 82.5 113C234 -89.4996 581 104 448 374.501C470 169.5 317 83.4993 294 74.9992Z" fill="#81C784"/>
    </g>
  `;

  const ogSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#033A25" />
          <stop offset="60%" stop-color="#0A4D33" />
          <stop offset="100%" stop-color="#145E41" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#81C784" />
          <stop offset="100%" stop-color="#A5D6A7" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Subtle background graphic -->
      ${markInnerSvg}

      <!-- Header badge -->
      <rect x="80" y="80" width="170" height="38" rx="19" fill="#2F7D32" fill-opacity="0.5" stroke="#81C784" stroke-width="1.5" />
      <text x="165" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#E8F5E9" text-anchor="middle" letter-spacing="1">OILGANIC.AZ</text>

      <!-- Main Title -->
      <text x="80" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1">Oilganic</text>

      <!-- Subtitle -->
      <text x="80" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="700" fill="url(#goldGrad)">Təbii yağlar və əzmələr</text>

      <!-- Description -->
      <text x="80" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#C8E6C9">Soyuq sıxım təbii yağlar, çərəz əzmələri, bal, bəhməz və bitki çayları.</text>
      <text x="80" y="410" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#C8E6C9">Gözünüzün qarşısında hazırlanır — %100 təbii və keyfiyyətli.</text>

      <!-- Footer features badge list -->
      <rect x="80" y="490" width="220" height="48" rx="24" fill="#032D1C" />
      <text x="190" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#A5D6A7" text-anchor="middle">🌱 100% Təbii</text>

      <rect x="320" y="490" width="250" height="48" rx="24" fill="#032D1C" />
      <text x="445" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#A5D6A7" text-anchor="middle">⚡ Soyuq Sıxım Yağlar</text>

      <rect x="590" y="490" width="220" height="48" rx="24" fill="#032D1C" />
      <text x="700" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#A5D6A7" text-anchor="middle">📍 Bakı Şəhəri</text>
    </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${path.relative(repoRoot, outputPath)} (1200x630)`);
}

await createOgImage(path.join(publicDir, 'og-image.png'));
console.log('🎉 All icons and Open Graph image generated successfully!');
