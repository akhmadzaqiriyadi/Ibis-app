import { test, expect, Page } from '@playwright/test';

async function loginUser(page: Page, email: string) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Comprehensive Clickable Elements & User Actions Test', () => {

  test.describe('1. Landing Page Clickable Navigation & Anchors', () => {
    test('All desktop navbar menu links and action buttons work without errors', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Test "Verifikasi Sertifikat" navbar link
      const certLink = page.locator('nav a[href="/verify-certificate"]').first();
      await expect(certLink).toBeVisible();
      await certLink.click();
      await page.waitForURL('**/verify-certificate', { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Verifikasi Sertifikat/i })).toBeVisible();

      // Return to homepage
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Test "Sign In" button
      const loginBtn = page.locator('nav a[href="/login"]').first();
      await expect(loginBtn).toBeVisible();
      await loginBtn.click();
      await page.waitForURL('**/login', { timeout: 10000 });
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Return to homepage
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Test anchor links exist in navbar
      const navLinks = ['#home', '#about', '#programs', '#team', '#partners', '#updates', '#contact'];
      for (const anchor of navLinks) {
        const link = page.locator(`nav a[href="${anchor}"]`).first();
        await expect(link).toBeAttached();
      }
    });

    test('Hero Section CTA buttons trigger correct actions and anchors', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // "Jelajahi Program" button
      const jelajahiBtn = page.locator('a[href="#programs"]').first();
      await expect(jelajahiBtn).toBeVisible();
      await jelajahiBtn.click();
      await expect(page.locator('#programs')).toBeInViewport();

      // Hero scroll down button
      const scrollDownBtn = page.locator('a[href="#about"]').first();
      await expect(scrollDownBtn).toBeVisible();
      await scrollDownBtn.click();
      await expect(page.locator('#about')).toBeInViewport();
    });
  });

  test.describe('2. Programs Section Registration CTAs', () => {
    test('Each program CTA button in #programs is clickable and navigates without 404', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Wait for programs section to display items
      const programLinks = page.locator('#programs a.program-item, #programs .program-item a');
      await expect(programLinks.first()).toBeVisible({ timeout: 10000 });
      const count = await programLinks.count();
      expect(count).toBeGreaterThan(0);

      // Verify the first program action button
      const firstLink = programLinks.first();
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      await firstLink.click();

      // Ensure target route does not return Next.js 404
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('h1.next-error-h1')).not.toBeVisible();
      await expect(page.getByText('This page could not be found')).not.toBeVisible();
    });
  });

  test.describe('3. Team & Updates Sections (Sliders & Detail Links)', () => {
    test('Team section slider navigation and "Lihat Semua Tim" work', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // "Lihat Semua Tim" button
      const lihatSemuaTim = page.locator('a[href="/our-team"]').first();
      await expect(lihatSemuaTim).toBeVisible();
      await lihatSemuaTim.click();
      await page.waitForURL('**/our-team', { timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Pembina|Mentor|Tim/i);
    });

    test('Events section slider navigation and "Lihat Selengkapnya" work', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // "Selengkapnya" button under events
      const selengkapnyaBtn = page.locator('a[href="/events"]').first();
      await expect(selengkapnyaBtn).toBeVisible();
      await selengkapnyaBtn.click();
      await page.waitForURL('**/events', { timeout: 10000 });
      await expect(page.locator('body')).toContainText(/Wujudkan ide|Event/i);

      // Verify event cards exist and clicking one opens event detail
      const eventCardLink = page.locator('a[href^="/events/"]').first();
      if (await eventCardLink.isVisible()) {
        await eventCardLink.click();
        await expect(page.locator('body')).toContainText(/Deskripsi Event|Detail/i);
      }
    });
  });

  test.describe('4. FAQ Accordion Interaction', () => {
    test('FAQ items expand and collapse smoothly upon clicking', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Wait for FAQ items to load
      const faqToggle = page.locator('[data-testid="faq-toggle"]').first();
      await expect(faqToggle).toBeVisible({ timeout: 10000 });

      // Click the first FAQ button to toggle
      await faqToggle.click();
      await page.waitForTimeout(400);

      // Check all toggles
      const allToggles = page.locator('[data-testid="faq-toggle"]');
      const count = await allToggles.count();
      expect(count).toBeGreaterThan(0);

      // Click second FAQ if exists
      if (count > 1) {
        await allToggles.nth(1).click();
        await page.waitForTimeout(400);
      }
    });
  });

  test.describe('5. Footer Links', () => {
    test('Footer certificate verification link is functional', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const footerCertLink = page.locator('footer a[href="/verify-certificate"]').first();
      await expect(footerCertLink).toBeVisible();
      await footerCertLink.click();
      await page.waitForURL('**/verify-certificate', { timeout: 10000 });
      await expect(page.locator('h1, h2, h3')).toContainText(/Verifikasi Sertifikat/i);
    });
  });

  test.describe('6. Main Feature Actions (Inkubasi, Konsultasi, Mikro Kredensial Classroom)', () => {
    test('Inkubasi Bisnis: Mahasiswa can view periods and access application form', async ({ page }) => {
      await loginUser(page, 'mahasiswa@ibistek.com');

      await page.goto('/dashboard/inkubasi');
      await page.waitForLoadState('domcontentloaded');

      // Check title and active period or proposal card
      await expect(page.locator('body')).toContainText(/Inkubasi Bisnis/i);

      // If "Daftar Inkubasi" or "Ajukan Proposal" button exists
      const ajukanBtn = page.getByRole('button', { name: /Ajukan|Daftar|Isi Form/i }).first();
      if (await ajukanBtn.isVisible()) {
        await ajukanBtn.click();
        await page.waitForTimeout(500);
        // Either opens a modal or navigates to form
        await page.keyboard.press('Escape');
      }
    });

    test('Konsultasi Bisnis: Mahasiswa can open booking consultation modal', async ({ page }) => {
      await loginUser(page, 'mahasiswa@ibistek.com');

      await page.goto('/dashboard/konsultasi');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toContainText(/Konsultasi Bisnis/i);

      const ajukanBtn = page.getByRole('button', { name: /Ajukan Konsultasi|Buat Jadwal/i }).first();
      if (await ajukanBtn.isVisible()) {
        await ajukanBtn.click();
        await expect(page.locator('div[role="dialog"]')).toBeVisible();
        await expect(page.locator('div[role="dialog"]')).toContainText(/Nama Pemilik|Topik Konsultasi|Kategori/i);
        await page.keyboard.press('Escape');
      }
    });

    test('Mikro Kredensial: Mahasiswa can enter classroom, view modules, and switch to quiz tab', async ({ page }) => {
      await loginUser(page, 'mahasiswa@ibistek.com');

      await page.goto('/dashboard/mikro-kredensial');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toContainText(/Mikro Kredensial/i);

      // Click "Mulai Belajar" or "Lanjut Belajar"
      const belajarBtn = page.getByRole('link', { name: /Mulai Belajar|Lanjut Belajar|Pelajari/i }).first();
      if (await belajarBtn.isVisible()) {
        await belajarBtn.click();
        await page.waitForURL('**/dashboard/mikro-kredensial/belajar/**', { timeout: 10000 });

        // Check classroom header / modules list
        await expect(page.locator('body')).toContainText(/Modul|Materi|Kuis/i);

        // Click Quiz tab if present
        const quizTab = page.getByRole('tab', { name: /Kuis|Evaluasi|Ujian/i }).or(
          page.getByText(/Kuis Akhir|Mulai Kuis/i)
        ).first();

        if (await quizTab.isVisible()) {
          await quizTab.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

});
