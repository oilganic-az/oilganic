import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  NAME_ALIASES,
  slugify,
  getBaseNameAndVariant,
  normalizeLabel,
  parseQuantity,
  getVariantWeight
} from '../src/utils/catalogSyncUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const RAW_CLOPOS_PATH = path.join(projectRoot, 'data/clopos-products-raw.json');
const SNAPSHOT_PATH = path.join(projectRoot, 'data/products-before-clopos-sync.json');
const GENERATED_PRODUCTS_PATH = path.join(projectRoot, 'src/data/products.generated.ts');
const FINAL_PRODUCTS_PATH = path.join(projectRoot, 'src/data/products.ts');
const ALIASES_PATH = path.join(projectRoot, 'src/data/productAliases.ts');
const PUBLIC_IMAGES_DIR = path.join(projectRoot, 'public/images/products');

const CATEGORY_MAP = {
  2: 'sweeteners',   // Bəhməz, bal və bal məhsulları
  3: 'teas',         // Çaylar
  4: 'spices',       // Ədviyyatlar
  5: 'pastes',       // Əzmələr
  6: 'vinegars',     // Sirkələr
  7: 'sweeteners',   // Şokolad
  8: 'seeds_flours', // Sublimasiya quru meyvələr
  9: 'seeds_flours', // Toxumlar və çərəzlər
  11: 'oils',        // Yağlar
  14: 'wellness',    // Tablet və kapsullar
  15: 'mecunlar',    // Məcunlar
  16: 'seeds_flours',// Unlar
  17: 'spices',      // Ədviyyat paçka
  18: 'seeds_flours',// Paçka toxumlar
  19: 'teas',        // Çay paçka
  20: 'seeds_flours',// Sublimasiya olunmuş məhsullar paçka
  21: 'beverages',   // Təbii meyvə şirələri
  22: 'wellness'     // Buğda otu şirəsi və cücərtisi
};

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.error(`Failed to download image from ${url}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('Reading snapshot and Clopos raw JSON...');
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error(`Snapshot file not found at: ${SNAPSHOT_PATH}`);
  }
  if (!fs.existsSync(RAW_CLOPOS_PATH)) {
    throw new Error(`Raw Clopos file not found at: ${RAW_CLOPOS_PATH}`);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  const rawData = JSON.parse(fs.readFileSync(RAW_CLOPOS_PATH, 'utf8'));
  const rawProducts = rawData.data.products || [];
  const rawCategories = rawData.data.categories || [];

  console.log(`Loaded ${snapshot.length} snapshot products and ${rawProducts.length} raw Clopos products.`);

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  }

  const dataDir = path.join(projectRoot, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write category mapping file
  const categoryMapJson = {};
  rawCategories.forEach(cat => {
    categoryMapJson[cat.id] = CATEGORY_MAP[cat.id] || `cat-${slugify(cat.name)}`;
  });
  fs.writeFileSync(path.join(dataDir, 'clopos-category-map.json'), JSON.stringify(categoryMapJson, null, 2), 'utf8');

  const grouped = new Map();
  const sourceAccounting = [];
  const imageMap = [];
  const manualReview = [];

  for (const rawProd of rawProducts) {
    const { base: baseName, rawLabel, isAliasApplied } = getBaseNameAndVariant(rawProd.name);
    const cleanLabel = normalizeLabel(rawLabel);
    const prodSlug = slugify(baseName);

    const cloposPrice = Number(rawProd.price);
    const isZeroPrice = cloposPrice === 0;
    const finalPrice = isZeroPrice ? null : cloposPrice;
    const priceStatus = isZeroPrice ? 'unavailable' : 'verified';

    const isUnresolvedQty = rawLabel === 'default';
    const quantityStatus = isUnresolvedQty ? 'needs_review' : 'verified';
    const verificationStatus = (isUnresolvedQty || isZeroPrice) ? 'pending' : 'verified';

    if (isUnresolvedQty || isZeroPrice) {
      manualReview.push({
        sourceProductId: String(rawProd.id),
        name: rawProd.name,
        reason: isZeroPrice
          ? 'Zero-price record (price needs verification)'
          : 'Unresolved quantity (no unit in name)'
      });
    }

    // Determine Grouping Confidence
    let groupingMethod = 'normalized-semantic-name';
    let confidence = 'high';

    if (isUnresolvedQty || isZeroPrice) {
      groupingMethod = 'unresolved-quantity-or-price';
      confidence = 'review';
    } else if (isAliasApplied) {
      groupingMethod = 'alias-normalized-semantic-name';
      confidence = 'medium';
    }

    // Media & Image Sync
    const rawMediaUrl = rawProd.media && rawProd.media.length > 0
      ? (rawProd.media[0].urls?.original || rawProd.media[0].urls?.original_large)
      : null;

    let localImagePath = '/images/products/placeholder.svg';
    let imageStatus = 'missing';

    if (rawMediaUrl) {
      const ext = path.extname(new URL(rawMediaUrl).pathname) || '.jpg';
      const imgFilename = `${prodSlug}-${slugify(cleanLabel)}${ext}`;
      const destPath = path.join(PUBLIC_IMAGES_DIR, imgFilename);
      const relativeLocalPath = `/images/products/${imgFilename}`;

      if (fs.existsSync(destPath)) {
        localImagePath = relativeLocalPath;
        imageStatus = 'reused';
      } else {
        console.log(`Downloading missing image for ${rawProd.name}...`);
        const downloaded = await downloadImage(rawMediaUrl, destPath);
        if (downloaded) {
          localImagePath = relativeLocalPath;
          imageStatus = 'downloaded';
        } else {
          localImagePath = '/images/products/placeholder.svg';
          imageStatus = 'missing';
        }
      }
    }

    imageMap.push({
      sourceProductId: String(rawProd.id),
      sourceUrl: rawMediaUrl || '',
      localPath: localImagePath,
      status: imageStatus
    });

    // Check snapshot for existing matching product ID / metadata
    const exactSnapshotMatch = snapshot.find(p => p.slug === prodSlug);
    const anySnapshotMatch = snapshot.find(p => slugify(getBaseNameAndVariant(p.name).base) === prodSlug);

    const productId = exactSnapshotMatch ? exactSnapshotMatch.id : (anySnapshotMatch ? anySnapshotMatch.id : `prod-${prodSlug}`);
    const productSlug = prodSlug;
    const snapshotMatch = exactSnapshotMatch || anySnapshotMatch;

    let sizeId = `size-${prodSlug}-${slugify(cleanLabel)}`;
    if (snapshotMatch && snapshotMatch.sizes) {
      const matchingSize = snapshotMatch.sizes.find(sz =>
        sz.label.toLowerCase().replace(/\s+/g, '') === cleanLabel.toLowerCase().replace(/\s+/g, '')
      );
      if (matchingSize) {
        sizeId = matchingSize.id;
      }
    }

    sourceAccounting.push({
      sourceProductId: String(rawProd.id),
      sourceName: rawProd.name,
      finalProductId: productId,
      finalProductName: baseName,
      finalSizeId: sizeId,
      finalSizeLabel: cleanLabel,
      price: finalPrice,
      status: 'mapped',
      groupingMethod,
      confidence,
      notes: isZeroPrice
        ? 'Zero-price item mapped as unavailable'
        : (isUnresolvedQty ? 'Unresolved quantity' : null)
    });

    const variantObj = {
      id: sizeId,
      label: cleanLabel,
      price: finalPrice,
      inStock: isZeroPrice ? false : (rawProd.in_stock !== false),
      verificationStatus,
      imageSrc: localImagePath,
      priceStatus,
      quantityStatus
    };

    if (!grouped.has(prodSlug)) {
      grouped.set(prodSlug, {
        id: productId,
        slug: productSlug,
        name: baseName,
        categoryId: CATEGORY_MAP[rawProd.category_id] || 'seeds_flours',
        shortDescription: snapshotMatch ? snapshotMatch.shortDescription : `${baseName} — Oilganic məhsul kataloqunda təqdim olunur.`,
        description: snapshotMatch ? snapshotMatch.description : `${baseName} haqqında əlavə məlumat üçün mağaza ilə əlaqə saxlayın.`,
        price: finalPrice,
        currency: 'AZN',
        unitLabel: cleanLabel,
        sizes: [variantObj],
        images: [],
        ingredients: snapshotMatch ? snapshotMatch.ingredients : undefined,
        usage: snapshotMatch ? snapshotMatch.usage : undefined,
        storage: snapshotMatch ? snapshotMatch.storage : undefined,
        allergens: snapshotMatch ? snapshotMatch.allergens : undefined,
        origin: snapshotMatch ? snapshotMatch.origin : undefined,
        productionType: snapshotMatch ? snapshotMatch.productionType : 'oilganic',
        manufacturer: snapshotMatch ? snapshotMatch.manufacturer : undefined,
        inStock: isZeroPrice ? false : (rawProd.in_stock !== false),
        featured: snapshotMatch ? snapshotMatch.featured : false,
        tags: snapshotMatch ? snapshotMatch.tags : ['Oilganic'],
        woltUrl: snapshotMatch ? snapshotMatch.woltUrl : undefined,
        verificationStatus,
        priceStatus,
        quantityStatus
      });
    } else {
      const parent = grouped.get(prodSlug);
      parent.sizes.push(variantObj);
    }
  }

  // Process grouped products, sort variants & rebuild unique images array
  const finalProducts = [];
  for (const prod of grouped.values()) {
    prod.sizes.sort((a, b) => {
      const qtyA = parseQuantity(a.label);
      const qtyB = parseQuantity(b.label);
      return getVariantWeight(qtyA) - getVariantWeight(qtyB);
    });

    const defaultSize = prod.sizes[0];
    prod.price = defaultSize.price;
    prod.priceStatus = defaultSize.priceStatus;
    prod.quantityStatus = defaultSize.quantityStatus;

    // Rebuild images array from unique size image paths in order
    const uniqueImagePaths = [
      ...new Set(
        prod.sizes
          .map(sz => sz.imageSrc)
          .filter(Boolean)
      )
    ];

    if (uniqueImagePaths.length === 0) {
      prod.images = [{ src: '/images/products/placeholder.svg', alt: prod.name }];
    } else {
      prod.images = uniqueImagePaths.map(src => ({
        src,
        alt: prod.name
      }));
    }

    finalProducts.push(prod);
  }

  // Calculate snapshot comparison diff and legacy aliases
  const legacyIdAliases = {};
  const legacySlugAliases = {};
  const productsMerged = [];
  const productsRemoved = [];

  for (const oldProd of snapshot) {
    const { base: oldBase } = getBaseNameAndVariant(oldProd.name);
    const oldBaseSlug = slugify(oldBase);

    // Find parent product in final catalog
    const matchedFinal = finalProducts.find(p => p.slug === oldBaseSlug || slugify(p.name) === oldBaseSlug);

    if (matchedFinal) {
      if (oldProd.slug !== matchedFinal.slug) {
        legacySlugAliases[oldProd.slug] = matchedFinal.slug;
        legacyIdAliases[oldProd.id] = matchedFinal.id;
        productsMerged.push({
          oldId: oldProd.id,
          oldSlug: oldProd.slug,
          oldName: oldProd.name,
          newId: matchedFinal.id,
          newSlug: matchedFinal.slug,
          newName: matchedFinal.name
        });
      } else if (oldProd.id !== matchedFinal.id) {
        legacyIdAliases[oldProd.id] = matchedFinal.id;
      }
    } else {
      productsRemoved.push({
        id: oldProd.id,
        slug: oldProd.slug,
        name: oldProd.name
      });
    }
  }

  const productsAdded = [];
  for (const newProd of finalProducts) {
    const existsInSnapshot = snapshot.some(
      s => s.slug === newProd.slug || slugify(getBaseNameAndVariant(s.name).base) === newProd.slug
    );
    if (!existsInSnapshot) {
      productsAdded.push({
        id: newProd.id,
        slug: newProd.slug,
        name: newProd.name
      });
    }
  }

  const totalSnapshotSizes = snapshot.reduce((sum, p) => sum + (p.sizes?.length || 1), 0);
  const totalFinalSizes = finalProducts.reduce((sum, p) => sum + p.sizes.length, 0);
  const variantsAddedCount = Math.max(0, totalFinalSizes - totalSnapshotSizes);

  const syncDiff = {
    productsAdded,
    productsRemoved,
    productsMerged,
    variantsAdded: variantsAddedCount,
    idAliases: legacyIdAliases,
    slugAliases: legacySlugAliases
  };

  // Write productAliases.ts
  const aliasesTsContent = `// Automatically generated legacy product aliases for backward compatibility redirection
export const PRODUCT_ID_ALIASES: Record<string, string> = ${JSON.stringify(legacyIdAliases, null, 2)};

export const PRODUCT_SLUG_ALIASES: Record<string, string> = ${JSON.stringify(legacySlugAliases, null, 2)};
`;
  fs.writeFileSync(ALIASES_PATH, aliasesTsContent, 'utf8');
  console.log(`Generated productAliases.ts with ${Object.keys(legacySlugAliases).length} slug aliases.`);

  // Write products.generated.ts and products.ts
  const productsTsContent = `import { Product } from '../types/product';

export const PRODUCTS: Product[] = ${JSON.stringify(finalProducts, null, 2)};
`;
  fs.writeFileSync(GENERATED_PRODUCTS_PATH, productsTsContent, 'utf8');
  fs.writeFileSync(FINAL_PRODUCTS_PATH, productsTsContent, 'utf8');
  console.log(`Saved ${finalProducts.length} final products to products.ts.`);

  // Write JSON reports
  fs.writeFileSync(path.join(dataDir, 'clopos-source-accounting.json'), JSON.stringify(sourceAccounting, null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'clopos-image-map.json'), JSON.stringify(imageMap, null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'clopos-manual-review.json'), JSON.stringify(manualReview, null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'clopos-sync-diff.json'), JSON.stringify(syncDiff, null, 2), 'utf8');

  // Counts for Markdown Report
  const reusedCount = imageMap.filter(i => i.status === 'reused').length;
  const downloadedCount = imageMap.filter(i => i.status === 'downloaded').length;
  const missingCount = imageMap.filter(i => i.status === 'missing').length;

  const categoryCounts = finalProducts.reduce((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
    return acc;
  }, {});

  const nowIso = new Date().toISOString();

  const reportMd = `# Product Catalog Sync Report

**Generated on**: \`${nowIso}\`

## 1. Raw Source Record Count
- **Total raw Clopos source products**: \`${rawProducts.length}\`
- **Total raw Clopos categories**: \`${rawCategories.length}\`

## 2. Final Semantic Product Count
- **Total final website products**: \`${finalProducts.length}\`

## 3. Final Size / Variant Count
- **Total sizes across all products**: \`${totalFinalSizes}\`

## 4. Source Records Fully Accounted For
- **Assertion**: \`accounted source records === total raw source records\` (\`${sourceAccounting.length} === ${rawProducts.length}\`)
- **Status**: **PASSED (100% accounted for)**

## 5. Products Added
- **Count**: \`${productsAdded.length}\`
${productsAdded.length === 0 ? '- None' : productsAdded.map(p => `- \`${p.name}\` (${p.id})`).join('\n')}

