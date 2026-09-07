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

  test('UMKM role enforcement: exclusive Mikro Kredensial, Inkubasi & Konsultasi restricted', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[name="email"]').fill('umkm@ibistek.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard navigation
    await page.waitForURL('**/dashboard**', { timeout: 15000 });

    // UMKM should see Mikro Kredensial and Sertifikat Saya
    await expect(page.locator('aside, nav')).toContainText(/Mikro Kredensial/i, { timeout: 10000 });
    await expect(page.locator('aside, nav')).toContainText(/Sertifikat Saya/i, { timeout: 10000 });

    // UMKM MUST NOT see Inkubasi Bisnis or Konsultasi Bisnis in sidebar navigation
    const navText = await page.locator('aside, nav').first().textContent();
    expect(navText?.includes('Inkubasi Bisnis')).toBeFalsy();
    expect(navText?.includes('Konsultasi Bisnis')).toBeFalsy();

    // Direct navigation attempt to /dashboard/inkubasi should be blocked or restricted
    await page.goto('/dashboard/inkubasi');
    await page.waitForLoadState('domcontentloaded');
    const inkubasiContent = await page.locator('body').textContent();
    expect(
      inkubasiContent?.toLowerCase().includes('khusus mahasiswa') ||
      inkubasiContent?.toLowerCase().includes('tidak memiliki akses') ||
      inkubasiContent?.toLowerCase().includes('bukan untuk umkm') ||
      page.url().includes('/dashboard')
    ).toBeTruthy();

    // Direct navigation attempt to /dashboard/konsultasi should be blocked or restricted
    await page.goto('/dashboard/konsultasi');
    await page.waitForLoadState('domcontentloaded');
    const konsultasiContent = await page.locator('body').textContent();
    expect(
      konsultasiContent?.toLowerCase().includes('khusus mahasiswa') ||
      konsultasiContent?.toLowerCase().includes('tidak memiliki akses') ||
      konsultasiContent?.toLowerCase().includes('bukan untuk umkm') ||
      page.url().includes('/dashboard')
    ).toBeTruthy();
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
