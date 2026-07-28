// Script: inject-wolt-urls.mjs
// Reads the Wolt catalog and replaces the generic woltUrl in products.ts
// with the real direct product-level Wolt URLs

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const woltData = JSON.parse(readFileSync('D:/Downloads/oilganic-wolt-catalog.json', 'utf8'));
const productsPath = path.join(__dirname, '../src/data/products.ts');
let productsTs = readFileSync(productsPath, 'utf8');

const GENERIC_WOLT = 'https://wolt.com/en/aze/baku/venue/oilganic-shop';

// Build a map: various name forms -> Wolt direct URL
const woltMap = new Map();
woltData.products.forEach(p => {
  const name = p.product.toLowerCase().trim();
  woltMap.set(name, p.productUrl);
  // Also store without size suffix
  const base = name
    .replace(/\s*(100\s*gr|250\s*gr|500\s*gr|1\s*kg|200\s*gr|50\s*gr|100\s*ml|250\s*ml|500\s*ml|1\s*l|100\s*ədəd|180\s*ədəd|220\s*əd|100\s*kapsul|180\s*kapsul)\s*/gi, '')
    .trim();
  if (base !== name) woltMap.set(base, p.productUrl);
});

// Find all product blocks using regex on the TypeScript source
// Match each product object by finding "name" field followed eventually by woltUrl
let matchCount = 0;
let missCount = 0;

const output = productsTs.replace(
  /"woltUrl":\s*"https:\/\/wolt\.com\/en\/aze\/baku\/venue\/oilganic-shop"/g,
  (fullMatch, offset) => {
    // Look backward for the nearest "name": "..." before this position
    const preceding = productsTs.substring(0, offset);
    const names = preceding.match(/"name":\s*"([^"]+)"/g);
    if (!names || names.length === 0) {
      missCount++;
      return fullMatch;
    }
    const lastNameMatch = names[names.length - 1].match(/"name":\s*"([^"]+)"/);
    if (!lastNameMatch) {
      missCount++;
      return fullMatch;
    }
    
    const productName = lastNameMatch[1];
    const nameLower = productName.toLowerCase().trim();
    const nameBase = nameLower
      .replace(/\s*(100\s*gr|250\s*gr|500\s*gr|1\s*kg|200\s*gr|50\s*gr|100\s*ml|250\s*ml|500\s*ml|1\s*l)\s*/gi, '')
      .trim();

    let woltUrl = woltMap.get(nameLower) || woltMap.get(nameBase);

    if (!woltUrl) {
      // Partial match fallback
      for (const [key, url] of woltMap) {
        const keyBase = key.replace(/\s*(100\s*gr|250\s*gr|500\s*gr|1\s*kg|200\s*gr|50\s*gr|100\s*ml|250\s*ml|500\s*ml|1\s*l)\s*/gi, '').trim();
        if (keyBase === nameBase) { woltUrl = url; break; }
        if (keyBase.length > 4 && nameBase.includes(keyBase)) { woltUrl = url; break; }
        if (nameBase.length > 4 && keyBase.includes(nameBase)) { woltUrl = url; break; }
      }
    }

    if (woltUrl) {
      matchCount++;
      return `"woltUrl": "${woltUrl}"`;
    } else {
      missCount++;
      return fullMatch;
    }
  }
);

writeFileSync(productsPath, output);
console.log(`Done. Replaced: ${matchCount} | Could not match (kept generic): ${missCount}`);
