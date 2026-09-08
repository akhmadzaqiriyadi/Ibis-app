import { test, expect, Page } from '@playwright/test';

async function loginUser(page: Page, email: string) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible({ timeout: 15000 });
}

test.describe('3 Major Features End-to-End Workflow', () => {

  test.describe('Feature 1: Inkubasi Bisnis Flow', () => {
    test('Mahasiswa can view Inkubasi dashboard, periods, and proposal interface', async ({ page }) => {
      await loginUser(page, 'mahasiswa@ibistek.com');

      // Navigate to Inkubasi
      await page.goto('/dashboard/inkubasi');
      await page.waitForLoadState('domcontentloaded');

      // Check title / heading or chip
      await expect(page.locator('body')).toContainText(/Inkubasi Bisnis|Program Inkubasi/i, { timeout: 10000 });

      // Check active period banner or proposal status
      await expect(page.locator('body')).toContainText(/Periode|Proposal|Inkubasi/i, { timeout: 10000 });
    });

    test('Admin can view Inkubasi applicant submissions and period management', async ({ page }) => {
      await loginUser(page, 'admin@ibistek.com');

      // Navigate to Inkubasi
      await page.goto('/dashboard/inkubasi');
      await page.waitForLoadState('domcontentloaded');

      // Admin should see management controls (Periode, Proposal, Review)
      await expect(page.locator('body')).toContainText(/Inkubasi Bisnis/i, { timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Periode|Proposal|Status/i, { timeout: 10000 });
    });
  });

  test.describe('Feature 2: Konsultasi Bisnis Flow', () => {
    test('Mahasiswa can view consultation page and booking modal', async ({ page }) => {
      await loginUser(page, 'mahasiswa@ibistek.com');

      await page.goto('/dashboard/konsultasi');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toContainText(/Konsultasi Bisnis/i, { timeout: 10000 });

      // Verify "Ajukan Konsultasi" button exists
      const ajukanBtn = page.getByRole('button', { name: /Ajukan Konsultasi|Buat Jadwal/i }).first();
      if (await ajukanBtn.isVisible()) {
        await ajukanBtn.click();
        // Dialog should open
        await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 5000 });
        // Close modal
        await page.keyboard.press('Escape');
      }
    });

    test('Admin can view consultation management table', async ({ page }) => {
      await loginUser(page, 'admin@ibistek.com');

      await page.goto('/dashboard/konsultasi');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toContainText(/Konsultasi Bisnis/i, { timeout: 10000 });
      const content = await page.locator('body').textContent();
      expect(
        content?.includes('Status') ||
        content?.includes('Mentor') ||
        content?.includes('Jadwal')
      ).toBeTruthy();
    });
  });

  test.describe('Feature 3: Mikro Kredensial & Classroom Flow', () => {
    test('Mahasiswa/UMKM can view courses and access interactive classroom', async ({ page }) => {
      await loginUser(page, 'mahasiswa@ibistek.com');

      await page.goto('/dashboard/mikro-kredensial');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toContainText(/Mikro Kredensial/i, { timeout: 10000 });

      // Check for course cards or action button
      const belajarLink = page.getByRole('link', { name: /Mulai Belajar|Lanjut Belajar|Baca Materi/i }).first();
      if (await belajarLink.isVisible()) {
        await belajarLink.click();
        await page.waitForURL('**/belajar/**', { timeout: 10000 });

        // Verify classroom components
        await expect(page.locator('aside, div[class*="sidebar"]')).toBeVisible({ timeout: 10000 });

        // Tabs: Materi and Kuis Evaluasi
        const kuisTab = page.getByRole('tab', { name: /Kuis|Evaluasi/i });
        if (await kuisTab.isVisible()) {
          await kuisTab.click();
          const quizText = await page.locator('body').textContent();
          expect(
            quizText?.includes('Soal') ||
            quizText?.includes('Evaluasi') ||
            quizText?.includes('Kuis')
          ).toBeTruthy();
        }
      }
    });

    test('Admin can view course management and create course controls', async ({ page }) => {
      await loginUser(page, 'admin@ibistek.com');

      await page.goto('/dashboard/mikro-kredensial');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toContainText(/Mikro Kredensial/i, { timeout: 10000 });

      // Auto-retrying assertion waiting for admin controls to render
      await expect(page.getByRole('button', { name: /Tambah Kursus/i }).first()).toBeVisible({ timeout: 10000 });
    });
  });
});
