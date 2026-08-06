import { NetlifyEvent, NetlifyResponse, jsonResponse, errorResponse, isAllowedOrigin } from './_shared/http';
import { getSessionFromHeaders } from './_shared/auth';
import { verifyCsrfToken } from './_shared/csrf';
import { getGitHubConfig, fetchGitHubFile, commitSingleFileToGitHub } from './_shared/github';
import { validateProductServer } from './_shared/validation';
import { Product } from '../../src/types/product';

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (!['POST', 'PATCH', 'DELETE'].includes(event.httpMethod)) {
    return errorResponse(405, 'Method Not Allowed');
  }

  if (!isAllowedOrigin(event)) {
    return errorResponse(403, 'Forbidden origin');
  }

  const session = getSessionFromHeaders(event.headers);
  if (!session) {
    return errorResponse(401, 'Sessiyanın vaxtı bitib və ya daxil olunmayıb.');
  }

  const csrfToken = event.headers['x-csrf-token'] || event.headers['X-CSRF-Token'];
  if (!verifyCsrfToken(session, csrfToken)) {
    return errorResponse(403, 'CSRF doğrulama xətası.');
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return errorResponse(400, 'Invalid JSON body');
  }

  const action = (body.action as string) || (event.httpMethod === 'DELETE' ? 'delete' : event.httpMethod === 'PATCH' ? 'update' : 'create');
  const ghConfig = getGitHubConfig();

  try {
    // Read source files from GitHub
    const baseFile = await fetchGitHubFile(ghConfig, 'content/catalog-base.json');
    const overridesFile = await fetchGitHubFile(ghConfig, 'content/product-overrides.json');
    const manualFile = await fetchGitHubFile(ghConfig, 'content/manual-products.json');
    const deletedFile = await fetchGitHubFile(ghConfig, 'content/deleted-product-ids.json');

    const baseCatalog = JSON.parse(baseFile.content);
    const overridesDoc = JSON.parse(overridesFile.content);
    const manualDoc = JSON.parse(manualFile.content);
    const deletedDoc = JSON.parse(deletedFile.content);

    const baseProducts: Product[] = baseCatalog.products || [];
    const baseIds = new Set(baseProducts.map(p => p.id));
    const manualProducts: Product[] = manualDoc.products || [];
    const manualIds = new Set(manualProducts.map(p => p.id));
    const deletedIds = new Set<string>(deletedDoc.productIds || []);

    if (action === 'reset') {
      const resetOverrides = `${JSON.stringify({ schemaVersion: 1, products: {} }, null, 2)}\n`;
      const resetManual = `${JSON.stringify({ schemaVersion: 1, products: [] }, null, 2)}\n`;
      const resetDeleted = `${JSON.stringify({ schemaVersion: 1, productIds: [] }, null, 2)}\n`;

      await commitSingleFileToGitHub(
        ghConfig,
        'content/product-overrides.json',
        resetOverrides,
        'content: reset product overrides',
        overridesFile.sha
      );

      await commitSingleFileToGitHub(
        ghConfig,
        'content/manual-products.json',
        resetManual,
        'content: reset manual products',
        manualFile.sha
      );

      await commitSingleFileToGitHub(
        ghConfig,
        'content/deleted-product-ids.json',
        resetDeleted,
        'content: reset deleted products',
        deletedFile.sha
      );

      return jsonResponse(200, {
        success: true,
        message: 'Bütün məhsullar ilkin vəziyyətinə qaytarıldı, yenilənmə yayımlanır'
      });
    }

    if (action === 'create') {
      const product = validateProductServer(body.product);

      if (baseIds.has(product.id) || manualIds.has(product.id)) {
        return errorResponse(400, `Product ID artıq mövcuddur: ${product.id}`);
      }

      // Check unique slug across all active products
      const allSlugs = new Set<string>();
      for (const p of baseProducts) {
        if (!deletedIds.has(p.id)) {
          const override = overridesDoc.products?.[p.id];
          allSlugs.add(override?.slug || p.slug);
        }
      }
      for (const p of manualProducts) {
        if (!deletedIds.has(p.id)) allSlugs.add(p.slug);
      }

      if (allSlugs.has(product.slug)) {
        return errorResponse(400, `Product slug artıq mövcuddur: ${product.slug}`);
      }

      manualProducts.push(product);
      manualDoc.products = manualProducts;

      const updatedContent = `${JSON.stringify(manualDoc, null, 2)}\n`;
      await commitSingleFileToGitHub(
        ghConfig,
        'content/manual-products.json',
        updatedContent,
        `content: add product ${product.name}`,
        manualFile.sha
      );

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        productId: product.id
      });
    }

    if (action === 'update') {
      const product = validateProductServer(body.product);
      const isBase = baseIds.has(product.id);
      const isManual = manualIds.has(product.id);

      if (!isBase && !isManual) {
        return errorResponse(404, `Məhsul tapılmadı: ${product.id}`);
      }

      if (isBase) {
        overridesDoc.products = overridesDoc.products || {};
        overridesDoc.products[product.id] = product;

        const updatedContent = `${JSON.stringify(overridesDoc, null, 2)}\n`;
        await commitSingleFileToGitHub(
          ghConfig,
          'content/product-overrides.json',
          updatedContent,
          `content: update product ${product.name}`,
          overridesFile.sha
        );
      } else {
        const idx = manualProducts.findIndex(p => p.id === product.id);
        if (idx !== -1) {
          manualProducts[idx] = product;
        } else {
          manualProducts.push(product);
        }
        manualDoc.products = manualProducts;

        const updatedContent = `${JSON.stringify(manualDoc, null, 2)}\n`;
        await commitSingleFileToGitHub(
          ghConfig,
          'content/manual-products.json',
          updatedContent,
          `content: update product ${product.name}`,
          manualFile.sha
        );
      }

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        productId: product.id
      });
    }

    if (action === 'delete') {
      const productId = (body.productId as string) || (body.id as string);
      if (!productId) {
        return errorResponse(400, 'Product ID tələb olunur.');
      }

      const isBase = baseIds.has(productId);
      const isManual = manualIds.has(productId);

      if (!isBase && !isManual) {
        return errorResponse(404, `Məhsul tapılmadı: ${productId}`);
      }

      if (isBase) {
        if (!deletedIds.has(productId)) {
          deletedDoc.productIds = Array.from(new Set([...(deletedDoc.productIds || []), productId]));
          const updatedContent = `${JSON.stringify(deletedDoc, null, 2)}\n`;
          await commitSingleFileToGitHub(
            ghConfig,
            'content/deleted-product-ids.json',
            updatedContent,
            `content: delete product ${productId}`,
            deletedFile.sha
          );
        }
      } else {
        manualDoc.products = manualProducts.filter(p => p.id !== productId);
        const updatedContent = `${JSON.stringify(manualDoc, null, 2)}\n`;
        await commitSingleFileToGitHub(
          ghConfig,
          'content/manual-products.json',
          updatedContent,
          `content: delete product ${productId}`,
          manualFile.sha
        );
      }

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        productId
      });
    }

    if (action === 'restore') {
      const productId = (body.productId as string) || (body.id as string);
      if (!productId) return errorResponse(400, 'Product ID tələb olunur.');

      let fileToCommit = null;
      let sha = undefined;
      let targetPath = '';

      if (deletedIds.has(productId)) {
        deletedDoc.productIds = (deletedDoc.productIds || []).filter((id: string) => id !== productId);
        fileToCommit = `${JSON.stringify(deletedDoc, null, 2)}\n`;
        sha = deletedFile.sha;
        targetPath = 'content/deleted-product-ids.json';
      } else if (overridesDoc.products?.[productId]) {
        delete overridesDoc.products[productId];
        fileToCommit = `${JSON.stringify(overridesDoc, null, 2)}\n`;
        sha = overridesFile.sha;
        targetPath = 'content/product-overrides.json';
      }

      if (fileToCommit && targetPath) {
        await commitSingleFileToGitHub(
          ghConfig,
          targetPath,
          fileToCommit,
          `content: restore product ${productId}`,
          sha
        );
      }

      return jsonResponse(200, {
        success: true,
        message: 'Saxlanıldı, yenilənmə yayımlanır',
        productId
      });
    }

    return errorResponse(400, `Naməlum əməliyyat: ${action}`);
  } catch (e: unknown) {
    const err = e as Error;
    if (err.message && err.message.includes('409 Conflict')) {
      return errorResponse(409, 'Eyni vaxtda başqa redaktə baş verdiyi üçün ziddiyyət yarandı. Səhifəni yeniləyib yenidən cəhd edin.');
    }
    return errorResponse(500, `Məhsul saxlanılarkən xəta baş verdi: ${err.message}`);
  }
}
