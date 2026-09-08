import { test, expect, Page } from '@playwright/test';

async function performLogin(page: Page, email: string, pass: string = 'password123') {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(pass);
  await page.locator('button[type="submit"]').click();
}

test.describe('Registration & Admin Verification Lifecycle (Positive & Negative)', () => {

  test('1. Negative Testing: Registration form validates empty and invalid inputs', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    // Attempt to submit empty form
    await page.locator('button[type="submit"]:has-text("Daftar Akun")').click();

    // Verify required field validation errors
    await expect(page.locator('body')).toContainText(/Nama minimal 3 karakter/i);
    await expect(page.locator('body')).toContainText(/Email tidak valid/i);
    await expect(page.locator('body')).toContainText(/Password minimal 6 karakter/i);
    await expect(page.locator('body')).toContainText(/Nomor WhatsApp tidak valid/i);
    await expect(page.locator('body')).toContainText(/NPM wajib diisi/i);

    // Test invalid email format
    await page.locator('input[name="email"]').fill('not-an-email');
    await page.locator('button[type="submit"]:has-text("Daftar Akun")').click();
    await expect(page.locator('body')).toContainText(/Email tidak valid/i);

    // Test short password
    await page.locator('input[name="password"]').fill('123');
    await page.locator('button[type="submit"]:has-text("Daftar Akun")').click();
    await expect(page.locator('body')).toContainText(/Password minimal 6 karakter/i);
  });

  test('2. Negative Testing: Registering duplicate email returns API error', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    // Fill valid data but with an already registered email
    await page.locator('input[name="name"]').fill('Duplikat User');
    await page.locator('input[name="email"]').fill('mahasiswa@ibistek.com');
    await page.locator('input[name="noWhatsApp"]').fill('081234567890');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="npm"]').fill('5210411888');

    // Select Program Studi
    const prodiSelect = page.locator('button:has-text("Pilih Program Studi")');
    await prodiSelect.click();
    await page.locator('[role="option"]:has-text("Teknik Informatika")').click();

    await page.locator('button[type="submit"]:has-text("Daftar Akun")').click();

    // Verify error from backend
    await expect(page.locator('form')).toContainText(/Email sudah terdaftar/i, { timeout: 10000 });
  });

  test('3. Complete E2E Lifecycle: Register new Mahasiswa -> Blocked login -> Admin ACC -> Login success', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `mhs_${timestamp}@ibistek.com`;
    const fullName = `Mahasiswa Uji ${timestamp.toString().slice(-4)}`;

    // ── STEP 1: Registration Form ──
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[name="name"]').fill(fullName);
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="noWhatsApp"]').fill('081233445566');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="npm"]').fill(`5210${timestamp.toString().slice(-6)}`);

    // Select Program Studi
    const prodiSelect = page.locator('button:has-text("Pilih Program Studi")');
    await prodiSelect.click();
    await page.locator('[role="option"]').first().click();

    // Submit form
    await page.locator('button[type="submit"]:has-text("Daftar Akun")').click();

    // Verify success banner and pending message
    await expect(page.locator('body')).toContainText(/Sukses Mendaftar!/i, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(/menunggu verifikasi dari admin/i);

    // ── STEP 2: Attempt Login BEFORE Verification ──
    await performLogin(page, uniqueEmail, 'password123');

    // Verify 403 error message from backend
    await expect(page.locator('form')).toContainText(/belum diverifikasi oleh Admin/i, { timeout: 10000 });
    expect(page.url()).toContain('/login');

    // ── STEP 3: Admin Verifies & Approves (ACC) User ──
    await performLogin(page, 'admin@ibistek.com', 'password123');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate to Verifikasi User page
    await page.goto('/dashboard/verify-users');
    await page.waitForLoadState('domcontentloaded');

    // Search for the newly registered user
    const searchInput = page.getByPlaceholder(/Cari nama atau email/i);
    await searchInput.fill(uniqueEmail);
    await page.waitForTimeout(1000); // debounce wait

    // Ensure the user appears in the pending table
    const userRow = page.locator(`tr:has-text("${uniqueEmail}")`);
    await expect(userRow).toBeVisible({ timeout: 10000 });
    await expect(userRow).toContainText(fullName);

    // Click Approve button (Check icon)
    const approveBtn = userRow.locator('button[title="Setujui (Approve)"]');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Confirm dialog appears
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Setujui Akun/i);

    // Click "Ya, Setujui Akun"
    const confirmApproveBtn = dialog.locator('button:has-text("Ya, Setujui Akun")');
    await confirmApproveBtn.click();

    // Wait for approval to complete (dialog closes)
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Clear session / Logout Admin
    await page.context().clearCookies();

    // ── STEP 4: Login Succeeded AFTER Admin ACC ──
    await performLogin(page, uniqueEmail, 'password123');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Verify authenticated session and sidebar
    const sidebar = page.locator('aside[aria-label="Sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText(fullName);
    await expect(sidebar).toContainText(/Inkubasi Bisnis|Konsultasi|Mikro Kredensial/i);
  });

});
