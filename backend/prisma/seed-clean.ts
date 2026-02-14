import { PrismaClient, Role, TeamType, ProgramType, EventStatus, PartnerType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dimulai...');

  // 0. Seed Users with Roles
  console.log('👤 Membuat users...');
  
  const password = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@ibistek.com',
      name: 'Admin Ibistek',
      role: Role.ADMIN,
      password: password,
      isActive: true,
    },
    {
      email: 'staff@ibistek.com',
      name: 'Staff Ibistek',
      role: Role.STAFF,
      password: password,
      isActive: true,
    },
    {
      email: 'member@ibistek.com',
      name: 'Member Ibistek',
      role: Role.MEMBER,
      password: password,
      isActive: true,
    },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: user,
      });
      console.log(`User created: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
  console.log('✅ Users berhasil dibuat');

  // 1. Seed Programs
  console.log('📝 Membuat programs...');
  await prisma.program.upsert({
    where: { slug: 'inkubasi-bisnis' },
    update: {},
    create: {
      title: 'Program Inkubasi Bisnis',
      slug: 'inkubasi-bisnis',
      description: 'Program pendampingan bisnis intensif selama 6 bulan untuk mengembangkan startup Anda dari ide hingga go-to-market',
      type: ProgramType.INKUBASI,
      ctaText: 'Daftar Program',
      ctaUrl: '/programs/inkubasi',
      requiresAuth: true,
      isActive: true,
      order: 1,
    },
  });

  await prisma.program.upsert({
    where: { slug: 'konsultasi-bisnis' },
    update: {},
    create: {
      title: 'Program Konsultasi Bisnis',
      slug: 'konsultasi-bisnis',
      description: 'Layanan konsultasi bisnis profesional untuk meningkatkan performa dan strategi bisnis Anda',
      type: ProgramType.KONSULTASI,
      ctaText: 'Konsultasi Sekarang',
      ctaUrl: '/programs/konsultasi',
      requiresAuth: false,
      isActive: true,
      order: 2,
    },
  });
  console.log('✅ Programs berhasil dibuat');

  // 2. Seed Events
  console.log('📅 Membuat events...');
  
  const eventsData = [
    {
      slug: 'workshop-digital-marketing-2026',
      title: 'Workshop Digital Marketing untuk UMKM',
      description: 'Pelajari strategi digital marketing terkini untuk mengembangkan bisnis UMKM Anda. Workshop ini akan membahas social media marketing, content creation, dan digital advertising dengan praktik langsung.',
      date: new Date('2026-03-15T09:00:00Z'),
      endDate: new Date('2026-03-15T16:00:00Z'),
      location: 'Gedung UTY Creative Hub',
      image: 'https://res.cloudinary.com/dsirus0pz/image/upload/v1771053714/news-1_s35mcq.webp',
      category: 'workshop',
      status: EventStatus.UPCOMING,
      maxParticipants: 50,
      registrationUrl: 'https://forms.gle/example1',
      isPublished: true,
    },
    {
      slug: 'seminar-startup-ecosystem-2026',
      title: 'Seminar Startup Ecosystem Indonesia',
      description: 'Bergabunglah dengan para founder sukses dan investor untuk membahas perkembangan ekosistem startup di Indonesia. Dapatkan insights tentang funding, scaling, dan membangun tim yang solid.',
      date: new Date('2026-04-20T13:00:00Z'),
      endDate: new Date('2026-04-20T17:00:00Z'),
      location: 'Auditorium UTY',
      image: 'https://res.cloudinary.com/dsirus0pz/image/upload/v1771053714/news-2_elkvrb.webp',
      category: 'seminar',
      status: EventStatus.UPCOMING,
      maxParticipants: 200,
      registrationUrl: 'https://forms.gle/example2',
      isPublished: true,
    },
    {
      slug: 'bootcamp-web-development-2026',
      title: 'Bootcamp Web Development Intensif',
      description: 'Program bootcamp 3 hari untuk belajar web development dari nol hingga mahir. Materi mencakup HTML, CSS, JavaScript, React, dan deployment. Cocok untuk pemula yang ingin menjadi web developer profesional.',
      date: new Date('2026-05-10T08:00:00Z'),
      endDate: new Date('2026-05-12T17:00:00Z'),
      location: 'Lab Komputer UTY',
      image: 'https://res.cloudinary.com/dsirus0pz/image/upload/v1771053714/news-1_s35mcq.webp',
      category: 'workshop',
      status: EventStatus.UPCOMING,
      maxParticipants: 30,
      registrationUrl: 'https://forms.gle/example3',
      isPublished: true,
    },
    {
      slug: 'networking-night-entrepreneurs-2026',
      title: 'Networking Night for Young Entrepreneurs',
      description: 'Malam networking eksklusif untuk para entrepreneur muda. Kesempatan emas untuk bertemu dengan sesama entrepreneur, mentor, dan investor. Termasuk sesi pitching dan business matching.',
      date: new Date('2026-06-05T18:00:00Z'),
      endDate: new Date('2026-06-05T21:00:00Z'),
      location: 'UTY Coworking Space',
      image: 'https://res.cloudinary.com/dsirus0pz/image/upload/v1771053714/news-2_elkvrb.webp',
      category: 'networking',
      status: EventStatus.UPCOMING,
      maxParticipants: 100,
      registrationUrl: 'https://forms.gle/example4',
      isPublished: true,
    },
  ];

  for (const eventData of eventsData) {
    await prisma.event.upsert({
      where: { slug: eventData.slug },
      update: {},
      create: eventData,
    });
  }
  
  console.log('✅ Events berhasil dibuat');

  // 3. Seed Team Members
  console.log('👥 Membuat team members...');
  
  const teamMembers = [
    {
      name: 'Dr. Budi Santoso',
      title: 'Director',
      type: TeamType.LEADER,
      division: 'Management',
      bio: 'Experienced entrepreneur and business mentor with 15+ years in the industry',
      email: 'budi@ibistek.com',
      order: 1,
      isActive: true,
    },
    {
      name: 'Siti Rahma, M.M.',
      title: 'Program Manager',
      type: TeamType.STAFF,
      division: 'Program Development',
      bio: 'Expert in startup incubation and acceleration programs',
      email: 'siti@ibistek.com',
      order: 2,
      isActive: true,
    }
  ];

  for (const member of teamMembers) {
    const existingMember = await prisma.teamMember.findFirst({
      where: { email: member.email },
    });

    if (!existingMember) {
      await prisma.teamMember.create({
        data: member,
      });
      console.log(`Team member created: ${member.name}`);
    } else {
        console.log(`Team member already exists: ${member.name}`);
    }
  }
  console.log('✅ Team members berhasil dibuat');

  // 4. Seed Updates
  console.log('📰 Membuat updates...');
  await prisma.update.upsert({
    where: { slug: 'pembukaan-batch-2026' },
    update: {},
    create: {
      title: 'Pembukaan Pendaftaran Batch 2026',
      slug: 'pembukaan-batch-2026',
      summary: 'Kami membuka pendaftaran untuk program inkubasi bisnis batch 2026',
      content: 'Program inkubasi bisnis IBISTEK UTY kembali dibuka untuk batch 2026. Dapatkan pendampingan intensif dan akses ke berbagai resource untuk mengembangkan bisnis Anda.',
      date: new Date(),
      category: 'news',
      isPublished: true,
    },
  });
  console.log('✅ Updates berhasil dibuat');

  // 5. Seed Partners
  console.log('🤝 Membuat partners...');
  
  const partners = [
    {
      name: 'Tech Company Indonesia',
      type: PartnerType.CORPORATE,
      logo: '/images/partners/tech-company.png',
      order: 1,
      isActive: true,
    },
    {
      name: 'Innovation Fund',
      type: PartnerType.STARTUP,
      logo: '/images/partners/innovation-fund.png',
      order: 2,
      isActive: true,
    }
  ];

  for (const partner of partners) {
    const existingPartner = await prisma.partner.findFirst({
        where: { name: partner.name }
    });
    
    if (!existingPartner) {
        await prisma.partner.create({ data: partner });
        console.log(`Partner created: ${partner.name}`);
    } else {
        console.log(`Partner already exists: ${partner.name}`);
    }
  }

  console.log('✅ Partners berhasil dibuat');

  // 6. Seed FAQs
  console.log('❓ Membuat FAQs...');
  
  const faqData = [
    {
      question: 'Bagaimana cara mendaftar program inkubasi?',
      answer: 'Anda dapat mendaftar melalui form pendaftaran di website kami. Pastikan Anda melengkapi semua dokumen yang diperlukan.',
      category: 'general',
      order: 1,
      isActive: true,
    },
    {
      question: 'Apa saja benefit yang didapat dari program inkubasi?',
      answer: 'Program inkubasi menyediakan mentoring, networking, akses ke investor, dan berbagai fasilitas lainnya untuk mendukung pertumbuhan bisnis Anda.',
      category: 'program',
      order: 2,
      isActive: true,
    }
  ];

  for (const faq of faqData) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }
  console.log('✅ FAQs berhasil dibuat');

  console.log('\n✨ Seeding selesai dengan sukses!');
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
