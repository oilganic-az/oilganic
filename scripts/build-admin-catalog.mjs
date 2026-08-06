import fs from "node:fs";
import path from "node:path";

const repositoryRoot = process.cwd();

const paths = {
  base: path.join(repositoryRoot, "content", "catalog-base.json"),
  overrides: path.join(repositoryRoot, "content", "product-overrides.json"),
  manual: path.join(repositoryRoot, "content", "manual-products.json"),
  deleted: path.join(repositoryRoot, "content", "deleted-product-ids.json"),
  output: path.join(repositoryRoot, "src", "data", "catalog.generated.json"),
};

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Tələb olunan fayl tapılmadı: ${path.relative(repositoryRoot, filePath)}`);
  }

  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");

  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(
      `JSON parse xətası: ${path.relative(repositoryRoot, filePath)} | ${error.message}`
    );
  }
}

function validateProduct(product, sourceLabel) {
  assert(product && typeof product === "object", `${sourceLabel}: məhsul obyekt deyil.`);
  assert(typeof product.id === "string" && product.id.trim(), `${sourceLabel}: id yoxdur.`);
  assert(typeof product.slug === "string" && product.slug.trim(), `${sourceLabel}: slug yoxdur.`);
  assert(typeof product.name === "string" && product.name.trim(), `${sourceLabel}: name yoxdur.`);
  assert(
    typeof product.categoryId === "string" && product.categoryId.trim(),
    `${sourceLabel}: categoryId yoxdur.`
  );
  assert(
    typeof product.shortDescription === "string",
    `${sourceLabel}: shortDescription yoxdur.`
  );
  assert(
    product.price === null ||
      (typeof product.price === "number" && Number.isFinite(product.price)),
    `${sourceLabel}: price number və ya null olmalıdır.`
  );
  assert(product.currency === "AZN", `${sourceLabel}: currency AZN olmalıdır.`);
  assert(Array.isArray(product.images), `${sourceLabel}: images massiv deyil.`);
  assert(typeof product.inStock === "boolean", `${sourceLabel}: inStock boolean deyil.`);

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  for (const [index, size] of sizes.entries()) {
    const sizeLabel = `${sourceLabel}.sizes[${index}]`;

    assert(size && typeof size === "object", `${sizeLabel}: obyekt deyil.`);
    assert(typeof size.id === "string" && size.id.trim(), `${sizeLabel}: id yoxdur.`);
    assert(typeof size.label === "string" && size.label.trim(), `${sizeLabel}: label yoxdur.`);
    assert(
      size.price === null ||
        (typeof size.price === "number" && Number.isFinite(size.price)),
      `${sizeLabel}: price number və ya null olmalıdır.`
    );
    assert(typeof size.inStock === "boolean", `${sizeLabel}: inStock boolean deyil.`);
  }
}

const base = readJson(paths.base);
const overridesDocument = readJson(paths.overrides);
const manualDocument = readJson(paths.manual);
const deletedDocument = readJson(paths.deleted);

assert(Array.isArray(base.products), "catalog-base.json daxilində products massivi yoxdur.");
assert(
  overridesDocument?.schemaVersion === 1 &&
    overridesDocument.products &&
    typeof overridesDocument.products === "object" &&
    !Array.isArray(overridesDocument.products),
  "product-overrides.json strukturu yanlışdır."
);
assert(
  manualDocument?.schemaVersion === 1 &&
    Array.isArray(manualDocument.products),
  "manual-products.json strukturu yanlışdır."
);
assert(
  deletedDocument?.schemaVersion === 1 &&
    Array.isArray(deletedDocument.productIds),
  "deleted-product-ids.json strukturu yanlışdır."
);

const baseProducts = base.products;
const baseById = new Map();

for (const [index, product] of baseProducts.entries()) {
  validateProduct(product, `catalog-base.products[${index}]`);

  assert(!baseById.has(product.id), `Təkrarlanan base product id: ${product.id}`);
  baseById.set(product.id, product);
}

const overrides = overridesDocument.products;

for (const [productId, product] of Object.entries(overrides)) {
  assert(
    baseById.has(productId),
    `Override yalnız base məhsula aid ola bilər: ${productId}`
  );
  assert(
    product?.id === productId,
    `Override key və product.id uyğun deyil: ${productId}`
  );

  validateProduct(product, `product-overrides.products.${productId}`);
}

const manualProducts = manualDocument.products;
const manualIds = new Set();

for (const [index, product] of manualProducts.entries()) {
  validateProduct(product, `manual-products.products[${index}]`);

  assert(
    !baseById.has(product.id),
    `Manual məhsul base product ID-si ilə toqquşur: ${product.id}`
  );
  assert(
    !manualIds.has(product.id),
    `Təkrarlanan manual product ID: ${product.id}`
  );

  manualIds.add(product.id);
}

const deletedIds = new Set();

for (const productId of deletedDocument.productIds) {
  assert(
    typeof productId === "string" && productId.trim(),
    "deleted-product-ids daxilində boş və ya yanlış ID var."
  );
  assert(
    baseById.has(productId) || manualIds.has(productId),
    `Silinən product ID kataloqda yoxdur: ${productId}`
  );

  deletedIds.add(productId);
}

const mergedProducts = [];

for (const baseProduct of baseProducts) {
  if (deletedIds.has(baseProduct.id)) {
    continue;
  }

  mergedProducts.push(overrides[baseProduct.id] ?? baseProduct);
}

for (const manualProduct of manualProducts) {
  if (!deletedIds.has(manualProduct.id)) {
    mergedProducts.push(manualProduct);
  }
}

const productIds = new Set();
const slugs = new Set();
const variantIds = new Set();
let variantCount = 0;

for (const [index, product] of mergedProducts.entries()) {
  validateProduct(product, `generated.products[${index}]`);

  assert(!productIds.has(product.id), `Təkrarlanan product ID: ${product.id}`);
  assert(!slugs.has(product.slug), `Təkrarlanan product slug: ${product.slug}`);

  productIds.add(product.id);
  slugs.add(product.slug);

  for (const size of product.sizes ?? []) {
    assert(!variantIds.has(size.id), `Təkrarlanan variant ID: ${size.id}`);
    variantIds.add(size.id);
    variantCount += 1;
  }
}

const generatedCatalog = {
  ...base,
  contentSchemaVersion: 1,
  catalogMode: "admin-owned",
  products: mergedProducts,
};

fs.mkdirSync(path.dirname(paths.output), { recursive: true });
fs.writeFileSync(
  paths.output,
  `${JSON.stringify(generatedCatalog, null, 2)}\n`,
  "utf8"
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      baseProducts: baseProducts.length,
      overrides: Object.keys(overrides).length,
      manualProducts: manualProducts.length,
      deletedProducts: deletedIds.size,
      generatedProducts: mergedProducts.length,
      generatedVariants: variantCount,
      output: path.relative(repositoryRoot, paths.output),
    },
    null,
    2
  )
);