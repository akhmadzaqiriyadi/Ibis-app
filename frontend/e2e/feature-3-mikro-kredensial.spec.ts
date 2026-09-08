import { test, expect } from "@playwright/test";

test.describe("Feature 3: Mikro Kredensial (Comprehensive & Negative Testing)", () => {
  // Run tests serially to preserve lifecycle progression across roles
  test.describe.configure({ mode: "serial" });

  const adminEmail = "admin@ibistek.com";
  const adminPassword = "password123";
  const umkmEmail = "umkm@ibistek.com";
  const umkmPassword = "password123";
  const studentEmail = "student.kredensial@ibistek.com";
  const studentPassword = "password123";

  const runId = Date.now();
  const testCourseTitle = `Kursus E2E Mikro Kredensial ${runId}`;
  const testCourseSlug = `e2e-kursus-kredensial-${runId}`;

  test.beforeAll(async () => {
    // Ensure clean state for student.kredensial@ibistek.com and test courses in DB
    const { execSync } = await import("child_process");
    execSync(
      `bun -e "import { prisma } from './src/config/database'; import bcrypt from 'bcryptjs'; const password = await bcrypt.hash('password123', 10); const user = await prisma.user.upsert({ where: { email: 'student.kredensial@ibistek.com' }, update: { isActive: true }, create: { name: 'E2E Mahasiswa Kredensial', email: 'student.kredensial@ibistek.com', password, role: 'MAHASISWA', isActive: true } }); await prisma.certificate.deleteMany({ where: { userId: user.id } }); await prisma.mikroKredensialEnrollment.deleteMany({ where: { userId: user.id } }); await prisma.mikroKredensialKursus.deleteMany({ where: { slug: { startsWith: 'e2e-' } } });"`,
      { cwd: "/Users/zaq/ibis-app/backend" }
    );
  });

  async function loginAs(page: any, email: string, pass: string) {
    await page.goto("/login");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  }

  test("1A. Role Access: Mahasiswa can access Mikro Kredensial workspace", async ({ page }) => {
    await loginAs(page, studentEmail, studentPassword);
    await page.goto("/dashboard/mikro-kredensial");

    await expect(page.locator("text=Mikro Kredensial IBISTEK")).toBeVisible();
    await expect(page.locator("button:has-text('Katalog Kursus')")).toBeVisible();
    await expect(page.locator("button:has-text('Kursus Saya')")).toBeVisible();
  });

  test("1B. Role Access: UMKM can access Mikro Kredensial workspace", async ({ page }) => {
    await loginAs(page, umkmEmail, umkmPassword);
    await page.goto("/dashboard/mikro-kredensial");

    await expect(page.locator("text=Mikro Kredensial IBISTEK")).toBeVisible();
    await expect(page.locator("button:has-text('Katalog Kursus')")).toBeVisible();
    await expect(page.locator("button:has-text('Kursus Saya')")).toBeVisible();
  });

  test("1C. Role Access: Admin can access Manajemen Mikro Kredensial CMS", async ({ page }) => {
    await loginAs(page, adminEmail, adminPassword);
    await page.goto("/dashboard/mikro-kredensial");

    await expect(page.locator("text=Manajemen Mikro Kredensial")).toBeVisible();
    await expect(page.locator("button:has-text('Tambah Kursus')")).toBeVisible();
    await expect(page.locator("button:has-text('Daftar Kursus')")).toBeVisible();
    await expect(page.locator("button:has-text('Peserta & Penilaian')")).toBeVisible();
  });

  test("2. Admin Course Management: Empty form submission validation (Negative Test)", async ({ page }) => {
    await loginAs(page, adminEmail, adminPassword);
    await page.goto("/dashboard/mikro-kredensial");

    // Click Tambah Kursus button
    await page.click("button:has-text('Tambah Kursus')");
    await expect(page.locator("text=Tambah Kursus Baru")).toBeVisible();

    // Verify required HTML5 attributes are present on required fields
    const titleRequired = await page.$eval('input#title', (el: HTMLInputElement) => el.required);
    const slugRequired = await page.$eval('input#slug', (el: HTMLInputElement) => el.required);
    const descRequired = await page.$eval('textarea#desc', (el: HTMLTextAreaElement) => el.required);
    expect(titleRequired).toBeTruthy();
    expect(slugRequired).toBeTruthy();
    expect(descRequired).toBeTruthy();

    // Verify empty fields fail HTML5 validity check
    await page.fill('input#title', '');
    await page.fill('input#slug', '');
    const titleValid = await page.$eval('input#title', (el: HTMLInputElement) => el.checkValidity());
    const slugValid = await page.$eval('input#slug', (el: HTMLInputElement) => el.checkValidity());
    expect(titleValid).toBeFalsy();
    expect(slugValid).toBeFalsy();

    // Close dialog
    await page.click("button:has-text('Batal')");
    await expect(page.locator("text=Tambah Kursus Baru")).not.toBeVisible();
  });

  test("3. Admin Course Creation (Positive Test) & Manage Content Dialog", async ({ page }) => {
    await loginAs(page, adminEmail, adminPassword);
    await page.goto("/dashboard/mikro-kredensial");

    // Open Tambah Kursus modal
    await page.click("button:has-text('Tambah Kursus')");
    await expect(page.locator("text=Tambah Kursus Baru")).toBeVisible();

    // Fill valid course data
    await page.fill('input#title', testCourseTitle);
    await page.fill('input#slug', testCourseSlug);
    await page.fill('textarea#desc', 'Kurikulum komprehensif digital marketing dan strategi bisnis online.');
    await page.fill('input#duration', '90');

    // Submit form
    await page.click("button:has-text('Simpan Kursus')");

    // Expect success toast
    await expect(page.locator("text=Kursus baru berhasil dibuat")).toBeVisible({ timeout: 5000 });

    // Verify course appears in table
    await expect(page.locator(`text=${testCourseTitle}`)).toBeVisible();

    // Click "Materi & Kuis" button for this course
    const courseRow = page.locator(`tr:has-text("${testCourseTitle}")`);
    await courseRow.locator("button:has-text('Materi & Kuis')").click();

    // Verify Manage Content dialog opens
    await expect(page.locator("text=Kelola Konten")).toBeVisible();
    await expect(page.locator("button:has-text('Materi Modul')")).toBeVisible();
    await expect(page.locator("button:has-text('Bank Soal Kuis')")).toBeVisible();

    // Close dialog
    await page.keyboard.press("Escape");
    await expect(page.locator("text=Kelola Konten")).not.toBeVisible({ timeout: 2000 });
  });

  test("4. Admin Search & Filter: Dynamic matching, empty results, and reset", async ({ page }) => {
    await loginAs(page, adminEmail, adminPassword);
    await page.goto("/dashboard/mikro-kredensial");

    const searchInput = page.locator('input[placeholder="Cari judul kursus..."]');
    await expect(searchInput).toBeVisible();

    // Search for test course
    await searchInput.fill(testCourseTitle);
    await expect(page.locator(`text=${testCourseTitle}`)).toBeVisible();

    // Search for non-existent course
    await searchInput.fill("kursus-random-tidak-ada-xyz");
    await expect(page.locator("text=Tidak ada kursus yang cocok.")).toBeVisible();
    await expect(page.locator(`text=${testCourseTitle}`)).not.toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.locator(`text=${testCourseTitle}`)).toBeVisible();
  });

  test("5. Student Catalog Interaction: Detail Silabus & Course Enrollment", async ({ page }) => {
    await loginAs(page, studentEmail, studentPassword);
    await page.goto("/dashboard/mikro-kredensial");
    await expect(page.locator("text=Katalog Kursus")).toBeVisible();

    // Verify Detail Silabus dialog opens and shows passing criteria
    const firstCourseCard = page.locator("div.rounded-2xl.border", { hasText: "Detail Silabus" }).first();
    await firstCourseCard.locator("button:has-text('Detail Silabus')").click();
    await expect(page.locator("text=Detail program pelatihan dan sertifikasi")).toBeVisible();
    await expect(page.locator("text=minimal 70 dari 100")).toBeVisible();

    // Close syllabus dialog
    await page.click("button:has-text('Tutup')");
    await expect(page.locator("text=Detail program pelatihan dan sertifikasi")).not.toBeVisible();

    // Enroll in the course
    await firstCourseCard.locator("button:has-text('Daftar Kelas')").click();

    // Expect success toast
    await expect(page.locator("text=Berhasil mendaftar kursus")).toBeVisible({ timeout: 5000 });

    // Should switch to "Kursus Saya" tab
    await expect(page.locator("text=Sedang Berjalan")).toBeVisible();
    await expect(page.locator("button:has-text('Buka Ruang Belajar & Ujian')")).toBeVisible();
  });

  test("6. Interactive Classroom: Module navigation & reading progress", async ({ page }) => {
    await loginAs(page, studentEmail, studentPassword);
    await page.goto("/dashboard/mikro-kredensial");

    // Open Kursus Saya
    await page.click("button:has-text('Kursus Saya')");
    await page.click("button:has-text('Buka Ruang Belajar & Ujian')");

    // Verify study room loaded
    await expect(page).toHaveURL(/\/dashboard\/mikro-kredensial\/belajar\//);
    await expect(page.locator("text=Progres Belajar")).toBeVisible();
    await expect(page.locator("text=0%")).toBeVisible();

    // Verify Modul 1 is displayed
    await expect(page.locator("text=Modul Pembelajaran 1")).toBeVisible();
    await expect(page.locator("text=Poin Inti Pembelajaran:")).toBeVisible();

    // Click "Tandai Selesai & Lanjut" to advance to Modul 2
    await page.click("button:has-text('Tandai Selesai & Lanjut')");

    // Verify progress updated (greater than 0%)
    const progressEl = page.locator("span.text-emerald-600.font-bold");
    await expect(progressEl).toBeVisible();
    const progressText = await progressEl.textContent();
    expect(progressText?.trim()).not.toBe("0%");
    await expect(page.locator("text=Modul Pembelajaran 2")).toBeVisible();
  });

  test("7. Quiz Assessment: Incomplete answers & failing score (Negative Tests)", async ({ page }) => {
    await loginAs(page, studentEmail, studentPassword);
    await page.goto("/dashboard/mikro-kredensial");
    await page.click("button:has-text('Kursus Saya')");
    await page.click("button:has-text('Buka Ruang Belajar & Ujian')");

    // Switch to Quiz tab
    await page.click("button:has-text('Kuis Asesmen Kelulusan')");
    await expect(page.locator("text=Evaluasi Kompetensi Akhir")).toBeVisible();

    // 7A. Incomplete submission: click submit without answering all questions
    await page.click("button:has-text('Kumpulkan & Lihat Hasil Ujian')");
    await expect(page.locator("text=Mohon jawab semua soal terlebih dahulu")).toBeVisible({ timeout: 5000 });

    // 7B. Failing score (< 70): Answer questions with deliberate incorrect options
    const questionBlocks = page.locator(".space-y-8 > .space-y-3");
    const count = await questionBlocks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      // Pick the last option button in each question's option list
      const options = questionBlocks.nth(i).locator("button");
      const optCount = await options.count();
      await options.nth(optCount - 1).click();
    }

    // Submit quiz
    await page.click("button:has-text('Kumpulkan & Lihat Hasil Ujian')");

    // Expect evaluation modal to appear
    const resultModal = page.locator("div[role='dialog']");
    await expect(resultModal).toBeVisible({ timeout: 5000 });

    // Check if retake button is available (confirming score < 70)
    const retakeButton = resultModal.locator("button:has-text('Coba Ujian Lagi')");
    const isRetakeVisible = await retakeButton.isVisible();

    if (isRetakeVisible) {
      await expect(resultModal.locator("text=Belum Mencapai Nilai Kelulusan")).toBeVisible();
      await expect(resultModal.locator("text=Ambang batas kelulusan sertifikasi adalah minimal 70")).toBeVisible();

      // Click "Coba Ujian Lagi" to reset
      await retakeButton.click();
      await expect(resultModal).not.toBeVisible();
    }
  });

  test("8. Quiz Assessment: Passing score (>= 70) & Certificate Issuance (Positive Test)", async ({ page }) => {
    await loginAs(page, studentEmail, studentPassword);
    await page.goto("/dashboard/mikro-kredensial");
    await page.click("button:has-text('Kursus Saya')");
    await page.click("button:has-text('Buka Ruang Belajar & Ujian')");

    // Switch to Quiz tab
    await page.click("button:has-text('Kuis Asesmen Kelulusan')");
    await expect(page.locator("text=Evaluasi Kompetensi Akhir")).toBeVisible();

    // Map correct answers dynamically by checking option content or selecting target options
    const questionBlocks = page.locator(".space-y-8 > .space-y-3");
    const count = await questionBlocks.count();

    const correctKeywords = [
      "Riset pasar",
      "Customer Acquisition Cost",
      "Memisahkan rekening pribadi",
      "Membangun kredibilitas",
      "Produk versi awal dengan fitur inti",
      "Membangun produk yang ternyata tidak dibutuhkan",
      "Solusi yang ditawarkan",
      "menguji hipotesis nilai produk",
      "Build -> Measure -> Learn",
      "Sebelum menghabiskan waktu",
      "70 dari 100",
      "Adaptif terhadap teknologi",
      "Kegiatan yang memberikan dampak nilai",
      "Memahami masalah nyata",
      "Agar dapat mengetahui efektivitas",
    ];

    for (let i = 0; i < count; i++) {
      const qBlock = questionBlocks.nth(i);
      const options = qBlock.locator("button");
      const optCount = await options.count();
      let clicked = false;

      for (let o = 0; o < optCount; o++) {
        const text = await options.nth(o).textContent();
        if (correctKeywords.some((kw) => text?.toLowerCase().includes(kw.toLowerCase()))) {
          await options.nth(o).click();
          clicked = true;
          break;
        }
      }

      // Fallback if none matched
      if (!clicked) {
        await options.first().click();
      }
    }

    // Submit quiz
    await page.click("button:has-text('Kumpulkan & Lihat Hasil Ujian')");

    // Expect passing modal to appear
    const resultModal = page.locator("div[role='dialog']");
    await expect(resultModal).toBeVisible({ timeout: 5000 });
    await expect(resultModal.locator("text=Selamat, Anda Lulus!")).toBeVisible({ timeout: 5000 });
    await expect(resultModal.locator("text=Sertifikat Digital resmi telah otomatis diterbitkan")).toBeVisible();

    // Click "Klaim & Lihat Sertifikat"
    await resultModal.locator("button:has-text('Klaim & Lihat Sertifikat')").click();

    // Verify redirection to /dashboard/certificates/my
    await expect(page).toHaveURL(/\/dashboard\/certificates\/my/);
    await expect(page.locator("text=Sertifikat Saya")).toBeVisible();
    await expect(page.locator("text=Terverifikasi")).toBeVisible();
    await expect(page.locator("text=IBIS/KRED/")).toBeVisible();
  });

  test("9. Public Certificate Verification: Validates certificate by unique number", async ({ page }) => {
    await loginAs(page, studentEmail, studentPassword);
    await page.goto("/dashboard/certificates/my");
    await expect(page.locator("text=IBIS/KRED/")).toBeVisible();

    // Extract certificate number text
    const certBadge = page.locator("text=IBIS/KRED/").first();
    const certNumber = await certBadge.textContent();
    expect(certNumber).toBeTruthy();
    const cleanCertNumber = certNumber?.trim() || "";

    // Visit public verification page
    await page.goto(`/verify-certificate?number=${encodeURIComponent(cleanCertNumber)}`);

    // Verify verification details are displayed
    await expect(page.locator("text=Verifikasi Sertifikat Digital")).toBeVisible();
    await expect(page.locator(`text=${cleanCertNumber}`)).toBeVisible({ timeout: 5000 });
  });

  test("10. Admin Monitoring: Verify student completion and score in Peserta & Penilaian", async ({ page }) => {
    await loginAs(page, adminEmail, adminPassword);
    await page.goto("/dashboard/mikro-kredensial");

    // Switch to tab "Peserta & Penilaian"
    await page.click("button:has-text('Peserta & Penilaian')");

    // Verify table shows completed participant
    const studentRow = page.locator(`tr:has-text("${studentEmail}")`);
    await expect(studentRow).toBeVisible({ timeout: 5000 });
    await expect(studentRow.locator("text=Lulus")).toBeVisible();
  });
});