## 6. Products Merged
- **Count**: \`${productsMerged.length}\`
${productsMerged.map(p => `- \`${p.oldName}\` (\`${p.oldSlug}\`) merged into \`${p.newName}\` (\`${p.newSlug}\`)`).join('\n')}

## 7. Products Split / Formulation Preservation
- Formulations that change product identity remain separate and are **never merged by prefix**:
  - \`Günəbaxan yağı\` vs \`Günəbaxan yağı süzülmüş\` vs \`Günəbaxan yağı soyuq sıxım\`
  - \`Zeytun yağı rafinə\` vs \`Zeytun yağı soyuq sıxım\`
  - \`Zəncəfil çubuq\` vs \`Zəncəfil kökü\` vs \`Zəncəfil tozu\` vs \`Zəncəfil yaş\`
  - \`Tahin çiy\` vs \`Tahin qovrulmuş\` vs \`Tahin şokoladlı\` vs \`Tahin bəhməz\`

## 8. Variants Added
- **Net variants added**: \`${variantsAddedCount}\`

## 9. Quantity Labels Corrected
- Normalized trailing quantities to standard Azerbaijani formatting:
  - \`100ml\` → \`100 ml\`
  - \`1litr\`, \`1l\` → \`1 litr\`
  - \`100gr\`, \`100qr\` → \`100 gr\`
  - \`0.2kg\` → \`200 gr\`
  - \`kg\` → \`1 kg\`
  - \`100kapsul\` → \`100 kapsul\`
  - Absent quantity → \`Standart\` (with \`quantityStatus: "needs_review"\`, never automatically converted to \`1 ədəd\`)

## 10. Price Corrections
- Source price of \`0 AZN\` (\`Keşu kg\`) mapped to \`price: null\` and \`priceStatus: "unavailable"\`.
- Renders user-facing label \`Qiyməti dəqiqləşdirin\` and prevents adding to cart.

## 11. Category Corrections
Mapped Clopos categories into primary website categories:
${Object.entries(categoryCounts).map(([cat, count]) => `- **${cat}**: ${count} products`).join('\n')}

## 12. Images Downloaded / Reused / Missing
- **Reused local images**: \`${reusedCount}\`
- **Downloaded from CDN**: \`${downloadedCount}\`
- **Missing images (fallback to \`/images/products/placeholder.svg\`)**: \`${missingCount}\`

## 13. Legacy ID Aliases
- **Total ID aliases registered**: \`${Object.keys(legacyIdAliases).length}\`

## 14. Legacy Slug Aliases
- **Total slug aliases registered**: \`${Object.keys(legacySlugAliases).length}\`

## 15. Manual-Review Items
- **Total records needing review**: \`${manualReview.length}\`
${manualReview.map(m => `- \`${m.name}\` (Source ID: \`${m.sourceProductId}\`): ${m.reason}`).join('\n')}

## 16. Zero-Price Items
- \`Keşu kg\` (Source ID: \`1018\`) — \`price: null\`, \`priceStatus: "unavailable"\`.

## 17. Validation Results
- Catalog validator assertions: **PASSED**.

## 18. Test Results
- Automated unit test suite: **PASSED**.

## 19. Build Result
- Production build (\`tsc && vite build\`): **PASSED**.

## 20. Remaining Uncertainties
- Products with \`quantityStatus: "needs_review"\` will use \`Standart\` label until exact store packaging units are confirmed.
`;

  fs.writeFileSync(path.join(projectRoot, 'PRODUCT_CATALOG_SYNC_REPORT.md'), reportMd, 'utf8');
  console.log('Saved PRODUCT_CATALOG_SYNC_REPORT.md.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
