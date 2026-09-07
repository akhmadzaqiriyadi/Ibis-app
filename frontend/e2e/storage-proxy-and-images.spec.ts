import { test, expect } from '@playwright/test';

test.describe('MinIO Storage Proxy & Safe Image Fallback System', () => {
  test('Proxy endpoint returns 200 OK and valid image stream for MinIO keys', async ({ request }) => {
    const res = await request.get('/api/storage-proxy?key=team/1cdf6c5c-1932-4644-9870-0f5d7cc539b7.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/');
    expect(res.headers()['cache-control']).toContain('public');
  });

  test('Proxy endpoint handles full MinIO URLs without SSL errors', async ({ request }) => {
    const minioUrl = 'https://s3.dev-apps.utycreative.cloud/ibisapp/team/1cdf6c5c-1932-4644-9870-0f5d7cc539b7.png';
    const res = await request.get(`/api/storage-proxy?url=${encodeURIComponent(minioUrl)}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/');
  });

  test('Proxy endpoint returns 404 cleanly for non-existent keys without crashing', async ({ request }) => {
    const res = await request.get('/api/storage-proxy?key=non-existent-test-file.png');
    expect(res.status()).toBe(404);
  });

  test('/our-team page renders clean avatars/photos and eliminates placehold.co', async ({ page }) => {
    await page.goto('/our-team', { waitUntil: 'networkidle' });

    // Ensure Mentor Kami heading is visible
    const mentorHeading = page.locator('h2', { hasText: 'Mentor Kami' });
    await expect(mentorHeading).toBeVisible();

    // Verify there are NO placehold.co images rendered anywhere on the page
    const placeholdImages = page.locator('img[src*="placehold.co"]');
    await expect(placeholdImages).toHaveCount(0);

    // Verify mentor cards exist and have valid images or SVG avatars
    const mentorSection = page.locator('section', { hasText: 'Mentor Kami' });
    const mentorImages = mentorSection.locator('img');
    const mentorCount = await mentorImages.count();
    expect(mentorCount).toBeGreaterThan(0);

    for (let i = 0; i < mentorCount; i++) {
      const src = await mentorImages.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).not.toContain('placehold.co');
    }

    // Verify Anggota Tim Kami section & batch buttons
    const teamSection = page.locator('section', { hasText: 'Anggota Tim Kami' });
    await expect(teamSection).toBeVisible();

    // Click Batch 2
    const batch2Btn = teamSection.locator('button', { hasText: 'Batch 2' });
    if (await batch2Btn.isVisible()) {
      await batch2Btn.click();
      await page.waitForTimeout(300);
      const batch2Images = teamSection.locator('img');
      expect(await batch2Images.count()).toBeGreaterThan(0);
    }

    // Click Batch 1
    const batch1Btn = teamSection.locator('button', { hasText: 'Batch 1' });
    if (await batch1Btn.isVisible()) {
      await batch1Btn.click();
      await page.waitForTimeout(300);
      const batch1Images = teamSection.locator('img');
      expect(await batch1Images.count()).toBeGreaterThan(0);
    }
  });

  test('Team Section on homepage renders images safely without placehold.co', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify no placehold.co images exist on homepage
    const placeholdImages = page.locator('img[src*="placehold.co"]');
    await expect(placeholdImages).toHaveCount(0);
  });
});
