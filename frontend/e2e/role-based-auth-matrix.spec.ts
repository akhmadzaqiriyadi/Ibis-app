import { test, expect, Page } from '@playwright/test';

async function performLogin(page: Page, email: string, pass: string = 'password123') {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(pass);
  await page.locator('button[type="submit"]').click();
}

test.describe('Role-Based Access Control (RBAC) & Authentication Matrix', () => {

  test('1. Role ADMIN: Full system access, all 13 CMS menus visible, user management accessible', async ({ page }) => {
    await performLogin(page, 'admin@ibistek.com');

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const sidebar = page.locator('aside[aria-label="Sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify Admin identity displayed in sidebar
    await expect(sidebar).toContainText(/Admin/i);

    // Verify all 13 menus exist in sidebar
    const expectedAdminMenus = [
      'Dashboard',
      'Manajemen User',
      'Verifikasi User',
      'Inkubasi Bisnis',
      'Konsultasi',
      'Mikro Kredensial',
      'Sertifikat',
      'Events (CMS)',
      'Programs (CMS)',
      'Updates (CMS)',
      'Team (CMS)',
      'FAQ (CMS)',
      'Master Data',
    ];

    for (const menu of expectedAdminMenus) {
      await expect(sidebar.locator(`text=${menu}`)).toBeVisible();
    }

    // Verify Admin can access protected Manajemen User page
    await page.goto('/dashboard/users');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Manajemen User|Daftar Pengguna/i);

    // Test Logout
    const logoutBtn = sidebar.getByRole('button', { name: /Logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Role STAFF: Operational CMS access and management functions', async ({ page }) => {
    await performLogin(page, 'staff@ibistek.com');

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const sidebar = page.locator('aside[aria-label="Sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify Staff identity
    await expect(sidebar).toContainText(/Staff/i);

    // Verify Staff can access Events CMS
    await page.goto('/dashboard/events');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Events|Manajemen Event/i);

    // Logout
    await sidebar.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('3. Role MENTOR: Access to consultation tasks panel, admin menus restricted', async ({ page }) => {
    await performLogin(page, 'mentor@ibistek.com');

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const sidebar = page.locator('aside[aria-label="Sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify Mentor profile name
    await expect(sidebar).toContainText(/Budi Santoso|Mentor/i);

    // Verify Mentor navigation items
    await expect(sidebar.locator('text=Dashboard')).toBeVisible();
    await expect(sidebar.locator('text=Tugas Konsultasi')).toBeVisible();

    // Verify Admin-only menus MUST NOT be present
    const sidebarText = await sidebar.textContent();
    expect(sidebarText?.includes('Manajemen User')).toBeFalsy();
    expect(sidebarText?.includes('Master Data')).toBeFalsy();
    expect(sidebarText?.includes('Verifikasi User')).toBeFalsy();

    // Verify Mentor can open Tugas Konsultasi page
    await page.goto('/dashboard/konsultasi/mentor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Konsultasi|Tugas|Jadwal/i);

    // Logout
    await sidebar.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('4. Role MAHASISWA: Full student workspace (Inkubasi, Konsultasi, Mikro Kredensial, Sertifikat)', async ({ page }) => {
    await performLogin(page, 'mahasiswa@ibistek.com');

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const sidebar = page.locator('aside[aria-label="Sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify Student name
    await expect(sidebar).toContainText(/Ahmad Fauzi|Mahasiswa/i);

    // Verify exact Student menu items
    await expect(sidebar.locator('text=Dashboard')).toBeVisible();
    await expect(sidebar.locator('text=Inkubasi Bisnis')).toBeVisible();
    await expect(sidebar.locator('text=Konsultasi')).toBeVisible();
    await expect(sidebar.locator('text=Mikro Kredensial')).toBeVisible();
    await expect(sidebar.locator('text=Sertifikat Saya')).toBeVisible();

    // Admin menus MUST NOT be present
    const sidebarText = await sidebar.textContent();
    expect(sidebarText?.includes('Manajemen User')).toBeFalsy();
    expect(sidebarText?.includes('Master Data')).toBeFalsy();
    expect(sidebarText?.includes('Verifikasi User')).toBeFalsy();

    // Access Sertifikat Saya page
    await page.goto('/dashboard/certificates/my');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Sertifikat/i);

    // Logout
    await sidebar.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('5. Role UMKM: Tailored business workspace (Mikro Kredensial & Sertifikat), restricted from student programs', async ({ page }) => {
    await performLogin(page, 'umkm@ibistek.com');

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const sidebar = page.locator('aside[aria-label="Sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify UMKM name
    await expect(sidebar).toContainText(/Sari Batik|UMKM/i);

    // UMKM menus
    await expect(sidebar.locator('text=Dashboard')).toBeVisible();
    await expect(sidebar.locator('text=Mikro Kredensial')).toBeVisible();
    await expect(sidebar.locator('text=Sertifikat Saya')).toBeVisible();

    // Inkubasi & Konsultasi are Mahasiswa only and must NOT be in UMKM sidebar
    const sidebarText = await sidebar.textContent();
    expect(sidebarText?.includes('Inkubasi Bisnis')).toBeFalsy();
    expect(sidebarText?.includes('Konsultasi')).toBeFalsy();
    expect(sidebarText?.includes('Manajemen User')).toBeFalsy();

    // Access Mikro Kredensial
    await page.goto('/dashboard/mikro-kredensial');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Mikro Kredensial/i);

    // Logout
    await sidebar.getByRole('button', { name: /Logout/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('6. Security & Negative Auth: Invalid credentials show error and protect dashboard', async ({ page }) => {
    // 6.1 Attempt invalid password
    await performLogin(page, 'admin@ibistek.com', 'wrongpassword999');
    await expect(page.locator('form')).toContainText(/salah|gagal|invalid/i, { timeout: 8000 });
    // Ensure still on login page
    expect(page.url()).toContain('/login');

    // 6.2 Attempt non-existent email
    await performLogin(page, 'ghost@nonexistent.com', 'somepassword');
    await expect(page.locator('form')).toContainText(/salah|gagal|invalid|tidak ditemukan/i, { timeout: 8000 });
    expect(page.url()).toContain('/login');

    // 6.3 Direct unauthenticated access to /dashboard is intercepted
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await page.waitForURL('**/login**', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

});
