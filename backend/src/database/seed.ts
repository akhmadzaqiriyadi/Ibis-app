import { prisma } from '../config/database';

async function main() {
  console.log('🌱 Starting seed...');

  // Seed Programs
  console.log('📝 Seeding programs...');
  await prisma.program.createMany({
    data: [
      {
        title: 'Inkubasi Bisnis',
        slug: 'inkubasi',
        description: 'Inkubasi bisnis adalah program pembinaan, pendampingan, dan pengembangan terstruktur bagi usaha rintisan. Program inkubasi bisnis di IBISTEK UTY diselenggarakan secara periodik bagi sejumlah unit bisnis yang terpilih untuk diinkubasi. Ayo daftarkan bisnismu untuk diinkubasi!',
        type: 'INKUBASI',
        ctaText: 'Daftar Sekarang',
        ctaUrl: '/auth/register?program=inkubasi',
        requiresAuth: true,
        isActive: true,
        order: 1,
      },
      {
        title: 'Konsultasi Bisnis',
        slug: 'konsultasi',
        description: 'Konsultasi bisnis adalah layanan konsultasi dengan mentor atau praktisi untuk menyelesaikan problem-problem yang dihadapi pelaku bisnis secara gratis.',
        type: 'KONSULTASI',
        ctaText: 'Jadwalkan Konsultasi',
        ctaUrl: '/auth/register?program=konsultasi',
        requiresAuth: true,
        isActive: true,
        order: 2,
      },
      {
        title: 'Kredensial Mikro',
        slug: 'kredensial',
        description: 'Kredensial Mikro adalah program pelatihan dan sertifikasi jangka pendek yang dirancang untuk meningkatkan pengetahuan dan keterampilan berwirausaha secara cepat.',
        type: 'KREDENSIAL',
        ctaText: 'Ikuti Sekarang',
        ctaUrl: '/auth/register?program=kredensial',
        requiresAuth: true,
        isActive: true,
        order: 3,
      },
      {
        title: 'Event Bisnis',
        slug: 'event',
        description: 'Ikuti berbagai kegiatan sosialisasi, seminar, dan workshop seputar kewirausahaan.',
        type: 'EVENT',
        ctaText: 'Lihat Detail',
        ctaUrl: '#updates',
        requiresAuth: false,
        isActive: true,
        order: 4,
      },
    ],
    skipDuplicates: true,
  });

  // Seed Team Members
  console.log('👥 Seeding team members...');
  await prisma.teamMember.createMany({
    data: [
      {
        name: 'Ms. Hendriawan A, Ph.D',
        title: 'Wakil Rektor IV UTY bidang Kreativitas, Kewirausahaan dan Pengabdian Masyarakat',
        type: 'LEADER',
        image: '/images/team/hendriawan.jpg',
        order: 1,
        isActive: true,
      },
      {
        name: 'Adi Wibawa, M.A.',
        title: 'Kepala Bidang Kewirausahaan UTY',
        type: 'LEADER',
        image: '/images/team/adi-wibawa.jpg',
        order: 2,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Seed Sample Event
  console.log('📅 Seeding sample event...');
  await prisma.event.create({
    data: {
      title: 'Sosialisasi P2MW 2026',
      slug: 'sosialisasi-p2mw-2026',
      description: 'Program Pembinaan Mahasiswa Wirausaha (P2MW) adalah program yang dirancang untuk menumbuhkan jiwa kewirausahaan di kalangan mahasiswa dan mendukung pengembangan usaha rintisan berbasis inovasi.',
      date: new Date('2026-03-15'),
      location: 'Gedung UTY Creative Hub',
      category: 'sosialisasi',
      status: 'UPCOMING',
      maxParticipants: 100,
      registrationUrl: 'https://forms.gle/example',
      isPublished: true,
    },
  });

  // Seed Sample Update
  console.log('📰 Seeding sample update...');
  await prisma.update.create({
    data: {
      title: 'Workshop Kewirausahaan Digital',
      slug: 'workshop-kewirausahaan-digital',
      summary: 'IBISTEK UTY mengadakan workshop kewirausahaan digital yang diikuti oleh 50+ mahasiswa UTY dari berbagai program studi.',
      content: 'Workshop ini membahas tentang strategi pemasaran digital, e-commerce, dan penggunaan media sosial untuk bisnis.',
      image: '/images/updates/workshop-digital.jpg',
      date: new Date('2026-01-29'),
      category: 'workshop',
      isPublished: true,
    },
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
