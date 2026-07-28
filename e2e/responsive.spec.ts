import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { PRODUCTS } from '../src/data/products';

const screenshotDir = path.resolve('public/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const matrix = [
  { name: 'mobile_portrait_320', width: 320, height: 568 },
  { name: 'mobile_portrait_390', width: 390, height: 844 },
  { name: 'mobile_landscape_844', width: 844, height: 390 },
  { name: 'tablet_portrait_768', width: 768, height: 1024 },
  { name: 'desktop_1024', width: 1024, height: 768 },
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'desktop_1920', width: 1920, height: 1080 }
];

test.describe('Responsive Design & Viewport Assurance Pass', () => {
  for (const vp of matrix) {
    test(`Home Page at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Check header visibility
      await expect(page.locator('header')).toBeVisible();

      // Check zero horizontal overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width);

      // Save screenshot evidence
      await page.screenshot({
        path: path.join(screenshotDir, `home_${vp.name}.png`),
        fullPage: false
      });
    });
  }

  test('Mobile Menu Open State (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuBtn = page.locator('button[aria-label="Menyunu aç"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    await expect(page.locator('nav[aria-label="Mobil Menyu"]')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'mobile_menu_open_390x844.png') });
  });

  test('Mobile Landscape Menu Usability (844x390)', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');

    const menuBtn = page.locator('button[aria-label="Menyunu aç"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    await expect(page.locator('nav[aria-label="Mobil Menyu"]')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'mobile_menu_landscape_844x390.png') });
  });

  test('Cart Drawer Open with Items (390x844 & 1440x900)', async ({ page }) => {
    // 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products');

    const addBtn = page.locator('button[title="Səbətə əlavə et"]').first();
    await addBtn.click();

    await expect(page.locator('text=Sifariş səbəti')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'cart_drawer_390x844.png') });

    // 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, 'cart_drawer_1440x900.png') });
  });

  test('Products Catalog Page Viewports (390x844 & 1440x900)', async ({ page }) => {
    // 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products');
    await expect(page.locator('h1')).toHaveText(/Təbii məhsul kataloqu/i);

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
    await page.screenshot({ path: path.join(screenshotDir, 'products_390x844.png') });

    // 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, 'products_1440x900.png') });
  });

  test('Product Detail Page Viewports (390x844 & 1440x900)', async ({ page }) => {
    const validSlug = PRODUCTS[0].slug;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/products/${validSlug}`);
    await expect(page.locator('h1')).toBeVisible();

    await page.screenshot({ path: path.join(screenshotDir, 'product_detail_390x844.png') });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, 'product_detail_1440x900.png') });
  });

  test('Reduced Motion Preference (1440x900)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, 'reduced_motion_home_1440x900.png') });
  });
});
