import { test, expect } from "@playwright/test";

test.describe("Comprehensive Search & Filter Interactions (Feature 1 & Feature 2)", () => {
  const adminEmail = "admin@ibistek.com";
  const adminPassword = "password123";
  const studentEmail = "student.konsultasi@ibistek.com";
  const studentPassword = "password123";
  const mentorEmail = "mentor@ibistek.com";
  const mentorPassword = "password123";

  test("1. Inkubasi Bisnis (Admin): Filter by Status, Periode & Rows Per Page", async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/inkubasi");
    await expect(page.locator("text=Manajemen Inkubasi Bisnis")).toBeVisible();
    await expect(page.locator("text=Pengajuan Inkubasi")).toBeVisible();

    // 1. Filter Status -> APPROVED
    const inkubasiSection = page.locator('section').filter({ hasText: "Pengajuan Inkubasi" });
    const periodTrigger = inkubasiSection.locator('button[role="combobox"]').first();
    const statusTrigger = inkubasiSection.locator('button[role="combobox"]').nth(1);

    await statusTrigger.click();
    await page.getByRole("option", { name: "APPROVED", exact: true }).click();

    // Verify all displayed rows or items have APPROVED badge (if any exist)
    const approvedBadges = page.locator('span:has-text("APPROVED")');
    const emptyState = page.locator("text=Tidak ada pengajuan pada filter ini.");
    await expect(approvedBadges.first().or(emptyState)).toBeVisible();

    // 2. Filter Status -> REJECTED (Invalid / No match test)
    await statusTrigger.click();
    await page.getByRole("option", { name: "REJECTED", exact: true }).click();
    // Verify either rejected badge or clean empty state in table
    const rejectedEmptyState = page.locator("td:has-text('Tidak ada pengajuan pada filter ini.')");
    const rejectedBadge = page.locator('td span:has-text("REJECTED")');
    await expect(rejectedEmptyState.or(rejectedBadge)).toBeVisible();

    // 3. Reset Filter Status -> Semua Status
    await statusTrigger.click();
    await page.getByRole("option", { name: "Semua Status", exact: true }).click();
    await expect(page.locator("text=Pengajuan Inkubasi")).toBeVisible();

    // 4. Filter Periode
    await periodTrigger.click();
    const periodOptions = page.locator('[role="option"]');
    const count = await periodOptions.count();
    if (count > 1) {
      // Click second period option
      await periodOptions.nth(1).click();
      await expect(page.locator("table").first()).toBeVisible();

      // Reset to Semua Periode
      await periodTrigger.click();
      await page.getByRole("option", { name: "Semua Periode", exact: true }).click();
    } else {
      await page.keyboard.press("Escape");
    }

    // 5. Change Limit (Rows Per Page)
    const rowsPerPageTrigger = page.locator("#rows-per-page");
    if (await rowsPerPageTrigger.isVisible()) {
      await rowsPerPageTrigger.click();
      await page.locator('[role="option"]:has-text("20")').click();
      await expect(page.locator("text=Page 1 of")).toBeVisible();
    }
  });

  test("2. Konsultasi Bisnis (Admin): Search Keyword, Clear Button (X), Filter Status & Filter Mentor", async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Konsultasi Bisnis")).toBeVisible();

    const searchInput = page.locator('input[placeholder="Cari pemilik atau topik..."]');
    await expect(searchInput).toBeVisible();

    // 1. Valid Search: search for existing keyword
    await searchInput.fill("Rian");
    await searchInput.press("Enter");
    // Verify result contains Rian
    await expect(page.locator('tr:has-text("Rian")').first()).toBeVisible();

    // 2. Clear Search using 'X' button
    const clearBtn = page.locator('button:has(svg.lucide-x)');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");

    // 3. Invalid Search: Keyword with no match
    const nonExistentKeyword = "ZzXy_TidakAdaData_998811";
    await searchInput.fill(nonExistentKeyword);
    await searchInput.press("Enter");

    // Must show empty state
    await expect(page.locator("text=Tidak ada data yang cocok dengan filter.")).toBeVisible();

    // Clear search again
    await clearBtn.click();
    await expect(page.locator("text=Tidak ada data yang cocok dengan filter.")).not.toBeVisible();

    // 4. Filter Status -> Confirmed
    await page.click('button:has-text("Filter status"), button:has-text("Semua Status")');
    await page.getByRole("option", { name: "Confirmed", exact: true }).click();
    // Expect rows or empty state
    await expect(page.locator('span:has-text("Jadwal Dikonfirmasi")').first()).toBeVisible();

    // 5. Filter Status -> Cancelled (Invalid match / empty test)
    await page.click('button:has-text("Confirmed")');
    await page.getByRole("option", { name: "Cancelled", exact: true }).click();
    await expect(
      page.locator('span:has-text("Dibatalkan")').first().or(page.locator("text=Tidak ada data yang cocok dengan filter."))
    ).toBeVisible();

    // Reset status filter
    await page.click('button:has-text("Cancelled"), button:has-text("Filter status")');
    await page.getByRole("option", { name: "Semua Status", exact: true }).click();

    // 6. Filter Mentor -> Select Dr. Budi Santoso
    await page.click('button:has-text("Filter mentor"), button:has-text("Semua Mentor")');
    await page.locator('[role="option"]:has-text("Dr. Budi Santoso")').click();
    // Verify table filters to mentor's assigned consultations
    await expect(page.locator('td:has-text("Dr. Budi Santoso")').first()).toBeVisible();

    // Reset mentor filter
    await page.click('button:has-text("Dr. Budi Santoso")');
    await page.getByRole("option", { name: "Semua Mentor", exact: true }).click();
  });

  test("3. Konsultasi Bisnis (Student): Search, Filter & Empty States", async ({ page }) => {
    // Login as Student
    await page.goto("/login");
    await page.fill('input[type="email"]', studentEmail);
    await page.fill('input[type="password"]', studentPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Pengajuan Konsultasi Saya")).toBeVisible();

    const searchInput = page.locator('input[placeholder="Cari topik atau nama pemilik..."]');
    await expect(searchInput).toBeVisible();

    // 1. Valid search for student's topic
    await searchInput.fill("Strategi");
    await searchInput.press("Enter");
    await expect(page.locator('tr:has-text("Strategi")').first()).toBeVisible();

    // 2. Invalid search: no match
    await searchInput.fill("Keyword_Palsu_Tak_Ditemukan_000");
    await searchInput.press("Enter");
    await expect(page.locator("text=Tidak ada pengajuan yang cocok.")).toBeVisible();

    // 3. Clear button resets search
    const clearBtn = page.locator('button:has(svg.lucide-x)');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");

    // 4. Filter Status
    await page.click('button:has-text("Filter status"), button:has-text("Semua Status")');
    await page.locator('[role="option"]:has-text("Dijadwalkan")').click();
    await expect(page.locator('span:has-text("Jadwal Dikonfirmasi")').first()).toBeVisible();

    // Reset status filter
    await page.click('button:has-text("Dijadwalkan")');
    await page.locator('[role="option"]:has-text("Semua Status")').click();
    await expect(page.locator('tr:has-text("Strategi")').first()).toBeVisible();
  });

  test("4. Konsultasi Bisnis (Mentor): Task Search & Status Filter Controls", async ({ page }) => {
    // Login as Mentor
    await page.goto("/login");
    await page.fill('input[type="email"]', mentorEmail);
    await page.fill('input[type="password"]', mentorPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Tugas Konsultasi Saya")).toBeVisible();

    const searchInput = page.locator('input[placeholder="Cari pemilik atau topik..."]');
    await expect(searchInput).toBeVisible();

    // 1. Search valid
    await searchInput.fill("Rian");
    await searchInput.press("Enter");
    await expect(page.locator('tr:has-text("Rian")').first()).toBeVisible();

    // 2. Search invalid
    await searchInput.fill("Data_Kosong_9999");
    await searchInput.press("Enter");
    await expect(page.locator("text=Tidak ada data yang cocok dengan filter.")).toBeVisible();

    // 3. Clear button resets
    const clearBtn = page.locator('button:has(svg.lucide-x)');
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");

    // 4. Status filter in mentor view
    await page.click('button:has-text("Filter status"), button:has-text("Semua Status")');
    await page.locator('[role="option"]:has-text("Dijadwalkan")').click();
    await expect(page.locator('span:has-text("Jadwal Dikonfirmasi")').first()).toBeVisible();

    // Reset status filter
    await page.click('button:has-text("Dijadwalkan")');
    await page.locator('[role="option"]:has-text("Semua Status")').click();
  });
});
