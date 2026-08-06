import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const origin = 'https://oilganic.az';
const catalogPath = path.join(repoRoot, 'src', 'data', 'catalog.generated.json');
const outputPath = path.join(repoRoot, 'public', 'sitemap.xml');

function fail(msg) {
  console.error(`❌ Sitemap Generation Error: ${msg}`);
  process.exit(1);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

if (!fs.existsSync(catalogPath)) {
  fail(`Catalog file not found: ${catalogPath}`);
}

const catalogRaw = fs.readFileSync(catalogPath, 'utf8');
let catalog;
try {
  catalog = JSON.parse(catalogRaw);
} catch (e) {
  fail(`Invalid catalog JSON: ${e.message}`);
}

const products = catalog.products || [];
assert(Array.isArray(products) && products.length > 0, 'Catalog products array is empty or invalid.');

const staticRoutes = [
  '/',
  '/products',
  '/campaigns',
  '/process',
  '/about',
  '/delivery',
  '/contact',
  '/privacy',
  '/terms'
];

const urls = new Set();
const seenSlugs = new Set();

for (const route of staticRoutes) {
  const fullUrl = `${origin}${route}`;
  assert(!urls.has(fullUrl), `Duplicate static route: ${fullUrl}`);
  urls.add(fullUrl);
}

for (const [index, product] of products.entries()) {
  const slug = product.slug;
  assert(typeof slug === 'string' && slug.trim(), `Product at index ${index} missing valid slug.`);
  assert(!slug.includes('?') && !slug.includes('#'), `Product slug contains query/hash: ${slug}`);
  assert(!slug.startsWith('/admin'), `Product slug cannot start with /admin: ${slug}`);
  assert(!seenSlugs.has(slug), `Duplicate product slug found: ${slug}`);

  seenSlugs.add(slug);
  urls.add(`${origin}/products/${slug}`);
}

const urlList = Array.from(urls);

// Verify no admin, login, or 404 URLs leak in
for (const url of urlList) {
  assert(!url.includes('/admin'), `Forbidden admin URL in sitemap: ${url}`);
  assert(!url.includes('/404'), `Forbidden 404 URL in sitemap: ${url}`);
  assert(!url.includes('?'), `Query parameter found in sitemap URL: ${url}`);
  assert(!url.includes('#'), `Hash anchor found in sitemap URL: ${url}`);
}

const xmlEntries = urlList
  .map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`)
  .join('\n');

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, xmlContent, 'utf8');

console.log(
  JSON.stringify(
    {
      status: 'PASS',
      origin,
      staticRoutes: staticRoutes.length,
      productUrls: products.length,
      totalSitemapUrls: urlList.length,
      outputPath: path.relative(repoRoot, outputPath)
    },
    null,
    2
  )
);
