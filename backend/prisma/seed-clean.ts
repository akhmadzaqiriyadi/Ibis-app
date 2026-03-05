import {
  PrismaClient,
  Role,
  TeamType,
  ProgramType,
  EventStatus,
  PartnerType,
  UserType,
  PlatformPenjualan,
  MetodeKonsultasi,
  InkubasiStatus,
  KonsultasiStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding IBISTEK dimulai...\n');

  const password = await bcrypt.hash('password123', 10);

  // ============================================================
  // 1. MASTER DATA - Kategori Usaha
  // ============================================================
  console.log('🏷️  Seeding kategori usaha...');
  const kategoriList = [
    { name: 'Makanan dan Minuman', order: 1 },
    { name: 'Budidaya', order: 2 },
    { name: 'Industri Kreatif', order: 3 },
    { name: 'Jasa', order: 4 },
    { name: 'Pariwisata', order: 5 },
    { name: 'Perdagangan', order: 6 },
    { name: 'Manufaktur', order: 7 },
    { name: 'Bisnis Digital', order: 8 },
    { name: 'Lainnya', order: 9 },
  ];

  for (const kategori of kategoriList) {
    await prisma.kategoriUsaha.upsert({
      where: { name: kategori.name },
      update: {},
      create: { ...kategori, isActive: true },
    });
  }
  console.log(`  ✅ ${kategoriList.length} kategori usaha berhasil di-seed\n`);

  // ============================================================
  // 2. MASTER DATA - Program Studi UTY
  // ============================================================
  console.log('🎓 Seeding program studi...');
  const prodiList = [
    { name: 'Teknik Informatika', code: 'TI', fakultas: 'Fakultas Teknologi Informasi dan Elektro' },
    { name: 'Sistem Informasi', code: 'SI', fakultas: 'Fakultas Teknologi Informasi dan Elektro' },
    { name: 'Teknik Elektro', code: 'TE', fakultas: 'Fakultas Teknologi Informasi dan Elektro' },
    { name: 'Manajemen', code: 'MNJ', fakultas: 'Fakultas Bisnis dan Humaniora' },
    { name: 'Akuntansi', code: 'AKT', fakultas: 'Fakultas Bisnis dan Humaniora' },
    { name: 'Kewirausahaan', code: 'KWU', fakultas: 'Fakultas Bisnis dan Humaniora' },
    { name: 'Ilmu Komunikasi', code: 'IKOM', fakultas: 'Fakultas Bisnis dan Humaniora' },
    { name: 'Teknik Sipil', code: 'TS', fakultas: 'Fakultas Sains dan Teknologi' },
    { name: 'Teknik Mesin', code: 'TM', fakultas: 'Fakultas Sains dan Teknologi' },
    { name: 'Arsitektur', code: 'ARS', fakultas: 'Fakultas Sains dan Teknologi' },
    { name: 'Farmasi', code: 'FAR', fakultas: 'Fakultas Kesehatan' },
    { name: 'Kebidanan', code: 'KEB', fakultas: 'Fakultas Kesehatan' },
    { name: 'Psikologi', code: 'PSI', fakultas: 'Fakultas Psikologi' },
  ];

  for (const [i, prodi] of prodiList.entries()) {
    await prisma.programStudi.upsert({
      where: { code: prodi.code },
      update: {},
      create: { ...prodi, isActive: true, order: i + 1 },
    });
  }
  console.log(`  ✅ ${prodiList.length} program studi berhasil di-seed\n`);

  // ============================================================
  // 3. USERS - Admin, Staff, Mentor, Mahasiswa, UMKM
  // ============================================================
  console.log('👤 Seeding users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ibistek.com' },
    update: {},
    create: {
      email: 'admin@ibistek.com',
      name: 'Admin IBISTEK',
      role: Role.ADMIN,
      password,
      isActive: true,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@ibistek.com' },
    update: {},
    create: {
      email: 'staff@ibistek.com',
      name: 'Staff IBISTEK',
      role: Role.STAFF,
      password,
      isActive: true,
    },
  });

  const mentorUser = await prisma.user.upsert({
    where: { email: 'mentor@ibistek.com' },
    update: {},
    create: {
      email: 'mentor@ibistek.com',
      name: 'Dr. Budi Santoso, M.M.',
      role: Role.MENTOR,
      password,
      isActive: true,
    },
  });

  const mentorUser2 = await prisma.user.upsert({
    where: { email: 'mentor2@ibistek.com' },
    update: {},
    create: {
      email: 'mentor2@ibistek.com',
      name: 'Ir. Siti Rahma, M.T.',
      role: Role.MENTOR,
      password,
      isActive: true,
    },
  });

  const mahasiswaUser = await prisma.user.upsert({
    where: { email: 'mahasiswa@ibistek.com' },
    update: {},
    create: {
      email: 'mahasiswa@ibistek.com',
      name: 'Ahmad Fauzi',
      role: Role.MAHASISWA,
      password,
      isActive: true,
    },
  });

  const umkmUser = await prisma.user.upsert({
    where: { email: 'umkm@ibistek.com' },
    update: {},
    create: {
      email: 'umkm@ibistek.com',
      name: 'Sari Batik Jogja',
      role: Role.UMKM,
      password,
      isActive: true,
    },
  });

  console.log('  ✅ 6 users berhasil di-seed\n');

  // ============================================================
  // 4. USER PROFILE
  // ============================================================
  console.log('🪪 Seeding user profiles...');

  const tiProdi = await prisma.programStudi.findUnique({ where: { code: 'TI' } });

  // Profil Mahasiswa
  await prisma.userProfile.upsert({
    where: { userId: mahasiswaUser.id },
    update: {},
    create: {
      userId: mahasiswaUser.id,
      userType: UserType.MAHASISWA,
      noWhatsApp: '081234567890',
      npm: '5200611001',
      programStudiId: tiProdi?.id,
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
      verifiedById: adminUser.id,
    },
  });

  // Profil UMKM
  await prisma.userProfile.upsert({
    where: { userId: umkmUser.id },
    update: {},
    create: {
      userId: umkmUser.id,
      userType: UserType.UMKM,
      noWhatsApp: '082345678901',
      alamatUsaha: 'Jl. Malioboro No. 45, Yogyakarta',
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
      verifiedById: adminUser.id,
    },
  });

  console.log('  ✅ User profiles berhasil di-seed\n');

  // ============================================================
  // 5. INKUBASI PERIOD
  // ============================================================
  console.log('📅 Seeding periode inkubasi...');

  const periodeAktif = await prisma.inkubasiPeriod.upsert({
    where: { id: 'period-2026-01' },
    update: {},
    create: {
      id: 'period-2026-01',
      name: 'Periode 1 Tahun 2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-30'),
      isActive: true,
      description: 'Pendaftaran program inkubasi bisnis dan teknologi IBISTEK UTY periode pertama tahun 2026.',
      createdById: adminUser.id,
    },
  });

  // Periode lalu (sudah tutup)
  await prisma.inkubasiPeriod.upsert({
    where: { id: 'period-2025-02' },
    update: {},
    create: {
      id: 'period-2025-02',
      name: 'Periode 2 Tahun 2025',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-10-31'),
      isActive: false,
      description: 'Periode kedua inkubasi bisnis tahun 2025.',
      createdById: adminUser.id,
    },
  });

  console.log('  ✅ 2 periode inkubasi berhasil di-seed\n');

  // ============================================================
  // 6. INKUBASI APPLICATION (contoh)
  // ============================================================
  console.log('📋 Seeding contoh pengajuan inkubasi...');

  const kategoriMnm = await prisma.kategoriUsaha.findUnique({ where: { name: 'Makanan dan Minuman' } });

  const existingInkubasi = await prisma.inkubasiApplication.findFirst({
    where: { userId: mahasiswaUser.id, periodId: periodeAktif.id },
  });

  if (!existingInkubasi && kategoriMnm) {
    await prisma.inkubasiApplication.create({
      data: {
        userId: mahasiswaUser.id,
        periodId: periodeAktif.id,
        namaPemilik: 'Ahmad Fauzi',
        tahunBerdiri: 2023,
        kategoriUsahaId: kategoriMnm.id,
        rataOmsetPerBulan: '5-10 juta',
        platformPenjualan: PlatformPenjualan.KEDUANYA,
        uraianProduk: 'Produk minuman herbal berbasis rempah tradisional Jawa yang dikemas modern.',
        kendala: 'Keterbatasan modal untuk ekspansi pemasaran dan produksi skala besar.',
        harapan: 'Mendapatkan pendampingan manajemen bisnis dan akses ke jaringan investor.',
        status: InkubasiStatus.PENDING,
      },
    });
  }

  console.log('  ✅ Contoh pengajuan inkubasi berhasil di-seed\n');

  // ============================================================
  // 7. KONSULTASI APPLICATION (contoh)
  // ============================================================
  console.log('🗓️  Seeding contoh pengajuan konsultasi...');

  const kategoriBisnis = await prisma.kategoriUsaha.findUnique({ where: { name: 'Bisnis Digital' } });

  const existingKonsultasi = await prisma.konsultasiApplication.findFirst({
    where: { userId: mahasiswaUser.id },
  });

  if (!existingKonsultasi && kategoriBisnis) {
    await prisma.konsultasiApplication.create({
      data: {
        userId: mahasiswaUser.id,
        namaPemilik: 'Ahmad Fauzi',
        tahunBerdiri: 2024,
        kategoriUsahaId: kategoriBisnis.id,
        rataOmsetPerBulan: '1-5 juta',
        platformPenjualan: PlatformPenjualan.ONLINE,
        uraianProduk: 'Jasa pembuatan konten media sosial untuk UMKM.',
        topikKonsultasi: 'Strategi scaling bisnis jasa digital dan cara mengelola klien yang lebih banyak.',
        preferredDate: new Date('2026-03-20T10:00:00Z'),
        metode: MetodeKonsultasi.ONLINE,
        status: KonsultasiStatus.ASSIGNED,
        assignedMentorId: mentorUser.id,
        assignedAt: new Date(),
        assignedById: adminUser.id,
        mentorResponseDeadline: new Date('2026-03-15T23:59:59Z'),
      },
    });
  }

  console.log('  ✅ Contoh pengajuan konsultasi berhasil di-seed\n');

  // ============================================================
  // 8. MIKRO KREDENSIAL KURSUS
  // ============================================================
  console.log('🎓 Seeding mikro kredensial kursus...');

  await prisma.mikroKredensialKursus.upsert({
    where: { slug: 'dasar-kewirausahaan-digital' },
    update: {},
    create: {
      title: 'Dasar Kewirausahaan Digital',
      slug: 'dasar-kewirausahaan-digital',
      description: 'Pelajari fondasi kewirausahaan di era digital: validasi ide bisnis, business model canvas, dan strategi go-to-market.',
      duration: 180,
      isActive: true,
      order: 1,
    },
  });

  await prisma.mikroKredensialKursus.upsert({
    where: { slug: 'pemasaran-digital-umkm' },
    update: {},
    create: {
      title: 'Pemasaran Digital untuk UMKM',
      slug: 'pemasaran-digital-umkm',
      description: 'Strategi pemasaran digital untuk pelaku UMKM: media sosial, SEO dasar, konten marketing, dan iklan berbayar.',
      duration: 240,
      isActive: true,
      order: 2,
    },
  });

  await prisma.mikroKredensialKursus.upsert({
    where: { slug: 'manajemen-keuangan-bisnis' },
    update: {},
    create: {
      title: 'Manajemen Keuangan Bisnis',
      slug: 'manajemen-keuangan-bisnis',
      description: 'Kelola keuangan bisnis dengan benar: pembukuan sederhana, arus kas, laba rugi, dan perencanaan keuangan.',
      duration: 200,
      isActive: true,
      order: 3,
    },
  });

  console.log('  ✅ 3 kursus mikro kredensial berhasil di-seed\n');

  // ============================================================
  // 9. PROGRAMS (Landing Page Content)
  // ============================================================
  console.log('📝 Seeding programs...');

  const programs = [
    {
      slug: 'inkubasi-bisnis',
      title: 'Program Inkubasi Bisnis',
      description:
        'Inkubasi bisnis adalah program pembinaan, pendampingan, dan pengembangan terstruktur bagi usaha rintisan. Program inkubasi bisnis di IBISTEK UTY diselenggarakan secara periodik bagi sejumlah unit bisnis yang terpilih untuk diinkubasi.',
      type: ProgramType.INKUBASI,
      ctaText: 'Daftar Sekarang',
      ctaUrl: '/dashboard/inkubasi',
      requiresAuth: true,
      isActive: true,
      order: 1,
    },
    {
      slug: 'konsultasi-bisnis',
      title: 'Program Konsultasi Bisnis',
      description:
        'Konsultasi bisnis adalah layanan konsultasi dengan mentor atau praktisi untuk menyelesaikan problem-problem yang dihadapi pelaku bisnis secara gratis. Konsultasi dilayani oleh mentor berlatar belakang dosen maupun praktisi.',
      type: ProgramType.KONSULTASI,
      ctaText: 'Jadwalkan Konsultasi',
      ctaUrl: '/dashboard/konsultasi',
      requiresAuth: true,
      isActive: true,
      order: 2,
    },
    {
      slug: 'kredensial-mikro',
      title: 'Kredensial Mikro',
      description:
        'Kredensial Mikro adalah program pelatihan dan sertifikasi jangka pendek untuk meningkatkan pengetahuan dan keterampilan berwirausaha. Ikuti materi dan kerjakan asesmen untuk mendapatkan sertifikat digital.',
      type: ProgramType.KREDENSIAL,
      ctaText: 'Mulai Belajar',
      ctaUrl: '/dashboard/kredensial',
      requiresAuth: true,
      isActive: true,
      order: 3,
    },
    {
      slug: 'event-bisnis',
      title: 'Event Bisnis',
      description:
        'Ikuti berbagai kegiatan sosialisasi, seminar, dan workshop seputar kewirausahaan dan teknologi bisnis bersama IBISTEK UTY.',
      type: ProgramType.EVENT,
      ctaText: 'Lihat Event',
      ctaUrl: '/events',
      requiresAuth: false,
      isActive: true,
      order: 4,
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: {},
      create: program,
    });
  }
  console.log('  ✅ Programs berhasil di-seed\n');

  // ============================================================
  // 10. TEAM MEMBERS
  // ============================================================
  console.log('👥 Seeding team members...');

  const teamMembers = [
    {
      name: 'Ms. Hendriawan A, Ph.D',
      title: 'Wakil Rektor IV UTY bidang Kreativitas, Kewirausahaan dan Pengabdian Masyarakat',
      type: TeamType.LEADER,
      image: '/images/team/hendriawan.jpg',
      order: 1,
    },
    {
      name: 'Adi Wibawa, M.A.',
      title: 'Kepala Bidang Kewirausahaan UTY',
      type: TeamType.LEADER,
      image: '/images/team/adi-wibawa.jpg',
      order: 2,
    },
    {
      name: 'Dr. Budi Santoso, M.M.',
      title: 'Mentor Bisnis & Manajemen',
      type: TeamType.MENTOR,
      division: 'Business Development',
      bio: 'Pengamat bisnis dan wirausaha berpengalaman 15+ tahun, spesialisasi startup dan UMKM.',
      email: 'mentor@ibistek.com',
      order: 3,
    },
    {
      name: 'Ir. Siti Rahma, M.T.',
      title: 'Mentor Teknologi & Inovasi',
      type: TeamType.MENTOR,
      division: 'Technology',
      bio: 'Praktisi teknologi dan inovasi produk, berpengalaman di industri manufaktur dan digital.',
      email: 'mentor2@ibistek.com',
      order: 4,
    },
  ];

  for (const member of teamMembers) {
    const existing = await prisma.teamMember.findFirst({ where: { name: member.name } });
    if (!existing) {
      await prisma.teamMember.create({ data: { ...member, isActive: true } });
    }
  }
  console.log('  ✅ Team members berhasil di-seed\n');

  // ============================================================
  // 11. EVENTS
  // ============================================================
  console.log('📅 Seeding events...');

  const events = [
    {
      slug: 'workshop-digital-marketing-2026',
      title: 'Workshop Digital Marketing untuk UMKM',
      description: 'Pelajari strategi digital marketing terkini untuk mengembangkan bisnis UMKM Anda. Workshop ini membahas social media marketing, content creation, dan digital advertising.',
      date: new Date('2026-03-15T09:00:00Z'),
      endDate: new Date('2026-03-15T16:00:00Z'),
      location: 'Gedung UTY Creative Hub',
      category: 'workshop',
      status: EventStatus.UPCOMING,
      maxParticipants: 50,
      registrationUrl: 'https://forms.gle/example1',
      isPublished: true,
    },
    {
      slug: 'seminar-startup-ecosystem-2026',
      title: 'Seminar Startup Ecosystem Indonesia',
      description: 'Bergabunglah dengan para founder sukses dan investor untuk membahas perkembangan ekosistem startup di Indonesia.',
      date: new Date('2026-04-20T13:00:00Z'),
      endDate: new Date('2026-04-20T17:00:00Z'),
      location: 'Auditorium UTY',
      category: 'seminar',
      status: EventStatus.UPCOMING,
      maxParticipants: 200,
      registrationUrl: 'https://forms.gle/example2',
      isPublished: true,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({ where: { slug: event.slug }, update: {}, create: event });
  }
  console.log('  ✅ Events berhasil di-seed\n');

  // ============================================================
  // 12. FAQs
  // ============================================================
  console.log('❓ Seeding FAQs...');

  const faqs = [
    {
      question: 'Apa itu IBISTEK UTY?',
      answer: 'IBISTEK UTY adalah Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta yang bertugas membina, mendampingi, dan mengembangkan usaha rintisan mahasiswa dan UMKM di lingkungan UTY.',
      category: 'umum',
      order: 1,
    },
    {
      question: 'Siapa yang bisa mendaftar program inkubasi bisnis?',
      answer: 'Program inkubasi bisnis diperuntukkan khusus bagi mahasiswa aktif UTY yang memiliki usaha rintisan atau ide bisnis yang ingin dikembangkan.',
      category: 'inkubasi',
      order: 2,
    },
    {
      question: 'Bagaimana cara mendaftar program konsultasi bisnis?',
      answer: 'Daftarkan diri melalui dashboard setelah membuat akun. Lengkapi form konsultasi, pilih tanggal dan metode (online/offline), lalu tunggu konfirmasi melalui WhatsApp.',
      category: 'konsultasi',
      order: 3,
    },
    {
      question: 'Apakah program inkubasi bisnis berbayar?',
      answer: 'Tidak, seluruh program IBISTEK UTY termasuk inkubasi bisnis, konsultasi, dan kredensial mikro bersifat gratis untuk civitas akademika UTY.',
      category: 'umum',
      order: 4,
    },
    {
      question: 'Apa yang dimaksud dengan Kredensial Mikro?',
      answer: 'Kredensial Mikro adalah program pelatihan jangka pendek dengan sertifikasi digital. Peserta mengikuti materi pembelajaran dan mengerjakan asesmen untuk mendapatkan sertifikat yang dapat digunakan sebagai bukti kompetensi.',
      category: 'kredensial',
      order: 5,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: { ...faq, isActive: true } });
    }
  }
  console.log('  ✅ FAQs berhasil di-seed\n');

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('========================================');
  console.log('✨ Seeding selesai! Akun yang tersedia:');
  console.log('========================================');
  console.log('👑 Admin    : admin@ibistek.com    | password123');
  console.log('🧑‍💼 Staff    : staff@ibistek.com    | password123');
  console.log('🎓 Mentor 1 : mentor@ibistek.com   | password123');
  console.log('🎓 Mentor 2 : mentor2@ibistek.com  | password123');
  console.log('🎒 Mahasiswa: mahasiswa@ibistek.com| password123');
  console.log('🏪 UMKM     : umkm@ibistek.com     | password123');
  console.log('========================================');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error saat seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
