import { test, expect } from '@playwright/test';

test.describe('Public Web Flows & Navigation', () => {
  test('Landing page loads and displays core sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check brand/logo or title
    await expect(page).toHaveTitle(/IBIS|Inkubator Bisnis/i);

    // Check navbar exists
    const nav = page.locator('header');
    await expect(nav).toBeVisible();

    // Check Sign In / Login link exists
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeAttached();

    // Check Hero content
    await expect(page.locator('body')).toContainText(/Mewujudkan Inovasi/i);

    // Verify footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('Public certificate verification page works', async ({ page }) => {
    await page.goto('/verify-certificate');
    await page.waitForLoadState('domcontentloaded');

    // Heading should be visible
    await expect(page.getByRole('heading', { name: /Verifikasi Sertifikat/i })).toBeVisible();

    // Search input should be present
    const searchInput = page.getByPlaceholder(/nomor sertifikat/i);
    await expect(searchInput).toBeVisible();

    // Search an invalid certificate number to verify error state
    await searchInput.fill('INVALID-CERT-99999');
    await page.getByRole('button', { name: /Cek Validitas/i }).click();

    // Verify error / not found message
    await expect(page.getByText(/tidak ditemukan|tidak valid/i)).toBeVisible({ timeout: 10000 });
  });

  test('Public pages: Events & Our Team are accessible', async ({ page }) => {
    // Visit Events
    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Wujudkan ide|Event/i);

    // Visit Our Team
    await page.goto('/our-team');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Pembina|Mentor|Tim/i);
  });
});
