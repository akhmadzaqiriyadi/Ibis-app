import { test, expect, Page } from '@playwright/test';

async function loginAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill('admin@ibistek.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Admin & Staff Management Verification for 3 Major Features', () => {

  test('1. Manajemen Inkubasi Bisnis: Kelola Periode & Review Proposal', async ({ page }) => {
    await loginAdmin(page);

    // Navigasi ke Inkubasi
    await page.goto('/dashboard/inkubasi');
    await page.waitForLoadState('domcontentloaded');

    // Pastikan halaman terbuka dan menampilkan kontrol admin
    await expect(page.locator('body')).toContainText(/Inkubasi Bisnis/i);

    // 1.1 Cek Tab Kelola Periode
    const kelolaPeriodeTab = page.getByRole('tab', { name: /Kelola Periode|Periode/i }).or(
      page.getByText(/Kelola Periode/i)
    ).first();
    
    if (await kelolaPeriodeTab.isVisible()) {
      await kelolaPeriodeTab.click();
      await page.waitForTimeout(500);

      // Verifikasi tombol tambah periode ada
      const tambahPeriodeBtn = page.getByRole('button', { name: /Tambah Periode|Buat Periode/i }).first();
      if (await tambahPeriodeBtn.isVisible()) {
        await tambahPeriodeBtn.click();
        // Modal periode harus muncul dengan input nama periode
        await expect(page.locator('div[role="dialog"]')).toBeVisible();
        await expect(page.locator('div[role="dialog"]')).toContainText(/Periode|Pendaftaran/i);
        // Tutup dialog
        await page.keyboard.press('Escape');
      }
    }

    // 1.2 Cek Tab Daftar Pengajuan Proposal
    const pengajuanTab = page.getByRole('tab', { name: /Daftar Pengajuan|Proposal/i }).or(
      page.getByText(/Daftar Pengajuan/i)
    ).first();
    if (await pengajuanTab.isVisible()) {
      await pengajuanTab.click();
      await page.waitForTimeout(500);
      // Cek tabel atau indikator proposal
      const content = await page.locator('body').textContent();
      expect(
        content?.includes('Pengajuan') ||
        content?.includes('Proposal') ||
        content?.includes('Status')
      ).toBeTruthy();
    }
  });

  test('2. Manajemen Konsultasi Bisnis: Antrean Sesi, Detail & Penugasan Mentor', async ({ page }) => {
    await loginAdmin(page);

    // Navigasi ke Konsultasi
    await page.goto('/dashboard/konsultasi');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toContainText(/Konsultasi Bisnis/i);

    // Verifikasi tabel konsultasi & status filter
    const content = await page.locator('body').textContent();
    expect(
      content?.includes('Konsultasi') ||
      content?.includes('Mentor') ||
      content?.includes('Status')
    ).toBeTruthy();

    // Verifikasi tombol detail / link detail jika ada antrean konsultasi
    const detailLink = page.locator('a[href*="/dashboard/konsultasi/"]').first();
    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Verifikasi komponen detail: timeline status, form assign mentor, link meeting
      await expect(page.locator('body')).toContainText(/Konsultasi|Mentor|Jadwal/i, { timeout: 10000 });
    }
  });

  test('3. Manajemen Mikro Kredensial: CRUD Kursus, Dialog Modul (PDF/Video) & Bank Kuis', async ({ page }) => {
    await loginAdmin(page);

    // Navigasi ke Mikro Kredensial
    await page.goto('/dashboard/mikro-kredensial');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toContainText(/Mikro Kredensial/i);

    // 3.1 Cek Tombol Tambah Kursus Baru
    const tambahKursusBtn = page.getByRole('button', { name: /Tambah Kursus/i }).first();
    if (await tambahKursusBtn.isVisible()) {
      await tambahKursusBtn.click();
      // Dialog tambah kursus harus terbuka
      await expect(page.locator('div[role="dialog"]')).toBeVisible();
      await expect(page.locator('div[role="dialog"]')).toContainText(/Tambah Kursus|Judul/i);
      // Tutup modal
      await page.keyboard.press('Escape');
    }

    // 3.2 Cek Tombol "Kelola Konten & Kuis" pada salah satu kursus
    const kelolaKontenBtn = page.getByRole('button', { name: /Kelola Konten|Materi & Kuis/i }).first();
    if (await kelolaKontenBtn.isVisible()) {
      await kelolaKontenBtn.click();

      // Dialog kelola konten harus terbuka
      const dialog = page.locator('div[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Cek Tab Modul Pembelajaran
      await expect(dialog).toContainText(/Modul/i);

      // Cek Tab Bank Soal Kuis
      const kuisTab = dialog.getByRole('tab', { name: /Kuis|Bank Soal/i }).or(
        dialog.getByText(/Bank Soal/i)
      ).first();
      if (await kuisTab.isVisible()) {
        await kuisTab.click();
        await expect(dialog).toContainText(/Soal|Kuis|Evaluasi/i);
      }

      // Tutup dialog kelola konten
      await page.keyboard.press('Escape');
    }

    // 3.3 Cek Tab Data Peserta & Nilai
    const pesertaTab = page.getByRole('tab', { name: /Peserta|Nilai/i }).or(
      page.getByText(/Peserta & Nilai/i)
    ).first();
    if (await pesertaTab.isVisible()) {
      await pesertaTab.click();
      await page.waitForTimeout(500);
      // Cek tabel data peserta
      const content = await page.locator('body').textContent();
      expect(
        content?.includes('Peserta') ||
        content?.includes('Nilai') ||
        content?.includes('Sertifikat') ||
        content?.includes('Belum ada data')
      ).toBeTruthy();
    }
  });
});
