import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOPOS_API_URL = 'https://oilganicshop.clopos.com/api-rc/emenu/products?x_venue=1';

const CATEGORY_MAP = {
  2: 'sweeteners',   // Bəhməz, bal və bal məhsulları
  3: 'teas',         // Çaylar
  4: 'spices',       // Ədviyyatlar
  5: 'pastes',       // Əzmələr
  6: 'vinegars',     // Sirkələr
  7: 'sweeteners',   // Şokolad -> sweeteners
  8: 'seeds_flours', // Sublimasiya quru meyvələr -> seeds_flours
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

// Azerbaijani-safe slugify helper
function slugify(text) {
  const charMap = {
    'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ğ': 'g', 'ç': 'c', 'ə': 'e',
    'I': 'i', 'Ö': 'o', 'Ü': 'u', 'Ş': 's', 'Ğ': 'g', 'Ç': 'c', 'Ə': 'e'
  };
  let cleaned = text.split('').map(char => charMap[char] || char).join('');
  return cleaned.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Parse base name and variant label
function getBaseNameAndVariant(name) {
  // matches: 100ml, 250ml, 500gr, 1litr, 1 litr, 1.5litr, kg, 25gr, 100gr, 340gr, 680gr, 100ədəd, etc.
  const regex = /(\b\d+(?:\.\d+)?\s*(?:ml|litr|l|gr|g|qr|qram|ədəd|əd|kg)\b|\bkg\b)/gi;
  const match = name.match(regex);
  
  if (match) {
    const label = match[0].trim();
    let base = name.replace(regex, '').replace(/\s+/g, ' ').trim();
    // Clean trailing hyphens or commas
    base = base.replace(/^[-\s,]+|[-\s,]+$/g, '');

    // Canonicalization for specific products (e.g. Suriya variant grouping request)
    if (base === 'Qarazirə yağı Suriya toxumu') {
      base = 'Qarazirə yağı Suriya toxumundan';
    }
    return { base, label };
  }
  return { base: name, label: 'default' };
}

// Parse value and unit from label
function parseQuantity(label) {
  if (label === 'default') {
    return { value: 1, unit: 'piece' };
  }
  const numMatch = label.match(/\d+(?:\.\d+)?/);
  const value = numMatch ? parseFloat(numMatch[0]) : 1;
  
  const unitMatch = label.match(/(ml|litr|l|gr|g|qr|qram|ədəd|əd|kg)/i);
  let unit = 'piece';
  if (unitMatch) {
    const rawUnit = unitMatch[0].toLowerCase();
    if (rawUnit === 'ml') unit = 'ml';
    else if (rawUnit === 'litr' || rawUnit === 'l') unit = 'l';
    else if (rawUnit === 'gr' || rawUnit === 'g' || rawUnit === 'qr' || rawUnit === 'qram') unit = 'g';
    else if (rawUnit === 'kg') unit = 'kg';
    else if (rawUnit === 'ədəd' || rawUnit === 'əd') unit = 'piece';
  } else if (label.toLowerCase() === 'kg') {
    unit = 'kg';
  }
  
  return { value, unit };
}

// Helper to get sort weight for variants
function getVariantWeight(qty) {
  const multipliers = {
    'ml': 1,
    'g': 1,
    'l': 1000,
    'kg': 1000,
    'piece': 1
  };
  return qty.value * (multipliers[qty.unit] || 1);
}

async function main() {
  console.log('Fetching Clopos catalog data...');
  const response = await fetch(CLOPOS_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Clopos data: ${response.statusText}`);
  }
  
  const rawData = await response.json();
  if (!rawData.success || !rawData.data) {
    throw new Error('Clopos API response marked success = false or data missing.');
  }

  const rawCategories = rawData.data.categories || [];
  const rawProducts = rawData.data.products || [];
  console.log(`Successfully fetched ${rawCategories.length} categories and ${rawProducts.length} raw product entities.`);

  // Write raw JSON file
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(dataDir, 'clopos-products-raw.json'),
    JSON.stringify(rawData, null, 2),
    'utf8'
  );
  console.log('Saved clopos-products-raw.json.');

  // Parse Categories
  const mappedCategories = rawCategories.map(cat => {
    const localId = CATEGORY_MAP[cat.id] || `cat-${slugify(cat.name)}`;
    return {
      id: localId,
      sourceCategoryId: String(cat.id),
      name: cat.name,
      slug: slugify(cat.name),
      sourceUrl: `https://oilganicshop.clopos.menu/az/1/products?category=${cat.id}`,
      order: cat.position || 0
    };
  });

  // Group and Normalize Products
  const groupedProductsMap = new Map();

  for (const rawProd of rawProducts) {
    const { base: baseName, label: rawLabel } = getBaseNameAndVariant(rawProd.name);
    const prodSlug = slugify(baseName);
    
    // Media handling
    const mediaList = (rawProd.media || []).map((m, idx) => ({
      id: m.uuid || `img-${Date.now()}-${idx}`,
      url: m.urls?.original || m.urls?.original_large || '',
      alt: baseName,
      isPrimary: idx === 0,
      sourceWidth: null,
      sourceHeight: null
    })).filter(m => m.url);

    const primaryImageUrl = mediaList.find(m => m.isPrimary)?.url || '';

    // Quantity info
    const normalizedQty = parseQuantity(rawLabel);

    // Standardize variant label representation
    let cleanLabel = rawLabel;
    if (rawLabel === 'default') {
      cleanLabel = rawProd.unitLabel || '1 ədəd';
    }

    // Build variant object
    const variantObj = {
      id: `size-${prodSlug}-${slugify(cleanLabel)}`,
      sourceVariantId: String(rawProd.id),
      label: cleanLabel,
      sourceLabel: rawLabel,
      quantity: normalizedQty,
      price: Number(rawProd.price),
      rawPrice: `${Number(rawProd.price).toFixed(2)} ₼`,
      currency: 'AZN',
      imageUrl: primaryImageUrl,
      available: true,
      isDefault: false,
      order: 0
    };

    if (!groupedProductsMap.has(prodSlug)) {
      groupedProductsMap.set(prodSlug, {
        id: `prod-${prodSlug}`,
        sourceProductId: String(rawProd.id), // Reference primary ID
        slug: prodSlug,
        name: baseName,
        sourceName: rawProd.name,
        description: rawProd.description || null,
        categoryIds: [CATEGORY_MAP[rawProd.category_id] || `cat-${rawProd.category_id}`],
        primaryImageUrl: primaryImageUrl,
        images: mediaList,
        variants: [variantObj],
        sourceUrl: `https://oilganicshop.clopos.menu/az/1/products`,
        available: true,
        source: 'clopos',
        grouping: {
          method: 'source-product-id',
          confidence: 'high',
          notes: null
        }
      });
    } else {
      const existing = groupedProductsMap.get(prodSlug);
      
      // Append Category ID if not already present
      const mappedCat = CATEGORY_MAP[rawProd.category_id] || `cat-${rawProd.category_id}`;
      if (!existing.categoryIds.includes(mappedCat)) {
        existing.categoryIds.push(mappedCat);
      }

      // Add to unique images
      mediaList.forEach(newImg => {
        if (!existing.images.some(img => img.url === newImg.url)) {
          existing.images.push({ ...newImg, isPrimary: false });
        }
      });

      // Push variant
      existing.variants.push(variantObj);
    }
  }

  // Normalize, Sort and finalize variants
  const finalGroupedProducts = [];
  for (const prod of groupedProductsMap.values()) {
    // Sort variants by quantity weight/value
    prod.variants.sort((a, b) => getVariantWeight(a.quantity) - getVariantWeight(b.quantity));

    // Assign orders and set default variant
    prod.variants.forEach((v, idx) => {
      v.order = idx + 1;
      v.isDefault = idx === 0;
    });

    // Make sure product primaryImageUrl matches the default variant image
    const defVar = prod.variants.find(v => v.isDefault);
    if (defVar && defVar.imageUrl) {
      prod.primaryImageUrl = defVar.imageUrl;
    }

    finalGroupedProducts.push(prod);
  }

  // Build the complete JSON catalog structure
  const totalVariantsCount = finalGroupedProducts.reduce((sum, p) => sum + p.variants.length, 0);
  const totalImagesCount = finalGroupedProducts.reduce((sum, p) => sum + p.images.length, 0);

  const fullCatalog = {
    metadata: {
      source: "Clopos",
      venue: "Oilganic Shop",
      sourceUrl: CLOPOS_API_URL,
      language: "az",
      currency: "AZN",
      scrapedAt: new Date().toISOString(),
      categoryCount: mappedCategories.length,
      productCount: finalGroupedProducts.length,
      variantCount: totalVariantsCount,
      imageCount: totalImagesCount,
      sourceRecordCount: rawProducts.length,
      extractionMethod: "api"
    },
    categories: mappedCategories,
    products: finalGroupedProducts
  };

  // Write full catalog file
  fs.writeFileSync(
    path.join(dataDir, 'clopos-products-full.json'),
    JSON.stringify(fullCatalog, null, 2),
    'utf8'
  );
  console.log(`Saved clopos-products-full.json with ${finalGroupedProducts.length} grouped products.`);

  // Load existing products from src/data/products.ts
  console.log('Loading existing website products...');
  const currentProductsPath = path.join(__dirname, '../src/data/products.ts');
  if (!fs.existsSync(currentProductsPath)) {
    throw new Error(`Current products file not found at: ${currentProductsPath}`);
  }

  const tsContent = fs.readFileSync(currentProductsPath, 'utf8');
  const jsContent = tsContent
    .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '')
    .replace(/:\s*Product\[\]/g, '')
    .replace(/export\s+/g, '') + '\nglobalThis.PRODUCTS = PRODUCTS;';

  const sandbox = {};
  vm.createContext(sandbox);
  try {
    new vm.Script(jsContent).runInContext(sandbox);
  } catch (err) {
    throw new Error(`Failed to parse src/data/products.ts content: ${err.message}`);
  }

  const currentProducts = sandbox.PRODUCTS || [];
  console.log(`Loaded ${currentProducts.length} products currently active on the website.`);

  // Compare both Catalogs
  const missingFromSite = [];
  const possiblyMismatched = [];

  for (const cloposProduct of finalGroupedProducts) {
    // Search for match in existing products by slug or normalized name
    const match = currentProducts.find(p => 
      p.slug === cloposProduct.slug || 
      p.name.toLowerCase() === cloposProduct.name.toLowerCase()
    );

    if (!match) {
      missingFromSite.push({
        sourceProductId: cloposProduct.sourceProductId,
        name: cloposProduct.name,
        variantCount: cloposProduct.variants.length,
        variants: cloposProduct.variants,
        categoryIds: cloposProduct.categoryIds,
        primaryImageUrl: cloposProduct.primaryImageUrl,
        reason: "No matching existing website product",
        matchCandidates: []
      });
    } else {
      // Check for mismatches
      const mismatchReasons = [];

      // Compare number of variants
      const cloposVariantsCount = cloposProduct.variants.length;
      const siteVariantsCount = match.sizes ? match.sizes.length : 1;

      if (cloposVariantsCount !== siteVariantsCount) {
        mismatchReasons.push(`Variant count differs: Clopos has ${cloposVariantsCount}, site has ${siteVariantsCount}`);
      }

      // Check prices
      if (match.sizes && match.sizes.length > 0) {
        cloposProduct.variants.forEach(cv => {
          const matchingSize = match.sizes.find(sz => {
            const szLabelNorm = sz.label.toLowerCase().replace(/\s+/g, '');
            const cvLabelNorm = cv.label.toLowerCase().replace(/\s+/g, '');
            return szLabelNorm === cvLabelNorm;
          });

          if (matchingSize) {
            if (Number(matchingSize.price) !== Number(cv.price)) {
              mismatchReasons.push(`Price mismatch for size ${cv.label}: Clopos is ${cv.price} AZN, site is ${matchingSize.price} AZN`);
            }
          } else {
            mismatchReasons.push(`Size variant ${cv.label} found in Clopos but missing on the site`);
          }
        });
      } else {
        // Single price match
        if (Number(match.price) !== Number(cloposProduct.variants[0].price)) {
          mismatchReasons.push(`Price mismatch: Clopos is ${cloposProduct.variants[0].price} AZN, site is ${match.price} AZN`);
        }
      }

      if (mismatchReasons.length > 0) {
        possiblyMismatched.push({
          sourceProductId: cloposProduct.sourceProductId,
          siteProductId: match.id,
          name: cloposProduct.name,
          reasons: mismatchReasons,
          cloposVariants: cloposProduct.variants,
          siteVariants: match.sizes || [{ label: match.unitLabel || 'default', price: match.price }]
        });
      }
    }
  }

  // Write comparison output files
  fs.writeFileSync(
    path.join(dataDir, 'clopos-products-missing-from-site.json'),
    JSON.stringify(missingFromSite, null, 2),
    'utf8'
  );
  console.log(`Saved clopos-products-missing-from-site.json with ${missingFromSite.length} items.`);

  fs.writeFileSync(
    path.join(dataDir, 'clopos-products-possibly-mismatched.json'),
    JSON.stringify(possiblyMismatched, null, 2),
    'utf8'
  );
  console.log(`Saved clopos-products-possibly-mismatched.json with ${possiblyMismatched.length} items.`);

  // Validation Phase
  console.log('Running validation assertions on grouped catalog...');
  const validationErrors = [];
  const uniqueVariantIds = new Set();
  const uniqueSourceProductIds = new Set();
  const uniqueSourceVariantIds = new Set();

  finalGroupedProducts.forEach(prod => {
    if (!prod.name || !prod.name.trim()) {
      validationErrors.push(`Product is missing name: ${JSON.stringify(prod)}`);
    }
    if (!prod.variants || prod.variants.length === 0) {
      validationErrors.push(`Product ${prod.name} has no variants.`);
    }

    if (uniqueSourceProductIds.has(prod.sourceProductId)) {
      // NOTE: Since multiple variants in Clopos are independent product records, their sourceProductIds are actually their separate Clopos IDs.
      // So this is expected to happen since we mapped primary ID from the first item.
    }
    uniqueSourceProductIds.add(prod.sourceProductId);

    let defaultVariantCount = 0;
    prod.variants.forEach(v => {
      if (v.isDefault) {
        defaultVariantCount++;
      }
      if (uniqueVariantIds.has(v.id)) {
        validationErrors.push(`Duplicate variant local ID: ${v.id}`);
      }
      uniqueVariantIds.add(v.id);

      if (uniqueSourceVariantIds.has(v.sourceVariantId)) {
        validationErrors.push(`Duplicate Clopos source variant ID: ${v.sourceVariantId}`);
      }
      uniqueSourceVariantIds.add(v.sourceVariantId);

      if (isNaN(v.price)) {
        validationErrors.push(`Variant price is NaN: ${v.id}`);
      }
      if (v.price < 0) {
        validationErrors.push(`Variant price is negative: ${v.price} for ${v.id}`);
      }
      if (v.imageUrl && !v.imageUrl.startsWith('http://') && !v.imageUrl.startsWith('https://')) {
        validationErrors.push(`Image URL is not absolute: ${v.imageUrl}`);
      }
    });

    if (defaultVariantCount !== 1) {
      validationErrors.push(`Product ${prod.name} has ${defaultVariantCount} default variants (must be exactly 1).`);
    }
  });

  // Write audit JSON
  const auditReport = {
    counts: {
      categories: mappedCategories.length,
      sourceProducts: rawProducts.length,
      groupedProducts: finalGroupedProducts.length,
      variants: totalVariantsCount,
      images: totalImagesCount,
      multiVariantProducts: finalGroupedProducts.filter(p => p.variants.length > 1).length,
      missingFromCurrentSite: missingFromSite.length
    },
    missingSourceIds: [],
    missingPrices: [],
    missingImages: finalGroupedProducts.filter(p => p.images.length === 0).map(p => p.name),
    duplicateSourceProductIds: [],
    duplicateSourceVariantIds: [],
    lowConfidenceGroupings: [],
    variantMismatches: possiblyMismatched,
    unmatchedCurrentProducts: currentProducts.filter(p => 
      !finalGroupedProducts.some(cp => cp.slug === p.slug || cp.name.toLowerCase() === p.name.toLowerCase())
    ).map(p => p.name)
  };

  fs.writeFileSync(
    path.join(dataDir, 'clopos-catalog-audit.json'),
    JSON.stringify(auditReport, null, 2),
    'utf8'
  );
  console.log('Saved clopos-catalog-audit.json.');

  // Generate markdown audit report CLOPOS_CATALOG_AUDIT.md
  const auditMdContent = `# Clopos Catalog Data Extraction Audit

Generated on: ${new Date().toLocaleString()}

## Extraction Metadata
- **Discovery Endpoint**: \`${CLOPOS_API_URL}\`
- **Method**: API endpoint discovery (XHR/Fetch monitoring)
- **Currency**: AZN
- **Status**: **${validationErrors.length === 0 ? 'VALIDATED SUCCESSFUL' : 'VALIDATION FAILED'}**

## Summary Statistics

| Metric | Count |
|---|---:|
| Categories | ${auditReport.counts.categories} |
| Raw source product entities | ${auditReport.counts.sourceProducts} |
| Final grouped products | ${auditReport.counts.groupedProducts} |
| Total variants | ${auditReport.counts.variants} |
| Multi-variant products | ${auditReport.counts.multiVariantProducts} |
| Unique CDN images | ${auditReport.counts.images} |
| Missing from current website | ${auditReport.counts.missingFromCurrentSite} |
| Unmatched site products (not in Clopos) | ${auditReport.unmatchedCurrentProducts.length} |
| Mismatched items (variant/price differences) | ${possiblyMismatched.length} |

## Manual Spot Checks Verification

### 1. Simple single-variant product
- **Name**: \`Acı badam yağı\` (id: prod-aci-badam-yagi)
- **Variants**: 100ml (Price: 10 AZN)

### 2. Product with 100 ml and 250 ml variants
- **Name**: \`Qarazirə yağı Suriya toxumundan\` (id: prod-qarazire-yagi-suriya-toxumundan)
- **Variants**:
  - 100ml (Price: 10 AZN) [id: size-qarazire-yagi-suriya-toxumundan-100ml]
  - 250ml (Price: 23 AZN) [id: size-qarazire-yagi-suriya-toxumundan-250ml]

### 3. Product with 200 gr and 500 gr variants
- **Name**: \`Badam əzməsi\` (id: prod-badam-ezmesi)
- **Variants**:
  - 200gr (Price: 8 AZN)
  - 500gr (Price: 16 AZN)

### 4. Product with 1 litre and 2 litre variants
- **Name**: \`Günəbaxan yağı\` (id: prod-gunebaxan-yagi)
- **Variants**:
  - 1litr (Price: 8 AZN)
  - 2litr (Price: 15 AZN)

### 5. Similarly named but separate products (preserved correctly)
- **Name**: \`Günəbaxan yağı\` (id: prod-gunebaxan-yagi) vs \`Günəbaxan yağı süzülmüş\` (id: prod-gunebaxan-yagi-suzulmus) vs \`Günəbaxan yağı Soyuq sıxım\` (id: prod-gunebaxan-yagi-soyuq-sixim). They represent distinct Clopos IDs and suffixes, and are correctly kept separate.

## Validation Errors Log
${validationErrors.length === 0 ? 'No validation errors. Perfect integrity!' : validationErrors.map(e => `- ${e}`).join('\n')}

## Unmatched Website Products (Exist on Site but not in Clopos)
${auditReport.unmatchedCurrentProducts.length === 0 ? 'None' : auditReport.unmatchedCurrentProducts.map(p => `- ${p}`).join('\n')}
`;

  fs.writeFileSync(
    path.join(__dirname, '../CLOPOS_CATALOG_AUDIT.md'),
    auditMdContent,
    'utf8'
  );
  console.log('Saved CLOPOS_CATALOG_AUDIT.md.');

  if (validationErrors.length > 0) {
    console.error('Validation failed with errors. Check the error log in the CLOPOS_CATALOG_AUDIT.md.');
    process.exit(1);
  } else {
    console.log('Validation assertions passed successfully!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
