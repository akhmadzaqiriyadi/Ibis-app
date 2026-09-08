import { test, expect } from "@playwright/test";

test.describe("Feature 1: Inkubasi Bisnis (Comprehensive & Negative Testing)", () => {
  // Run sequentially in order because student flow depends on admin creating active period
  test.describe.configure({ mode: "serial" });

  const adminEmail = "admin@ibistek.com";
  const adminPassword = "password123";
  const mahasiswaEmail = "mahasiswa@ibistek.com";
  const mahasiswaPassword = "password123";
  const umkmEmail = "umkm@ibistek.com";
  const umkmPassword = "password123";

  const runId = Date.now();
  const testPeriodName = `Periode Inkubasi Batch ${runId}`;

  test("1. Role Boundary: Non-student role (UMKM) is restricted from Inkubasi student application", async ({ page }) => {
    // Login as UMKM
    await page.goto("/login");
    await page.fill('input[type="email"]', umkmEmail);
    await page.fill('input[type="password"]', umkmPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to /dashboard/inkubasi
    await page.goto("/dashboard/inkubasi");

    // Must show restriction message because user is UMKM (neither MAHASISWA nor ADMIN/STAFF)
    const restrictedHeader = page.locator("text=Halaman Admin Inkubasi");
    const restrictedDesc = page.locator("text=Halaman ini khusus role ADMIN/STAFF");
    await expect(restrictedHeader).toBeVisible();
    await expect(restrictedDesc).toBeVisible();

    // Ensure student application form is NOT present
    await expect(page.getByRole("heading", { name: "Form Pengajuan" })).not.toBeVisible();
    await expect(page.locator("text=Inkubasi Bisnis Mahasiswa")).not.toBeVisible();
  });

  test("2. Admin: Validate Invalid Period Creation (Negative Test) & Create Valid Active Period", async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Open Inkubasi Admin
    await page.goto("/dashboard/inkubasi");
    await expect(page.locator("text=Manajemen Inkubasi Bisnis")).toBeVisible();

    // Click "Buat Periode"
    await page.click('button:has-text("Buat Periode")');
    await expect(page.locator("text=Buat Periode Inkubasi")).toBeVisible();

    // Negative Test A: Submit with empty form
    await page.click('button:has-text("Simpan")');
    await expect(page.locator("text=Nama periode wajib diisi")).toBeVisible();

    // Negative Test B: Start date after End date
    await page.fill('input[placeholder="Contoh: Periode 1 Tahun 2026"]', "Periode Tanggal Invalid");

    // Set startDate in future and endDate in past
    const inputs = page.locator('input[type="datetime-local"]');
    await inputs.nth(0).fill("2026-12-31T10:00");
    await inputs.nth(1).fill("2026-01-01T10:00");

    await page.click('button:has-text("Simpan")');
    // Expect toast error from backend: "Tanggal mulai harus sebelum tanggal selesai"
    await expect(page.locator("text=Tanggal mulai harus sebelum tanggal selesai")).toBeVisible();

    // Positive Action: Create valid active period
    // From yesterday to 30 days ahead so it is immediately ACTIVE
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

    await page.fill('input[placeholder="Contoh: Periode 1 Tahun 2026"]', testPeriodName);
    await inputs.nth(0).fill(yesterday);
    await inputs.nth(1).fill(futureDate);
    await page.fill('textarea[placeholder="Opsional"]', "Periode inkubasi aktif otomatis untuk E2E automated test.");

    await page.click('button:has-text("Simpan")');
    await expect(page.locator("text=Periode inkubasi berhasil dibuat")).toBeVisible();

    // Verify it appears in active period summary or list
    await expect(page.locator(`text=${testPeriodName}`).first()).toBeVisible();
  });

  test("3. Student: Negative Form Validations (Empty & Min-Length requirements)", async ({ page }) => {
    // Login as Mahasiswa
    await page.goto("/login");
    await page.fill('input[type="email"]', mahasiswaEmail);
    await page.fill('input[type="password"]', mahasiswaPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to /dashboard/inkubasi
    await page.goto("/dashboard/inkubasi");
    await expect(page.locator("text=Inkubasi Bisnis Mahasiswa")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Form Pengajuan" })).toBeVisible();

    // The active period created by Admin should be selected/displayed
    await expect(page.locator(`input[value*="${testPeriodName}"]`)).toBeVisible();

    const submitBtn = page.locator('button:has-text("Kirim Pengajuan")');

    // Negative 1: Empty Form -> Nama pemilik wajib diisi
    await submitBtn.click();
    await expect(page.locator("text=Nama pemilik usaha wajib diisi")).toBeVisible();

    // Negative 2: Fill nama pemilik, but tahun berdiri empty
    await page.fill('input[placeholder="Contoh: Ahmad Fauzi"]', "Budi Santoso");
    await submitBtn.click();
    await expect(page.locator("text=Tahun berdiri wajib diisi")).toBeVisible();

    // Negative 3: Fill tahun berdiri, but kategori empty
    await page.fill('input[placeholder="Contoh: 2023"]', "2024");
    await submitBtn.click();
    await expect(page.locator("text=Kategori usaha wajib dipilih")).toBeVisible();

    // Select Kategori
    await page.click('button:has-text("Pilih kategori usaha")');
    const firstCategory = page.locator('[role="option"]').first();
    await firstCategory.click();

    // Negative 4: Omset per bulan empty
    await submitBtn.click();
    await expect(page.locator("text=Omset per bulan wajib diisi")).toBeVisible();

    // Select Omset
    await page.click('button:has-text("Pilih kisaran omset")');
    await page.locator('[role="option"]').first().click();

    // Negative 5: Platform penjualan empty
    await submitBtn.click();
    await expect(page.locator("text=Platform penjualan wajib dipilih")).toBeVisible();

    // Select Platform
    await page.click('button:has-text("Pilih platform")');
    await page.locator('[role="option"]:has-text("Keduanya")').click();

    // Negative 6: Uraian Produk < 20 chars
    await page.fill('textarea[placeholder*="kami menjual minuman sehat"]', "Kopi enak");
    await submitBtn.click();
    await expect(page.locator("text=Uraian produk minimal 20 karakter")).toBeVisible();

    // Fill valid Uraian Produk
    await page.fill(
      'textarea[placeholder*="kami menjual minuman sehat"]',
      "Kami menjual produk keripik tempe aneka rasa dengan kemasan higienis modern."
    );

    // Negative 7: Kendala < 20 chars
    await page.fill('textarea[placeholder*="kami kesulitan menjaga konsistensi"]', "Kurang modal");
    await submitBtn.click();
    await expect(page.locator("text=Kendala minimal 20 karakter")).toBeVisible();

    // Fill valid Kendala
    await page.fill(
      'textarea[placeholder*="kami kesulitan menjaga konsistensi"]',
      "Kendala kami saat ini adalah kapasitas produksi mesin oven dan distribusi luar kota."
    );

    // Negative 8: Harapan < 20 chars
    await page.fill('textarea[placeholder*="ingin memperbaiki SOP"]', "Mau sukses");
    await submitBtn.click();
    await expect(page.locator("text=Harapan minimal 20 karakter")).toBeVisible();
  });

  test("4. Student: Successful Submission & Duplicate Prevention (Negative Test)", async ({ page }) => {
    // Login as Mahasiswa
    await page.goto("/login");
    await page.fill('input[type="email"]', mahasiswaEmail);
    await page.fill('input[type="password"]', mahasiswaPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/inkubasi");

    // Fill the full valid form
    await page.fill('input[placeholder="Contoh: Ahmad Fauzi"]', `Mahasiswa Founder ${runId}`);
    await page.fill('input[placeholder="Contoh: 2023"]', "2024");

    // Select Kategori
    await page.click('button:has-text("Pilih kategori usaha")');
    await page.locator('[role="option"]').first().click();

    // Select Omset
    await page.click('button:has-text("Pilih kisaran omset")');
    await page.locator('[role="option"]').first().click();

    // Select Platform
    await page.click('button:has-text("Pilih platform")');
    await page.locator('[role="option"]:has-text("Keduanya")').click();

    // Fill textareas (>= 20 chars)
    await page.fill(
      'textarea[placeholder*="kami menjual minuman sehat"]',
      "Kami memproduksi makanan sehat camilan organik berbahan dasar singkong dan ubi jalar lokal."
    );
    await page.fill(
      'textarea[placeholder*="kami kesulitan menjaga konsistensi"]',
      "Kendala utama kami adalah sertifikasi BPOM dan akses pasar modern supermarket."
    );
    await page.fill(
      'textarea[placeholder*="ingin memperbaiki SOP"]',
      "Harapan kami adalah memperoleh bimbingan legalitas usaha dan pendanaan modal kerja."
    );

    // Click Kirim Pengajuan
    await page.click('button:has-text("Kirim Pengajuan")');

    // Confirm dialog should open
    await expect(page.locator("text=Konfirmasi Kirim Pengajuan")).toBeVisible();
    await page.click('button:has-text("Ya, Kirim Pengajuan")');

    // Success toast
    await expect(page.locator("text=Pengajuan inkubasi berhasil dikirim")).toBeVisible();

    // Application status card should now show PENDING
    await expect(page.locator("text=Sedang direview admin").first()).toBeVisible();
    await expect(page.locator("text=Hasil keputusan: Belum ada hasil").first()).toBeVisible();

    // Duplicate Check: Try submitting again in the same period
    await page.fill('input[placeholder="Contoh: Ahmad Fauzi"]', `Mahasiswa Founder ${runId} Kedua`);
    await page.fill('input[placeholder="Contoh: 2023"]', "2024");
    await page.click('button:has-text("Pilih kategori usaha")');
    await page.locator('[role="option"]').first().click();
    await page.click('button:has-text("Pilih kisaran omset")');
    await page.locator('[role="option"]').first().click();
    await page.click('button:has-text("Pilih platform")');
    await page.locator('[role="option"]:has-text("Online")').click();
    await page.fill(
      'textarea[placeholder*="kami menjual minuman sehat"]',
      "Percobaan submit proposal kedua pada periode inkubasi yang sama."
    );
    await page.fill(
      'textarea[placeholder*="kami kesulitan menjaga konsistensi"]',
      "Kendala submit ganda yang harus ditolak secara tegas oleh backend."
    );
    await page.fill(
      'textarea[placeholder*="ingin memperbaiki SOP"]',
      "Harapan agar sistem keamanan duplicate entry berjalan dengan sempurna."
    );

    await page.click('button:has-text("Kirim Pengajuan")');
    await expect(page.locator("text=Konfirmasi Kirim Pengajuan")).toBeVisible();
    await page.click('button:has-text("Ya, Kirim Pengajuan")');

    // Should receive duplicate error from backend
    await expect(page.locator("text=Anda sudah pernah mengajukan pada periode ini")).toBeVisible();
  });

  test("5. Admin: Review and Approve Application (ACC Action)", async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/inkubasi");
    await expect(page.locator("text=Pengajuan Inkubasi")).toBeVisible();

    // Find the row with our submitted application
    const appRow = page.locator("tr").filter({ hasText: `Mahasiswa Founder ${runId}` });
    await expect(appRow).toBeVisible();

    // Verify initial status is PENDING
    await expect(appRow.locator("text=PENDING")).toBeVisible();

    // Click Approve button (Check icon) in that row
    const approveBtn = appRow.locator('button[title="Approve"]');
    await approveBtn.click();

    // Review dialog should appear
    await expect(page.locator("text=Setujui Pengajuan")).toBeVisible();
    await expect(page.locator("text=Konfirmasi persetujuan pengajuan inkubasi")).toBeVisible();

    // Fill review note
    const reviewNoteText = `Disetujui oleh Admin pada Batch ${runId}. Ide bisnis sangat prospektif dan lolos kurasi inkubator IBISTEK.`;
    await page.fill(
      'textarea[placeholder*="Catatan internal/admin"]',
      reviewNoteText
    );

    // Submit review
    await page.click('button:has-text("Ya, Setujui")');

    // Verify toast
    await expect(page.locator("text=Pengajuan disetujui")).toBeVisible();

    // Verify row status updated to APPROVED
    await expect(appRow.locator("text=APPROVED")).toBeVisible();
    await expect(appRow.locator("text=DITERIMA")).toBeVisible();
    await expect(appRow.locator(`text=${reviewNoteText}`)).toBeVisible();
  });

  test("6. Student: Verify Approved Status and Review Feedback", async ({ page }) => {
    // Login back as Mahasiswa
    await page.goto("/login");
    await page.fill('input[type="email"]', mahasiswaEmail);
    await page.fill('input[type="password"]', mahasiswaPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/inkubasi");

    // Verify status update in student view
    await expect(page.locator("text=Pengajuan kamu disetujui").first()).toBeVisible();
    await expect(page.locator("text=Hasil keputusan: DITERIMA").first()).toBeVisible();
    await expect(page.locator("text=Hasil: diterima").first()).toBeVisible();

    // Verify timeline step 3 (Hasil Keputusan) is active/reached
    const timelineCompleted = page.locator("text=Pengajuan sudah difinalisasi admin dengan hasil DITERIMA");
    await expect(timelineCompleted).toBeVisible();

    // Verify admin review note is displayed to student
    await expect(page.locator(`text=Disetujui oleh Admin pada Batch ${runId}`).first()).toBeVisible();
  });
});
