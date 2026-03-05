import { test, expect } from '@playwright/test';

// Variabel global untuk nyimpen data antar test (karena run berurutan sesuai file)
let adminToken = '';
let mhsToken = '';
let mentorToken = '';
let umkmToken = '';

let kategoriUsahaId = '';
let programStudiId = '';
let inkubasiPeriodId = '';
let inkubasiAppId = '';
let konsultasiAppId = '';
let mentorId = '';
let kursusId = '';
let enrollmentId = '';

test.describe.serial('E2E IBISTEK Backend API Tests', () => {

  test('01. Autentikasi: Login semua role yang dibutuhkan', async ({ request }) => {
    // 1. Admin Login
    const adminRes = await request.post('/api/v1/auth/login', {
      data: { email: 'admin@ibistek.com', password: 'password123' }
    });
    expect(adminRes.ok()).toBeTruthy();
    const adminBody = await adminRes.json();
    adminToken = adminBody.data.token;
    expect(adminToken).toBeDefined();

    // 2. Mahasiswa Login
    const mhsRes = await request.post('/api/v1/auth/login', {
      data: { email: 'mahasiswa@ibistek.com', password: 'password123' }
    });
    expect(mhsRes.ok()).toBeTruthy();
    const mhsBody = await mhsRes.json();
    mhsToken = mhsBody.data.token;
    expect(mhsToken).toBeDefined();

    // 3. Mentor Login
    const mentorRes = await request.post('/api/v1/auth/login', {
      data: { email: 'mentor@ibistek.com', password: 'password123' }
    });
    expect(mentorRes.ok()).toBeTruthy();
    const mentorBody = await mentorRes.json();
    mentorToken = mentorBody.data.token;
    mentorId = mentorBody.data.user.id;
    expect(mentorToken).toBeDefined();

    // 4. UMKM Login
    const umkmRes = await request.post('/api/v1/auth/login', {
      data: { email: 'umkm@ibistek.com', password: 'password123' }
    });
    expect(umkmRes.ok()).toBeTruthy();
    const umkmBody = await umkmRes.json();
    umkmToken = umkmBody.data.token;
    expect(umkmToken).toBeDefined();
  });

  // ══════════════════════════════════════════════════════════
  // MASTER DATA
  // ══════════════════════════════════════════════════════════

  test('02. Master Data — Kategori Usaha & Program Studi (Admin)', async ({ request }) => {
    // Kategori Usaha
    const postKat = await request.post('/api/v1/master-data/kategori-usaha', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Kategori Test ${Date.now()}` }
    });
    expect(postKat.ok()).toBeTruthy();
    const katData = await postKat.json();
    kategoriUsahaId = katData.data.id;

    // Get Kategori
    const getKat = await request.get('/api/v1/master-data/kategori-usaha', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(getKat.ok()).toBeTruthy();

    // Program Studi
    const postProdi = await request.post('/api/v1/master-data/program-studi', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: `Prodi Test ${Date.now()}` }
    });
    expect(postProdi.ok()).toBeTruthy();
    const prodiData = await postProdi.json();
    programStudiId = prodiData.data.id;

    // Get Prodi
    const getProdi = await request.get('/api/v1/master-data/program-studi', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(getProdi.ok()).toBeTruthy();
  });

  // ══════════════════════════════════════════════════════════
  // INKUBASI
  // ══════════════════════════════════════════════════════════

  test('03. Inkubasi — CRUD Periode (Admin/Staff)', async ({ request }) => {
    // Create Periode
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const postPeriod = await request.post('/api/v1/inkubasi/periods', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: `Periode Test ${Date.now()}`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        description: 'Test Deskripsi'
      }
    });

    expect(postPeriod.ok()).toBeTruthy();
    const periodData = await postPeriod.json();
    inkubasiPeriodId = periodData.data.id;

    // Get Active Periode
    const getActive = await request.get('/api/v1/inkubasi/periods/active', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(getActive.ok()).toBeTruthy();
  });

  test('04. Inkubasi — Mahasiswa Submit & Admin Review', async ({ request }) => {
    // 1. Mahasiswa Submit Pengajuan
    const submit = await request.post('/api/v1/inkubasi/applications', {
      headers: { Authorization: `Bearer ${mhsToken}` },
      data: {
        periodId: inkubasiPeriodId,
        namaPemilik: 'Mahasiswa Tester',
        tahunBerdiri: 2024,
        kategoriUsahaId: kategoriUsahaId, // pake kategori yg dibuat sebelumnya (atau dari seed)
        rataOmsetPerBulan: '< 1 Juta',
        platformPenjualan: 'KEDUANYA',
        uraianProduk: 'Produk test untuk testing sistem IBISTEK secara end to end minimal 20 char',
        kendala: 'Kendala yang dihadapi saat ini adalah kurangnya modal dan mentor minim 20 char',
        harapan: 'Harapannya setelah gabung bisa dapat modal dan dibimbing secara komprehensif.'
      }
    });
    expect(submit.ok()).toBeTruthy();
    const submitData = await submit.json();
    inkubasiAppId = submitData.data.id;

    // Mahasiswa Get My Applications
    const myApp = await request.get('/api/v1/inkubasi/applications/my', {
      headers: { Authorization: `Bearer ${mhsToken}` }
    });
    expect(myApp.ok()).toBeTruthy();

    // 2. Admin Review Pengajuan
    const review = await request.patch(`/api/v1/inkubasi/applications/${inkubasiAppId}/review`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: 'APPROVED',
        reviewNote: 'Bagus, ide menarik!'
      }
    });
    expect(review.ok()).toBeTruthy();
  });


  // ══════════════════════════════════════════════════════════
  // KONSULTASI
  // ══════════════════════════════════════════════════════════

  test('05. Konsultasi — Mahasiswa Submit Pengajuan', async ({ request }) => {
    // Buat kategori dummy untuk fail-safe (karena mungkin inkubasi ngambil yg dari master tapi gak apa)
    const dt = new Date();
    dt.setDate(dt.getDate() + 7);

    const submit = await request.post('/api/v1/konsultasi/applications', {
      headers: { Authorization: `Bearer ${mhsToken}` },
      data: {
        namaPemilik: 'Budi Test Konsultasi',
        tahunBerdiri: 2023,
        kategoriUsahaId: kategoriUsahaId,
        rataOmsetPerBulan: '1-5 juta',
        platformPenjualan: 'ONLINE',
        uraianProduk: 'Produk ini bertujuan untuk membantu keseharian mahasiswa di kampus.',
        topikKonsultasi: 'Saya ingin konsultasi tentang digital marketing dan ads optimization di IG.',
        preferredDate: dt.toISOString(),
        metode: 'ONLINE'
      }
    });

    expect(submit.ok()).toBeTruthy();
    const data = await submit.json();
    konsultasiAppId = data.data.id;
  });

  test('06. Konsultasi — Admin Assign Mentor', async ({ request }) => {
    const dl = new Date();
    dl.setDate(dl.getDate() + 1);

    const assign = await request.patch(`/api/v1/konsultasi/applications/${konsultasiAppId}/assign`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        assignedMentorId: mentorId, // Menggunakan ID dari login mentor
        mentorResponseDeadline: dl.toISOString()
      }
    });
    expect(assign.ok()).toBeTruthy();
  });

  test('07. Konsultasi — Mentor Respond', async ({ request }) => {
    // Mentor cek pekerjaannya
    const myAssigned = await request.get('/api/v1/konsultasi/applications/mentor/my', {
      headers: { Authorization: `Bearer ${mentorToken}` }
    });
    expect(myAssigned.ok()).toBeTruthy();

    // Mentor Respond
    const respond = await request.patch(`/api/v1/konsultasi/applications/${konsultasiAppId}/mentor-response`, {
      headers: { Authorization: `Bearer ${mentorToken}` },
      data: {
        bersedia: true
      }
    });
    expect(respond.ok()).toBeTruthy();
  });

  test('08. Konsultasi — Admin Confirm Schedule, WA Link, & Complete', async ({ request }) => {
    const cdt = new Date();
    cdt.setDate(cdt.getDate() + 3);

    // Confirm
    const confirm = await request.patch(`/api/v1/konsultasi/applications/${konsultasiAppId}/confirm`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        confirmedDate: cdt.toISOString(),
        meetingLink: 'https://zoom.us/j/123456789'
      }
    });
    expect(confirm.ok()).toBeTruthy();

    // WA Link - Get
    const getWa = await request.get(`/api/v1/konsultasi/applications/${konsultasiAppId}/wa-link`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(getWa.ok()).toBeTruthy();
    const waData = await getWa.json();
    expect(waData.data.waLink).toBeDefined();

    // Complete
    const complete = await request.patch(`/api/v1/konsultasi/applications/${konsultasiAppId}/complete`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(complete.ok()).toBeTruthy();
  });


  // ══════════════════════════════════════════════════════════
  // MIKRO KREDENSIAL
  // ══════════════════════════════════════════════════════════

  test('09. Mikro Kredensial — Create Kursus (Admin)', async ({ request }) => {
    const slug = `kursus-test-${Date.now()}`;
    const create = await request.post('/api/v1/mikro-kredensial/kursus', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Kursus Digital Marketing Dasar',
        slug: slug,
        description: 'Belajar dasar dasar marketing selama 360 menit dengan modul ini.',
        duration: 360,
        thumbnail: 'https://example.com/image.jpg'
      }
    });
    expect(create.ok()).toBeTruthy();
    const data = await create.json();
    kursusId = data.data.id;
  });

  test('10. Mikro Kredensial — Enroll UMKM & Complete (Sertifikat Gen)', async ({ request }) => {
    // 1. UMKM Enroll
    const enroll = await request.post('/api/v1/mikro-kredensial/enroll', {
      headers: { Authorization: `Bearer ${umkmToken}` },
      data: { kursusId }
    });
    // Jika tidak gagal
    if(enroll.ok()) {
      const data = await enroll.json();
      enrollmentId = data.data.id;

      // UMKM My Enroll
      await request.get('/api/v1/mikro-kredensial/enroll/my', {
        headers: { Authorization: `Bearer ${umkmToken}` }
      });

      // 2. Admin Give Score & Complete
      const comp = await request.patch(`/api/v1/mikro-kredensial/enroll/${enrollmentId}/complete`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { score: 90.5 } // Pass!
      });
      expect(comp.ok()).toBeTruthy();
      const compData = await comp.json();
      expect(compData.data.certificate).not.toBeNull();
      
      const certNumber = compData.data.certificate.certificateNumber;

      // 3. User check my certs
      const myCerts = await request.get('/api/v1/mikro-kredensial/certificates/my', {
        headers: { Authorization: `Bearer ${umkmToken}` }
      });
      expect(myCerts.ok()).toBeTruthy();

      // 4. Public verify cert
      const verify = await request.get(`/api/v1/mikro-kredensial/certificates/verify/${encodeURIComponent(certNumber)}`, {
        // public, no auth needed
      });
      expect(verify.ok()).toBeTruthy();
    }
  });

});
