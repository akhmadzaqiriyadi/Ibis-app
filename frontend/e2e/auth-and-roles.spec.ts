import { test, expect } from '@playwright/test';

test.describe('Authentication & Role Access Boundaries', () => {
  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[name="email"]').fill('wrong@ibistek.com');
    await page.locator('input[name="password"]').fill('wrongpass');
    await page.locator('button[type="submit"]').click();

    // Check error alert
    await expect(page.locator('form')).toContainText(/salah|gagal|invalid/i, { timeout: 8000 });
  });

  test('UMKM role enforcement: exclusive Mikro Kredensial, Inkubasi & Konsultasi access, restricted from Admin features', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[name="email"]').fill('umkm@ibistek.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard navigation
    await page.waitForURL('**/dashboard**', { timeout: 15000 });

    // UMKM should see Mikro Kredensial, Inkubasi, Konsultasi and Sertifikat Saya
    await expect(page.locator('aside, nav')).toContainText(/Mikro Kredensial/i, { timeout: 10000 });
    await expect(page.locator('aside, nav')).toContainText(/Inkubasi Bisnis/i, { timeout: 10000 });
    await expect(page.locator('aside, nav')).toContainText(/Konsultasi/i, { timeout: 10000 });
    await expect(page.locator('aside, nav')).toContainText(/Sertifikat Saya/i, { timeout: 10000 });

    // UMKM MUST NOT see Admin menus
    const navText = await page.locator('aside, nav').first().textContent();
    expect(navText?.includes('Manajemen User')).toBeFalsy();
    expect(navText?.includes('Master Data')).toBeFalsy();
    expect(navText?.includes('Verifikasi User')).toBeFalsy();

    // Direct navigation attempt to /dashboard/users should be blocked
    await page.goto('/dashboard/users');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Akses Ditolak|khusus Admin/i);
  });

  test('Mentor role has access to mentor consultation panel', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[name="email"]').fill('mentor@ibistek.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dashboard**', { timeout: 15000 });

    // Visit mentor consultation page
    await page.goto('/dashboard/konsultasi/mentor');
    await page.waitForLoadState('domcontentloaded');

    // Panel content should be visible
    await expect(page.locator('body')).toContainText(/Konsultasi|Mentor|Bimbingan/i, { timeout: 10000 });
  });
});
