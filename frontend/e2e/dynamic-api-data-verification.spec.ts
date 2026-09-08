import { test, expect, Page } from '@playwright/test';

async function loginUser(page: Page, email: string) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('aside[aria-label="Sidebar"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Dynamic API & Database Content Verification on Landing & Features', () => {

  test('1. Landing Page renders dynamic Events from Backend API (/events)', async ({ page }) => {
    // Intercept or monitor /api/v1/events
    const eventPromise = page.waitForResponse(resp => resp.url().includes('/api/v1/events') && resp.status() === 200);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await eventPromise;

    // Verify DB seeded events are rendered on the landing page
    const body = page.locator('body');
    await expect(body).toContainText(/Workshop Digital Marketing untuk UMKM|Seminar Startup Ecosystem/i, { timeout: 10000 });
  });

  test('2. Landing Page renders dynamic FAQ questions from Backend API (/faq)', async ({ page }) => {
    const faqPromise = page.waitForResponse(resp => resp.url().includes('/api/v1/faq') && resp.status() === 200);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await faqPromise;

    // Verify specific questions seeded in PostgreSQL
    const body = page.locator('body');
    await expect(body).toContainText(/Apa itu IBISTEK UTY\?/i, { timeout: 10000 });
    await expect(body).toContainText(/Siapa yang bisa mendaftar program inkubasi bisnis\?/i);
    await expect(body).toContainText(/Bagaimana cara mendaftar program konsultasi bisnis\?/i);
  });

  test('3. Landing Page renders dynamic Team Members from Backend API (/team)', async ({ page }) => {
    const teamPromise = page.waitForResponse(resp => resp.url().includes('/api/v1/team') && resp.status() === 200);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await teamPromise;

    // Verify seeded team member names from PostgreSQL
    const body = page.locator('body');
    await expect(body).toContainText(/Ms\. Hendriawan A, Ph\.D|Adi Wibawa/i, { timeout: 10000 });
  });

  test('4. Landing Page renders dynamic Programs from Backend API (/programs)', async ({ page }) => {
    const programsPromise = page.waitForResponse(resp => resp.url().includes('/api/v1/programs') && resp.status() === 200);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await programsPromise;

    // Verify seeded programs
    const body = page.locator('body');
    await expect(body).toContainText(/Inkubasi Bisnis/i);
    await expect(body).toContainText(/Konsultasi/i);
    await expect(body).toContainText(/Kredensial Mikro/i);
  });

  test('5. Public /events page renders dynamic events list from Backend API', async ({ page }) => {
    const eventPromise = page.waitForResponse(resp => resp.url().includes('/api/v1/events') && resp.status() === 200);

    await page.goto('/events');
    await page.waitForLoadState('domcontentloaded');
    await eventPromise;

    // Verify events from database are shown on the events list
    await expect(page.locator('body')).toContainText(/Workshop Digital Marketing/i, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Auditorium UTY|Creative Hub/i);
  });

  test('6. Mikro Kredensial renders dynamic courses from Backend API (/mikro-kredensial/kursus)', async ({ page }) => {
    await loginUser(page, 'mahasiswa@ibistek.com');

    const kursusPromise = page.waitForResponse(
      resp => resp.url().includes('/api/v1/mikro-kredensial') && resp.status() === 200
    );

    await page.goto('/dashboard/mikro-kredensial');
    await page.waitForLoadState('domcontentloaded');
    await kursusPromise;

    // Verify DB seeded courses appear
    const body = page.locator('body');
    await expect(body).toContainText(/Dasar Kewirausahaan Digital|Pemasaran Digital untuk UMKM/i, { timeout: 10000 });
  });

  test('7. Konsultasi Bisnis page dynamically renders user application data and mentor from Backend API', async ({ page }) => {
    await loginUser(page, 'mahasiswa@ibistek.com');

    const konsultasiPromise = page.waitForResponse(
      resp => resp.url().includes('/api/v1/konsultasi') && resp.status() === 200
    );

    await page.goto('/dashboard/konsultasi');
    await page.waitForLoadState('domcontentloaded');
    await konsultasiPromise;

    // Verify application table contains seeded application from database
    const body = page.locator('body');
    await expect(body).toContainText(/Strategi scaling bisnis|Dr\. Budi Santoso/i, { timeout: 10000 });
  });

});
