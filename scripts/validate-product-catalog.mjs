import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { PRODUCT_ID_ALIASES, PRODUCT_SLUG_ALIASES } from '../src/data/productAliases.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const PRODUCTS_PATH = path.join(projectRoot, 'src/data/products.ts');
const RAW_CLOPOS_PATH = path.join(projectRoot, 'data/clopos-products-raw.json');
const ACCOUNTING_PATH = path.join(projectRoot, 'data/clopos-source-accounting.json');
const IMAGE_MAP_PATH = path.join(projectRoot, 'data/clopos-image-map.json');
const MANUAL_REVIEW_PATH = path.join(projectRoot, 'data/clopos-manual-review.json');
const SYNC_DIFF_PATH = path.join(projectRoot, 'data/clopos-sync-diff.json');
const REPORT_MD_PATH = path.join(projectRoot, 'PRODUCT_CATALOG_SYNC_REPORT.md');

const VALID_CATEGORIES = new Set([
  'oils', 'pastes', 'sweeteners', 'beverages', 'teas',
  'seeds_flours', 'wellness', 'vinegars', 'mecunlar', 'spices', 'tablets_capsules'
]);

function main() {
  console.log('Validating catalog synchronization integrity...');
  const errors = [];

  // 1. Check file existence
  [PRODUCTS_PATH, RAW_CLOPOS_PATH, ACCOUNTING_PATH, IMAGE_MAP_PATH, MANUAL_REVIEW_PATH, SYNC_DIFF_PATH, REPORT_MD_PATH].forEach(p => {
    if (!fs.existsSync(p)) {
      errors.push(`Required data/report file missing: ${p}`);
    }
  });

  if (errors.length > 0) {
    console.error('Validation failed: missing files!');
    errors.forEach(e => console.error(`- ${e}`));
    process.exit(1);
  }

  // Load Products via VM
  const tsContent = fs.readFileSync(PRODUCTS_PATH, 'utf8');
  const jsContent = tsContent
    .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
    .replace(/:\s*Product\[\]/g, '')
    .replace(/export\s+/g, '') + '\nglobalThis.PRODUCTS = PRODUCTS;';

  const sandbox = {};
  vm.createContext(sandbox);
  try {
    new vm.Script(jsContent).runInContext(sandbox);
  } catch (err) {
    errors.push(`Failed to parse products.ts: ${err.message}`);
  }

  const products = sandbox.PRODUCTS || [];
  const rawData = JSON.parse(fs.readFileSync(RAW_CLOPOS_PATH, 'utf8'));
  const rawProducts = rawData.data.products || [];
  const sourceAccounting = JSON.parse(fs.readFileSync(ACCOUNTING_PATH, 'utf8'));
  const imageMap = JSON.parse(fs.readFileSync(IMAGE_MAP_PATH, 'utf8'));
  const manualReview = JSON.parse(fs.readFileSync(MANUAL_REVIEW_PATH, 'utf8'));
  const syncDiff = JSON.parse(fs.readFileSync(SYNC_DIFF_PATH, 'utf8'));
  const reportMd = fs.readFileSync(REPORT_MD_PATH, 'utf8');

  // Assert exactly 244 raw source records
  if (rawProducts.length !== 244) {
    errors.push(`Expected 244 raw Clopos records, found ${rawProducts.length}`);
  }

  // Assert every raw source ID maps exactly once in source accounting
  if (sourceAccounting.length !== 244) {
    errors.push(`Source accounting count mismatch: ${sourceAccounting.length} vs expected 244`);
  }

  const sourceIdCounts = new Map();
  sourceAccounting.forEach(acc => {
    sourceIdCounts.set(acc.sourceProductId, (sourceIdCounts.get(acc.sourceProductId) || 0) + 1);
  });

  if (sourceIdCounts.size !== 244) {
    errors.push(`Source accounting contains non-unique source IDs. Unique: ${sourceIdCounts.size}`);
  }

  sourceIdCounts.forEach((count, id) => {
    if (count !== 1) {
      errors.push(`Source product ID ${id} is mapped ${count} times in source accounting`);
    }
  });

  // Map products for fast lookup
  const productMap = new Map(products.map(p => [p.id, p]));
  const productSlugMap = new Map(products.map(p => [p.slug, p]));

  // Verify every accounting target product and size exists and price matches
  sourceAccounting.forEach(acc => {
    const targetProd = productMap.get(acc.finalProductId);
    if (!targetProd) {
      errors.push(`Accounting target product ID ${acc.finalProductId} not found in products.ts`);
      return;
    }
    const targetSize = targetProd.sizes?.find(s => s.id === acc.finalSizeId);
    if (!targetSize) {
      errors.push(`Accounting target size ID ${acc.finalSizeId} not found in product ${targetProd.name}`);
      return;
    }
    if (targetSize.price !== acc.price) {
      errors.push(`Accounting price mismatch for size ${targetSize.id}: size price ${targetSize.price} vs acc price ${acc.price}`);
    }
  });

  // Product & Size Integrity assertions
  const uniqueIds = new Set();
  const uniqueSlugs = new Set();

  products.forEach(p => {
    if (!p.id || uniqueIds.has(p.id)) {
      errors.push(`Duplicate or missing Product ID: ${p.id}`);
    }
    uniqueIds.add(p.id);

    if (!p.slug || uniqueSlugs.has(p.slug)) {
      errors.push(`Duplicate or missing Product Slug: ${p.slug}`);
    }
    uniqueSlugs.add(p.slug);

    if (!p.name || !p.name.trim()) {
      errors.push(`Product ${p.id} has empty name`);
    }

    if (!VALID_CATEGORIES.has(p.categoryId)) {
      errors.push(`Invalid category ID "${p.categoryId}" on product ${p.name}`);
    }

    if (!p.sizes || p.sizes.length === 0) {
      errors.push(`Product ${p.name} has no sizes/variants`);
    } else {
      const sizeLabels = new Set();
      p.sizes.forEach(sz => {
        const normLabel = sz.label.toLowerCase().replace(/\s+/g, '');
        if (sizeLabels.has(normLabel)) {
          errors.push(`Duplicate size label in product ${p.name}: ${sz.label}`);
        }
        sizeLabels.add(normLabel);

        if (sz.label === '1 ədəd' && sz.quantityStatus === 'needs_review') {
          errors.push(`Unresolved quantity displayed as "1 ədəd" in product ${p.name}`);
        }

        if (sz.price !== null && (isNaN(sz.price) || sz.price < 0)) {
          errors.push(`Invalid size price ${sz.price} in product ${p.name}`);
        }

        // Image file existence check for size imageSrc
        if (sz.imageSrc) {
          const relativePath = sz.imageSrc.startsWith('/') ? sz.imageSrc.slice(1) : sz.imageSrc;
          const fullPath = path.join(projectRoot, 'public', relativePath);
          if (!fs.existsSync(fullPath)) {
            errors.push(`Size image file does not exist on disk: ${fullPath} (Product: ${p.name})`);
          }
        }
      });
    }

    // Product Images assertions
    if (!p.images || p.images.length === 0) {
      errors.push(`Product ${p.name} has empty images array`);
    } else {
      const imgPaths = p.images.map(i => i.src);
      const uniqueImgPaths = new Set(imgPaths);
      if (uniqueImgPaths.size !== imgPaths.length) {
        errors.push(`Product ${p.name} contains duplicate image paths in images array: ${imgPaths.join(', ')}`);
      }

      // Check variant images are in product.images
      p.sizes?.forEach(sz => {
        if (sz.imageSrc && !imgPaths.includes(sz.imageSrc)) {
          errors.push(`Variant imageSrc ${sz.imageSrc} is missing from product.images array in ${p.name}`);
        }
      });

      // Check image files exist on disk
      p.images.forEach(img => {
        const relativePath = img.src.startsWith('/') ? img.src.slice(1) : img.src;
        const fullPath = path.join(projectRoot, 'public', relativePath);
        if (!fs.existsSync(fullPath)) {
          errors.push(`Product image file does not exist on disk: ${fullPath} (Product: ${p.name})`);
        }
      });
    }
  });

  // Zero-Price Handling Check (Keşu 1 kg)
  const kesuProd = products.find(p => p.name === 'Keşu' || p.slug === 'kesu');
  if (!kesuProd) {
    errors.push('Keşu product missing from catalog!');
  } else {
    if (kesuProd.price !== null) {
      errors.push(`Keşu default price should be null, found: ${kesuProd.price}`);
    }
    const zeroSize = kesuProd.sizes?.find(s => s.price === null);
    if (!zeroSize) {
      errors.push('Keşu size with null price missing!');
    } else if (zeroSize.inStock !== false) {
      errors.push('Zero-price variant must have inStock: false to prevent adding to cart');
    }
  }

  // Legacy Aliases Check
  const slugAliasKeys = Object.keys(PRODUCT_SLUG_ALIASES);
  const idAliasKeys = Object.keys(PRODUCT_ID_ALIASES);

  if (slugAliasKeys.length === 0) {
    errors.push('PRODUCT_SLUG_ALIASES is empty! Legacy merged slugs must be mapped.');
  }
  if (idAliasKeys.length === 0) {
    errors.push('PRODUCT_ID_ALIASES is empty! Legacy merged IDs must be mapped.');
  }

  // Check specific required merged aliases
  const requiredSlugAliases = [
    'gunebaxan-yagi-1litr',
    'gunebaxan-yagi-2litr',
    'zeytun-yagi-rafine-1litr',
    'zeytun-yagi-rafine-2litr',
    'zeytun-yagi-soyuq-sixim-1litr'
  ];

  requiredSlugAliases.forEach(reqAlias => {
    if (!PRODUCT_SLUG_ALIASES[reqAlias]) {
      errors.push(`Required legacy slug alias "${reqAlias}" is missing from PRODUCT_SLUG_ALIASES`);
    }
  });

  // Report agreement assertions
  const reusedCount = imageMap.filter(i => i.status === 'reused').length;
  const downloadedCount = imageMap.filter(i => i.status === 'downloaded').length;
  const missingCount = imageMap.filter(i => i.status === 'missing').length;

  if (!reportMd.includes(`Total raw Clopos source products**: \`${rawProducts.length}\``)) {
    errors.push(`Markdown report raw product count mismatch vs JSON`);
  }
  if (!reportMd.includes(`Reused local images**: \`${reusedCount}\``)) {
    errors.push(`Markdown report reused images count mismatch vs JSON (${reusedCount})`);
  }
  if (!reportMd.includes(`Downloaded from CDN**: \`${downloadedCount}\``)) {
    errors.push(`Markdown report downloaded images count mismatch vs JSON (${downloadedCount})`);
  }
  if (!reportMd.includes(`Missing images (fallback to \`/images/products/placeholder.svg\`)**: \`${missingCount}\``)) {
    errors.push(`Markdown report missing images count mismatch vs JSON (${missingCount})`);
  }
  if (!reportMd.includes(`Total records needing review**: \`${manualReview.length}\``)) {
    errors.push(`Markdown report manual review count mismatch vs JSON (${manualReview.length})`);
  }

  // Check ISO timestamp in report
  const isoMatch = reportMd.match(/Generated on\*\*: `([^`]+)`/);
  if (!isoMatch || isNaN(Date.parse(isoMatch[1]))) {
    errors.push('Markdown report does not contain a valid ISO timestamp');
  }

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} errors:`);
    errors.forEach(e => console.error(`- ${e}`));
    process.exit(1);
  }

  console.log(`Validation PASSED! Verified ${products.length} products, 244 raw source records, ${slugAliasKeys.length} legacy slug aliases, 0 missing files, and 0 duplicate images.`);
  process.exit(0);
}

main();
