import { prisma } from '../src/config/database';

async function seedModulesAndQuizzes() {
  console.log('[INFO] Seeding initial modules and quizzes...');

  const courses = await prisma.mikroKredensialKursus.findMany();
  for (const course of courses) {
    const existingModules = await prisma.mikroKredensialModul.count({ where: { kursusId: course.id } });
    if (existingModules === 0) {
      console.log(`Adding modules for ${course.title}...`);
      await prisma.mikroKredensialModul.createMany({
        data: [
          {
            kursusId: course.id,
            title: 'Modul 1: Pengantar & Fundamental Utama',
            content: `Selamat datang di modul pertama kursus ${course.title}.\n\nPada modul ini kita akan membedah fondasi dasar, urgensi transformasi digital dalam ekosistem bisnis modern, serta bagaimana mengidentifikasi peluang pasar secara terstruktur. Pelajari karakteristik konsumen saat ini dan manfaatkan data analytics untuk pengambilan keputusan yang presisi.`,
            duration: 15,
            order: 0,
          },
          {
            kursusId: course.id,
            title: 'Modul 2: Strategi & Implementasi Praktis',
            content: `Modul kedua berfokus pada eksekusi strategi.\n\nMemahami konsep saja tidak cukup tanpa implementasi di lapangan. Kita akan membahas taktik penyusunan rencana operasional, pemanfaatan tools otomasi, serta efisiensi alur kerja (workflow) agar bisnis dapat bertumbuh secara terukur dan berkelanjutan.`,
            duration: 25,
            order: 1,
          },
          {
            kursusId: course.id,
            title: 'Modul 3: Evaluasi Kinerja, Scaling & Mitigasi Risiko',
            content: `Di modul penutup ini, kita mengevaluasi indikator kinerja utama (KPI) serta mitigasi risiko finansial dan reputasi.\n\nPelajari cara membaca metrik pertumbuhan, menghitung ROI dari setiap investasi program, dan mempersiapkan bisnis untuk tahap ekspansi (scaling up) ke pasar yang lebih luas.`,
            duration: 20,
            order: 2,
          },
        ],
      });
    }

    const existingQuizzes = await prisma.mikroKredensialQuiz.count({ where: { kursusId: course.id } });
    if (existingQuizzes === 0) {
      console.log(`Adding quizzes for ${course.title}...`);
      await prisma.mikroKredensialQuiz.createMany({
        data: [
          {
            kursusId: course.id,
            question: 'Apa langkah pertama yang paling krusial sebelum memulai peluncuran produk atau program baru ke pasar?',
            options: [
              'Membuat iklan promosi berskala besar di media sosial',
              'Riset pasar mendalam dan identifikasi pain point pelanggan potensial',
              'Meminjam modal kerja maksimal dari institusi keuangan',
              'Menyewa kantor fisik di lokasi paling strategis',
            ],
            correctAnswer: 1,
            explanation: 'Riset pasar dan validasi kebutuhan konsumen adalah fondasi mutlak sebelum menginvestasikan sumber daya dalam skala besar.',
            order: 0,
          },
          {
            kursusId: course.id,
            question: 'Indikator apa yang paling tepat untuk mengukur efektivitas biaya perolehan pelanggan baru?',
            options: [
              'Return on Investment (ROI)',
              'Customer Lifetime Value (CLV)',
              'Customer Acquisition Cost (CAC)',
              'Net Profit Margin',
            ],
            correctAnswer: 2,
            explanation: 'Customer Acquisition Cost (CAC) secara spesifik menghitung seluruh biaya marketing & sales dibagi jumlah pelanggan baru yang didapat.',
            order: 1,
          },
          {
            kursusId: course.id,
            question: 'Bagaimana pendekatan terbaik dalam mengelola risiko keuangan bagi pelaku usaha pemula?',
            options: [
              'Memisahkan rekening pribadi dengan rekening operasional usaha sejak hari pertama',
              'Menggabungkan semua arus kas ke satu rekening agar mudah dipantau',
              'Tidak perlu mencatat pengeluaran kecil di bawah 100 ribu rupiah',
              'Menggunakan modal kerja untuk konsumsi operasional pribadi pemilik',
            ],
            correctAnswer: 0,
            explanation: 'Pemisahan rekening bisnis dan rekening pribadi adalah disiplin keuangan paling utama untuk mencegah kebocoran kas.',
            order: 2,
          },
          {
            kursusId: course.id,
            question: 'Dalam strategi pemasaran digital modern, apa keuntungan utama pendekatan Organic Content Marketing dibandingkan Paid Ads?',
            options: [
              'Hasil konversi instan dalam hitungan menit',
              'Membangun kredibilitas, kepercayaan, dan basis audiens loyal dalam jangka panjang',
              'Tidak memerlukan riset audiens sama sekali',
              'Bisa menggantikan peran produk yang berkualitas',
            ],
            correctAnswer: 1,
            explanation: 'Konten organik yang bernilai tinggi menghasilkan kepercayaan dan loyalitas jangka panjang dengan biaya perolehan yang berkelanjutan.',
            order: 3,
          },
          {
            kursusId: course.id,
            question: 'Apa yang dimaksud dengan Minimum Viable Product (MVP)?',
            options: [
              'Produk dengan fitur paling lengkap dan kemasan paling mewah',
              'Produk versi awal dengan fitur inti yang cukup untuk menguji asumsi dan mendapatkan umpan balik pengguna nyata',
              'Produk cacat yang dijual dengan diskon besar',
              'Rancangan desain yang baru berbentuk sketsa di kertas',
            ],
            correctAnswer: 1,
            explanation: 'MVP memungkinkan bisnis memvalidasi hipotesis produk dengan sumber daya minimum dan iterasi cepat berdasarkan feedback pengguna.',
            order: 4,
          },
        ],
      });
    }
  }

  console.log('[INFO] Selesai seed modules dan quizzes.');
}

seedModulesAndQuizzes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
