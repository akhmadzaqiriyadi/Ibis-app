import { test, expect } from "@playwright/test";

test.describe("Feature 2: Konsultasi Bisnis (Comprehensive & Negative Testing)", () => {
  // Execute serially to ensure clean state machine progression across roles
  test.describe.configure({ mode: "serial" });

  const adminEmail = "admin@ibistek.com";
  const adminPassword = "password123";
  const mentorEmail = "mentor@ibistek.com";
  const mentorPassword = "password123";
  const umkmEmail = "umkm@ibistek.com";
  const umkmPassword = "password123";
  const studentEmail = "student.konsultasi@ibistek.com";
  const studentPassword = "password123";

  const runId = Date.now();
  const ownerName = `Rian Founder ${runId}`;
  const meetingUrl = `https://meet.google.com/ibi-stek-${runId}`;

  test.beforeAll(async () => {
    // Ensure clean state for student.konsultasi@ibistek.com in database
    const { execSync } = await import("child_process");
    execSync(
      `bun -e "import { prisma } from './src/config/database'; import bcrypt from 'bcryptjs'; const password = await bcrypt.hash('password123', 10); const user = await prisma.user.upsert({ where: { email: 'student.konsultasi@ibistek.com' }, update: { isActive: true }, create: { name: 'Rian Mahasiswa Konsultasi', email: 'student.konsultasi@ibistek.com', password, role: 'MAHASISWA', isActive: true } }); await prisma.konsultasiApplication.deleteMany({ where: { userId: user.id } });"`,
      { cwd: "/Users/zaq/ibis-app/backend" }
    );
  });

  test("1. Role Boundary: Non-student/non-mentor role (UMKM) is restricted from Konsultasi workspace", async ({ page }) => {
    // Login as UMKM
    await page.goto("/login");
    await page.fill('input[type="email"]', umkmEmail);
    await page.fill('input[type="password"]', umkmPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to /dashboard/konsultasi
    await page.goto("/dashboard/konsultasi");

    // Expect restricted boundary message
    await expect(page.locator("text=Anda tidak memiliki akses ke halaman ini.")).toBeVisible();

    // Ensure student application form & mentor tables are NOT visible
    await expect(page.locator("text=+ Ajukan Konsultasi Baru")).not.toBeVisible();
    await expect(page.locator("text=Tugas Konsultasi Saya")).not.toBeVisible();
  });

  test("2. Business Rule Guard: Student with already active application cannot apply again", async ({ page }) => {
    // Login as mahasiswa@ibistek.com (who already has an ASSIGNED application in DB)
    await page.goto("/login");
    await page.fill('input[type="email"]', "mahasiswa@ibistek.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Pengajuan Konsultasi Saya")).toBeVisible();

    // Guard message must be displayed
    await expect(
      page.locator("text=Ada pengajuan yang sedang berjalan. Tunggu hingga selesai, dibatalkan, atau mentor menolak untuk mengajukan lagi.")
    ).toBeVisible();

    // Apply button must NOT be present
    await expect(page.locator("text=+ Ajukan Konsultasi Baru")).not.toBeVisible();
  });

  test("3. Student: Negative Form Validations (Empty fields, invalid year, character limits)", async ({ page }) => {
    // Login as clean student
    await page.goto("/login");
    await page.fill('input[type="email"]', studentEmail);
    await page.fill('input[type="password"]', studentPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Pengajuan Konsultasi Saya")).toBeVisible();

    // Click "+ Ajukan Konsultasi Baru"
    await page.click('button:has-text("+ Ajukan Konsultasi Baru")');
    await expect(page.locator("text=Ajukan Konsultasi Bisnis")).toBeVisible();

    const submitBtn = page.locator('button:has-text("Kirim Pengajuan")');

    // Negative 1: Empty Form -> Nama pemilik wajib diisi
    await submitBtn.click();
    await expect(page.locator("text=Nama pemilik wajib diisi")).toBeVisible();

    // Negative 2: Fill nama pemilik, but tahun berdiri empty
    await page.fill('input[placeholder="Nama pemilik usaha"]', ownerName);
    await submitBtn.click();
    await expect(page.locator("text=Tahun berdiri wajib diisi")).toBeVisible();

    // Negative 3: Invalid tahun berdiri (e.g. 1850 or future 2099)
    await page.fill('input[placeholder="2022"]', "1850");
    await submitBtn.click();
    await expect(page.locator("text=Tahun berdiri tidak valid")).toBeVisible();

    // Fill valid year
    await page.fill('input[placeholder="2022"]', "2024");

    // Negative 4: Kategori usaha belum dipilih
    await submitBtn.click();
    await expect(page.locator("text=Kategori usaha wajib dipilih")).toBeVisible();

    // Select Kategori
    await page.click('button:has-text("Pilih kategori")');
    await page.locator('[role="option"]').first().click();

    // Negative 5: Omset per bulan belum dipilih
    await submitBtn.click();
    await expect(page.locator("text=Rata-rata omset per bulan wajib diisi")).toBeVisible();

    // Select Omset
    await page.click('button:has-text("Pilih omset")');
    await page.locator('[role="option"]').first().click();

    // Negative 6: Platform penjualan belum dipilih
    await submitBtn.click();
    await expect(page.locator("text=Platform penjualan wajib dipilih")).toBeVisible();

    // Select Platform
    await page.click('button:has-text("Pilih platform")');
    await page.locator('[role="option"]:has-text("Keduanya")').click();

    // Negative 7: Uraian Produk < 20 karakter
    await page.fill('textarea[placeholder*="Ceritakan produk/jasa"]', "Produk roti");
    await submitBtn.click();
    await expect(page.locator("text=Uraian produk minimal 20 karakter")).toBeVisible();

    // Fill valid Uraian Produk
    await page.fill(
      'textarea[placeholder*="Ceritakan produk/jasa"]',
      "Kami memproduksi dan memasarkan produk minuman probiotik herbal lokal kemasan ramah lingkungan."
    );

    // Negative 8: Topik Konsultasi < 20 karakter
    await page.fill('textarea[placeholder*="Topik/masalah yang ingin dikonsultasikan"]', "Mau tanya tips");
    await submitBtn.click();
    await expect(page.locator("text=Topik konsultasi minimal 20 karakter")).toBeVisible();

    // Fill valid Topik Konsultasi
    await page.fill(
      'textarea[placeholder*="Topik/masalah yang ingin dikonsultasikan"]',
      "Strategi ekspansi penjualan B2B dan standarisasi proses sertifikasi halal serta BPOM."
    );

    // Negative 9: Tanggal preferensi belum diisi
    await submitBtn.click();
    await expect(page.locator("text=Tanggal preferensi wajib dipilih")).toBeVisible();

    // Fill valid preferred date
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', futureDate);

    // Negative 10: Metode konsultasi belum dipilih
    await submitBtn.click();
    await expect(page.locator("text=Metode konsultasi wajib dipilih")).toBeVisible();
  });

  test("4. Student: Successful Submission & Application Creation", async ({ page }) => {
    // Login as clean student
    await page.goto("/login");
    await page.fill('input[type="email"]', studentEmail);
    await page.fill('input[type="password"]', studentPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await page.click('button:has-text("+ Ajukan Konsultasi Baru")');

    // Fill the full valid form
    await page.fill('input[placeholder="Nama pemilik usaha"]', ownerName);
    await page.fill('input[placeholder="2022"]', "2024");

    await page.click('button:has-text("Pilih kategori")');
    await page.locator('[role="option"]').first().click();

    await page.click('button:has-text("Pilih omset")');
    await page.locator('[role="option"]').first().click();

    await page.click('button:has-text("Pilih platform")');
    await page.locator('[role="option"]:has-text("Keduanya")').click();

    await page.click('button:has-text("Pilih metode")');
    await page.locator('[role="option"]:has-text("Online")').click();

    await page.fill(
      'textarea[placeholder*="Ceritakan produk/jasa"]',
      "Kami memproduksi dan memasarkan produk minuman probiotik herbal lokal kemasan ramah lingkungan."
    );
    await page.fill(
      'textarea[placeholder*="Topik/masalah yang ingin dikonsultasikan"]',
      "Strategi ekspansi penjualan B2B dan standarisasi proses sertifikasi halal serta BPOM."
    );

    // Set future preferred date (e.g. 3 days from now at 14:00)
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', futureDate);

    // Submit
    await page.click('button:has-text("Kirim Pengajuan")');

    // Confirmation dialog
    await expect(page.locator("text=Konfirmasi Pengajuan")).toBeVisible();
    await page.click('button:has-text("Ya, Kirim")');

    // Verify toast
    await expect(page.locator("text=Pengajuan konsultasi berhasil dikirim")).toBeVisible();

    // Verify returning to list with status Menunggu Assignment / PENDING
    await expect(page.locator("text=Pengajuan Konsultasi Saya")).toBeVisible();
    await expect(page.locator("text=Strategi ekspansi penjualan B2B").first()).toBeVisible();
    await expect(page.locator("text=Menunggu Assignment").first()).toBeVisible();

    // Verify that active guard message now appears
    await expect(
      page.locator("text=Ada pengajuan yang sedang berjalan. Tunggu hingga selesai, dibatalkan, atau mentor menolak untuk mengajukan lagi.")
    ).toBeVisible();
  });

  test("5. Admin: Negative Validation & Assign Mentor Action", async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Konsultasi Bisnis")).toBeVisible();

    // Find the row for ownerName
    const row = page.locator("tr").filter({ hasText: ownerName });
    await expect(row).toBeVisible();

    // Click "Detail" button
    await row.locator('a:has-text("Detail")').click();
    await expect(page).toHaveURL(/\/dashboard\/konsultasi\/.+/);
    await expect(page.locator("text=Assign Mentor")).toBeVisible();

    const assignSection = page.locator("div").filter({ hasText: /^Assign Mentor/ }).first();

    // Negative Test A: Click Assign without deadline
    // Select mentor first
    await page.click('button:has-text("Pilih mentor")');
    await page.locator('[role="option"]:has-text("Dr. Budi Santoso")').click();

    // Try assign with empty deadline
    await page.click('button:has-text("Assign")');
    await expect(page.locator("text=Deadline respon mentor wajib valid")).toBeVisible();

    // Positive Action: Fill deadline (2 days from now)
    const deadlineDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', deadlineDate);

    await page.click('button:has-text("Assign")');
    await expect(page.locator("text=Mentor berhasil di-assign")).toBeVisible();

    // Verify status badge changed to Menunggu Respon Mentor
    await expect(page.locator("text=Menunggu Respon Mentor").first()).toBeVisible();
  });

  test("6. Mentor: Review Task & Accept Consultation Request (Bersedia)", async ({ page }) => {
    // Login as Mentor
    await page.goto("/login");
    await page.fill('input[type="email"]', mentorEmail);
    await page.fill('input[type="password"]', mentorPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");
    await expect(page.locator("text=Tugas Konsultasi Saya")).toBeVisible();

    // Find the assigned application
    const mentorRow = page.locator("tr").filter({ hasText: ownerName });
    await expect(mentorRow).toBeVisible();
    await expect(mentorRow.locator("text=Menunggu Respon Mentor")).toBeVisible();

    // Open detail
    await mentorRow.locator('a:has-text("Detail")').click();
    await expect(page).toHaveURL(/\/dashboard\/konsultasi\/.+/);

    // Verify Mentor Action Panel
    await expect(page.locator("text=Berikan Respon Anda")).toBeVisible();

    // Click "Bersedia"
    await page.click('button:has-text("Bersedia")');
    await expect(page.locator("text=Respon terkirim: bersedia")).toBeVisible();

    // Verify status updated to Mentor Bersedia
    await expect(page.locator("text=Mentor Bersedia").first()).toBeVisible();
  });

  test("7. Admin: Final Schedule Confirmation (ACC to CONFIRMED)", async ({ page }) => {
    // Login back as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");

    // Open detail
    const row = page.locator("tr").filter({ hasText: ownerName });
    await row.locator('a:has-text("Detail")').click();
    await expect(page).toHaveURL(/\/dashboard\/konsultasi\/.+/);

    // Find "Konfirmasi Jadwal" panel
    await expect(page.locator("text=Konfirmasi Jadwal")).toBeVisible();

    // Negative Test: Click Konfirmasi without confirmedDate
    const confirmedDateInput = page.locator('input[type="datetime-local"]').nth(1); // second datetime-local is for confirmation
    await confirmedDateInput.fill("");
    await page.click('button:has-text("Konfirmasi")');
    await expect(page.locator("text=Tanggal konfirmasi wajib valid")).toBeVisible();

    // Positive Action: Fill valid confirmed date and meeting link
    const confirmedTime = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    await confirmedDateInput.fill(confirmedTime);

    // Meeting link input
    await page.fill('input[placeholder="https://..."]', meetingUrl);

    await page.click('button:has-text("Konfirmasi")');
    await expect(page.locator("text=Jadwal konsultasi berhasil dikonfirmasi")).toBeVisible();

    // Verify status badge changed to Jadwal Dikonfirmasi
    await expect(page.locator("text=Jadwal Dikonfirmasi").first()).toBeVisible();
  });

  test("8. Student: Verify Confirmed Schedule, Meeting Link & Mentor Assigned", async ({ page }) => {
    // Login back as Student
    await page.goto("/login");
    await page.fill('input[type="email"]', studentEmail);
    await page.fill('input[type="password"]', studentPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/konsultasi");

    // Status on list should now be Jadwal Dikonfirmasi
    const appRow = page.locator("tr").filter({ hasText: "Strategi ekspansi penjualan B2B" });
    await expect(appRow).toBeVisible();
    await expect(appRow.locator("text=Jadwal Dikonfirmasi")).toBeVisible();

    // Open Detail
    await appRow.locator('a:has-text("Detail")').click();
    await expect(page).toHaveURL(/\/dashboard\/konsultasi\/.+/);

    // Verify Final Schedule Card
    await expect(page.locator("text=Jadwal Konsultasi Anda")).toBeVisible();
    await expect(page.locator(`a:has-text("${meetingUrl}")`)).toBeVisible();

    // Verify Mentor Info Card
    await expect(page.locator("text=Mentor Anda")).toBeVisible();
    await expect(page.locator("text=mentor@ibistek.com").first()).toBeVisible();

    // Verify Timeline Step "Jadwal Dikonfirmasi" is reached
    await expect(page.locator("text=Jadwal konsultasi sudah ditetapkan!").first()).toBeVisible();
  });
});
