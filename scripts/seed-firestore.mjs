/**
 * seed-firestore.mjs
 *
 * One-time script to populate Firestore with the existing static product catalog.
 * Run after creating your Firebase project:
 *
 *   node scripts/seed-firestore.mjs
 *
 * Prerequisites:
 *   1. Create a Firebase service account key:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save the downloaded JSON as:  scripts/serviceAccountKey.json   (already in .gitignore)
 *   3. Ensure firebase-admin is available:
 *      npm install --save-dev firebase-admin
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Load service account ──────────────────────────────────────────────────────
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch {
  console.error('❌  Could not read scripts/serviceAccountKey.json');
  console.error('    Download it from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

// ── Dynamically import firebase-admin ────────────────────────────────────────
let admin;
try {
  admin = (await import('firebase-admin')).default;
} catch {
  console.error('❌  firebase-admin is not installed. Run:  npm install --save-dev firebase-admin');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── Load products from compiled JS (via tsx / ts-node) or from JSON dump ─────
// We read the generated JSON file instead of importing TypeScript directly.
const productsJsonPath = path.join(__dirname, '..', 'oilganic-products-with-images.json');
let products;
try {
  products = JSON.parse(readFileSync(productsJsonPath, 'utf8'));
  console.log(`📦  Loaded ${products.length} products from oilganic-products-with-images.json`);
} catch {
  console.error('❌  Could not read oilganic-products-with-images.json at project root.');
  process.exit(1);
}

// ── Write to Firestore in batches of 400 (Firestore limit is 500) ────────────
const BATCH_SIZE = 400;
let written = 0;

for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const chunk = products.slice(i, i + BATCH_SIZE);
  const batch = db.batch();

  chunk.forEach((product) => {
    const { id, ...rest } = product;
    const ref = db.collection('products').doc(id || `prod-${Date.now()}-${Math.random()}`);
    batch.set(ref, rest, { merge: true });
  });

  await batch.commit();
  written += chunk.length;
  console.log(`✅  Written ${written} / ${products.length} products`);
}

console.log('\n🎉  Seeding complete! Firestore now contains all products.');
console.log('    The live site will reflect these products immediately.');
process.exit(0);
