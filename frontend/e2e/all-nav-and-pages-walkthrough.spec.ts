import { test, expect, Page } from '@playwright/test';

async function loginUser(page: Page, email: string) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Complete Application Surface & Navigation Walker', () => {

  test('Admin: Every sidebar menu link is clickable and renders cleanly (All 13 Admin Pages)', async ({ page }) => {
    // Listen for uncaught client-side JS runtime crashes
    const errors: Error[] = [];
    page.on('pageerror', (err) => errors.push(err));

    await loginUser(page, 'admin@ibistek.com');

    const adminRoutes = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Manajemen User', path: '/dashboard/users' },
      { name: 'Verifikasi User', path: '/dashboard/verify-users' },
      { name: 'Inkubasi Bisnis', path: '/dashboard/inkubasi' },
      { name: 'Konsultasi', path: '/dashboard/konsultasi' },
      { name: 'Mikro Kredensial', path: '/dashboard/mikro-kredensial' },
      { name: 'Sertifikat', path: '/dashboard/certificates' },
      { name: 'Events (CMS)', path: '/dashboard/events' },
      { name: 'Programs (CMS)', path: '/dashboard/programs' },
      { name: 'Updates (CMS)', path: '/dashboard/updates' },
      { name: 'Team (CMS)', path: '/dashboard/team' },
      { name: 'FAQ (CMS)', path: '/dashboard/faq' },
      { name: 'Master Data', path: '/dashboard/master-data' },
    ];

    for (const route of adminRoutes) {
      const link = page.locator(`aside[aria-label="Sidebar"] div.space-y-1 a[href="${route.path}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();

      // Wait for client-side navigation to complete
      await page.waitForURL(`**${route.path}**`, { timeout: 10000 });
      expect(page.url()).toContain(route.path);
      
      // Ensure page rendered without Next.js 404 error
      await expect(page.locator('h1.next-error-h1')).not.toBeVisible();
      await expect(page.getByText('This page could not be found')).not.toBeVisible();
    }

    // Verify 0 client errors across all 13 pages
    expect(errors.length).toBe(0);
  });

  test('Mahasiswa: All 5 student menus are clickable and accessible', async ({ page }) => {
    await loginUser(page, 'mahasiswa@ibistek.com');

    const mahasiswaRoutes = [
      '/dashboard',
      '/dashboard/inkubasi',
      '/dashboard/konsultasi',
      '/dashboard/mikro-kredensial',
      '/dashboard/certificates/my',
    ];

    for (const path of mahasiswaRoutes) {
      const link = page.locator(`aside[aria-label="Sidebar"] div.space-y-1 a[href="${path}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await page.waitForURL(`**${path}**`, { timeout: 10000 });
      expect(page.url()).toContain(path);
      await expect(page.locator('h1.next-error-h1')).not.toBeVisible();
    }
  });

  test('UMKM: All 3 UMKM menus are clickable and render cleanly', async ({ page }) => {
    await loginUser(page, 'umkm@ibistek.com');

    const umkmRoutes = [
      '/dashboard',
      '/dashboard/mikro-kredensial',
      '/dashboard/certificates/my',
    ];

    for (const path of umkmRoutes) {
      const link = page.locator(`aside[aria-label="Sidebar"] div.space-y-1 a[href="${path}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await page.waitForURL(`**${path}**`, { timeout: 10000 });
      expect(page.url()).toContain(path);
      await expect(page.locator('h1.next-error-h1')).not.toBeVisible();
    }
  });

  test('Public Surface: Register page, forms, and public routes work', async ({ page }) => {
    // Visit /register
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Daftar Akun|Registrasi/i);

    // Form inputs exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Visit /login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Visit public /verify-certificate
    await page.goto('/verify-certificate');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[placeholder*="sertifikat"]')).toBeVisible();
  });
});
