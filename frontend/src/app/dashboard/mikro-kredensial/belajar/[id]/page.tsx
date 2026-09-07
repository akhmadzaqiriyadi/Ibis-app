'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetEnrollmentById,
  useCompleteEnrollment,
  useGetModulesByKursus,
  useGetQuizzesByKursus,
} from '@/features/mikro-kredensial/hooks';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Clock,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  ExternalLink,
  Video,
} from 'lucide-react';
import { getSafeStorageUrl } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

// ─── DATA SILABUS & KUIS PER KURSUS ─────────────────────────────────────────

type QuizQuestion = {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
};

type CourseContent = {
  modules: {
    id: string;
    title: string;
    content: string[];
    keyTakeaway: string;
    fileUrl?: string | null;
    videoUrl?: string | null;
  }[];
  quiz: QuizQuestion[];
};

const getEmbedUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const COURSE_MATERIALS: Record<string, CourseContent> = {
  'dasar-kewirausahaan-digital': {
    modules: [
      {
        id: 'modul-1',
        title: 'Modul 1: Pola Pikir Wirausaha & Validasi Masalah',
        content: [
          'Kewirausahaan digital berakar dari pemecahan masalah nyata (pain point) konsumen dengan memanfaatkan keunggulan teknologi.',
          'Banyak usaha pemula gagal bukan karena produknya jelek, melainkan karena membangun sesuatu yang tidak diinginkan oleh pasar (No Market Need).',
          'Metode Problem-Solution Fit: Lakukan wawancara kepada minimal 15-20 calon pengguna sebelum menghabiskan modal untuk produksi barang.',
        ],
        keyTakeaway: 'Validasi rasa sakit (pain point) pelanggan sebelum memvalidasi produk atau solusi Anda.',
      },
      {
        id: 'modul-2',
        title: 'Modul 2: Merancang Business Model Canvas (BMC)',
        content: [
          'Business Model Canvas (BMC) membagi model bisnis ke dalam 9 blok strategis: Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, dan Cost Structure.',
          'Fokuskan perhatian utama pada hubungan antara "Customer Segments" dan "Value Proposition" (disebut Value Proposition Fit).',
          'Tentukan model pendapatan yang berkelanjutan: apakah melalui penjualan langsung, langganan, atau komisi transaksi.',
        ],
        keyTakeaway: 'BMC adalah dokumen dinamis yang harus diuji dan diperbarui seiring respon nyata pasar.',
      },
      {
        id: 'modul-3',
        title: 'Modul 3: Minimum Viable Product (MVP) & Eksekusi Cepat',
        content: [
          'MVP adalah versi produk paling sederhana yang sudah bisa memberikan nilai utama bagi pengguna dengan sumber daya minimal.',
          'Siklus Build - Measure - Learn: Buat prototype cepat, ukur feedback nyata dari pengguna, dan pelajari apakah harus pivot atau lanjut.',
          'Gunakan alat digital no-code atau landing page uji coba untuk mengukur minat pre-order pasar sebelum peluncuran resmi.',
        ],
        keyTakeaway: 'Kecepatan belajar dari pasar nyata jauh lebih berharga daripada menyempurnakan fitur di ruang tertutup.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Apa penyebab paling umum kegagalan usaha rintisan / startup di tahap awal?',
        options: [
          { key: 'A', text: 'Tidak memiliki logo dan kantor fisik yang mewah' },
          { key: 'B', text: 'Membangun produk yang ternyata tidak dibutuhkan oleh pasar (No Market Need)' },
          { key: 'C', text: 'Terlalu banyak memiliki mentor dan pembina' },
          { key: 'D', text: 'Memulai usaha tanpa langsung merekrut puluhan karyawan' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 2,
        question: 'Pada Business Model Canvas (BMC), apa keterkaitan utama antara Value Proposition dan Customer Segments?',
        options: [
          { key: 'A', text: 'Solusi yang ditawarkan harus menjawab masalah dan kebutuhan spesifik kelompok pelanggan tersebut' },
          { key: 'B', text: 'Kedua blok tersebut hanya berfungsi untuk menghitung total pajak perusahaan' },
          { key: 'C', text: 'Hanya boleh diisi jika perusahaan sudah berbadan hukum PT' },
          { key: 'D', text: 'Menentukan besarnya bunga pinjaman bank yang harus diambil' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 3,
        question: 'Apa tujuan utama dari pembuatan Minimum Viable Product (MVP)?',
        options: [
          { key: 'A', text: 'Menghabiskan modal investasi secepat mungkin' },
          { key: 'B', text: 'Membuat produk terlengkap dengan semua fitur canggih sekaligus' },
          { key: 'C', text: 'Menguji hipotesis nilai produk dan mendapatkan umpan balik nyata dari pengguna secepat mungkin' },
          { key: 'D', text: 'Mencegah kompetitor meniru ide usaha' },
        ],
        correctAnswer: 'C',
      },
      {
        id: 4,
        question: 'Dalam siklus Lean Startup, urutan proses iterasi yang tepat adalah:',
        options: [
          { key: 'A', text: 'Build -> Measure -> Learn' },
          { key: 'B', text: 'Sell -> Build -> Complain' },
          { key: 'C', text: 'Borrow -> Spend -> Quit' },
          { key: 'D', text: 'Plan -> Delay -> Repeat' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 5,
        question: 'Kapan seorang wirausaha sebaiknya melakukan wawancara validasi masalah kepada calon konsumen?',
        options: [
          { key: 'A', text: 'Setelah pabrik dan stok barang selesai 100%' },
          { key: 'B', text: 'Sebelum menghabiskan waktu dan biaya besar untuk memproduksi barang/aplikasi' },
          { key: 'C', text: 'Hanya jika disuruh oleh pihak perbankan' },
          { key: 'D', text: 'Ketika usaha sudah resmi terdaftar di bursa efek' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
  'pemasaran-digital-umkm': {
    modules: [
      {
        id: 'modul-1',
        title: 'Modul 1: Memahami Persona Konsumen & Customer Journey',
        content: [
          'Targeting yang tepat sasaran dimulai dari mendefinisikan "Buyer Persona": usia, pekerjaan, media sosial favorit, dan problem utama yang ingin mereka selesaikan.',
          'Customer Journey: Awareness (tahu merek) -> Consideration (menimbang solusi) -> Conversion (membeli) -> Retention (beli lagi).',
          'Konten pemasaran harus disesuaikan dengan tahapan journey, bukan hanya terus-menerus melakukan hard-selling.',
        ],
        keyTakeaway: 'Kenali audiens Anda secara spesifik. Ketika Anda mencoba menjual ke semua orang, Anda tidak menjual ke siapa-siapa.',
      },
      {
        id: 'modul-2',
        title: 'Modul 2: Formula Copywriting yang Menghasilkan Penjualan',
        content: [
          'Formula AIDA: Attention (Hook headline) -> Interest (Fakta menarik) -> Desire (Solusi benefit) -> Action (Call-to-action jelas).',
          'Fokus pada "Benefit" (manfaat yang dirasakan pembeli), bukan sekadar "Feature" (spesifikasi teknis).',
          'Contoh: Feature = baterai 5000 mAh; Benefit = "Bisa dipakai seharian tanpa khawatir mati saat meeting penting".',
        ],
        keyTakeaway: 'Pelanggan tidak membeli produk; mereka membeli versi diri mereka yang lebih baik setelah memakai produk Anda.',
      },
      {
        id: 'modul-3',
        title: 'Modul 3: Optimasi Kanal Media Sosial & WhatsApp Business',
        content: [
          'Format video pendek (Reels, TikTok, Shorts) memiliki tingkat jangkauan organik tertinggi untuk produk UMKM.',
          'Gunakan WhatsApp Business dengan fitur katalog, auto-reply sambutan, dan quick replies untuk mempercepat proses closing.',
          'Ukur metrik konversi: rasio klik ke chat WhatsApp dan rasio dari chat menjadi transaksi transfer.',
        ],
        keyTakeaway: 'Kanal promosi menarik calon pembeli, namun kecepatan respon di WhatsApp yang menentukan penjualan terjadi.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Dalam konsep copywriting, apa perbedaan utama antara Feature dan Benefit?',
        options: [
          { key: 'A', text: 'Feature adalah manfaat emosional, sedangkan Benefit adalah harga produk' },
          { key: 'B', text: 'Feature menjelaskan spesifikasi barang, sedangkan Benefit menjelaskan keuntungan nyata bagi pembeli' },
          { key: 'C', text: 'Keduanya memiliki arti yang persis sama tanpa perbedaan' },
          { key: 'D', text: 'Feature untuk promosi offline, Benefit untuk promosi online' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 2,
        question: 'Singkatan dari formula copywriting AIDA adalah:',
        options: [
          { key: 'A', text: 'Attention, Interest, Desire, Action' },
          { key: 'B', text: 'Action, Inspiration, Discount, Always' },
          { key: 'C', text: 'Affiliate, Income, Daily, Automated' },
          { key: 'D', text: 'Algorithm, Internet, Digital, Advertising' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 3,
        question: 'Mengapa hard-selling yang terus-menerus di media sosial sering kali menurunkan keterlibatan (engagement) audiens?',
        options: [
          { key: 'A', text: 'Karena audiens media sosial mencari nilai hiburan, edukasi, atau inspirasi sebelum memutuskan membeli' },
          { key: 'B', text: 'Karena algoritma media sosial melarang semua orang berjualan' },
          { key: 'C', text: 'Karena harga barang di media sosial wajib di atas satu juta rupiah' },
          { key: 'D', text: 'Karena internet tidak bisa dipakai untuk transaksi jual beli' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 4,
        question: 'Fitur WhatsApp Business apa yang paling membantu mempercepat respon ke pelanggan saat admin sedang sibuk?',
        options: [
          { key: 'A', text: 'Ganti wallpaper chat' },
          { key: 'B', text: 'Greeting Message & Quick Replies' },
          { key: 'C', text: 'Panggilan video grup' },
          { key: 'D', text: 'Hapus akun otomatis' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 5,
        question: 'Format konten media sosial apa yang saat ini memiliki jangkauan organik (organic reach) paling luas bagi UMKM?',
        options: [
          { key: 'A', text: 'Teks panjang tanpa gambar di grup chat' },
          { key: 'B', text: 'Video pendek vertikal (Shorts / Reels / TikTok)' },
          { key: 'C', text: 'Gambar berformat low-resolution' },
          { key: 'D', text: 'Broadcast email ke kontak acak' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
  'manajemen-keuangan-bisnis': {
    modules: [
      {
        id: 'modul-1',
        title: 'Modul 1: Pemisahan Keuangan Pribadi dan Rekening Usaha',
        content: [
          'Kesalahan paling fatal wirausaha pemula adalah mencampur uang operasional usaha dengan uang saku pribadi keluarga.',
          'Tetapkan "gaji pemilik usaha" bulanan yang tetap. Gunakan rekening bank terpisah khusus untuk seluruh arus transaksi kas bisnis.',
          'Catat setiap pemasukan dan pengeluaran sekecil apapun setiap hari menggunakan aplikasi pembukuan digital.',
        ],
        keyTakeaway: 'Bisnis yang menguntungkan di atas kertas tetap bisa bangkrut jika arus kasnya tidak disiplin.',
      },
      {
        id: 'modul-2',
        title: 'Modul 2: Menghitung Harga Pokok Penjualan (HPP) & Margin Laba',
        content: [
          'HPP mencakup Biaya Bahan Baku Langsung + Biaya Tenaga Kerja Langsung + Biaya Overhead Pabrik/Operasional.',
          'Banyak pengusaha UMKM salah menentukan harga jual karena lupa menghitung biaya kemasan, ongkos kirim, dan depresiasi alat kerja.',
          'Rumus Margin Laba Bersih = ((Pendapatan - Seluruh Biaya) / Pendapatan) x 100%.',
        ],
        keyTakeaway: 'Omset adalah vanity (kebanggaan semu), profit adalah sanity (kewarasan), dan cashflow adalah reality (kenyataan).',
      },
      {
        id: 'modul-3',
        title: 'Modul 3: Mengelola Arus Kas (Cash Flow) & Dana Cadangan',
        content: [
          'Arus kas positif terjadi saat kas masuk lebih besar daripada kas keluar pada periode waktu tertentu.',
          'Waspadai piutang macet: tetapkan batas waktu pelunasan yang tegas untuk pelanggan yang membeli secara kredit / invoice tempo.',
          'Siapkan dana darurat usaha minimal setara 3-6 bulan pengeluaran operasional rutin untuk menjaga kestabilan bisnis.',
        ],
        keyTakeaway: 'Uang tunai di tangan adalah oksigen bisnis untuk bertahan dalam kondisi krisis atau penurunan pasar.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Mengapa keuangan pribadi dan keuangan usaha wajib dipisahkan sejak hari pertama?',
        options: [
          { key: 'A', text: 'Agar kinerja keuangan usaha terlihat jelas dan kas operasional tidak terpakai untuk konsumsi pribadi' },
          { key: 'B', text: 'Hanya sebagai formalitas agar bisa sombong ke teman' },
          { key: 'C', text: 'Karena bank hanya memperbolehkan satu nomor rekening per orang' },
          { key: 'D', text: 'Agar pemilik usaha tidak perlu membayar gaji kepada diri sendiri' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 2,
        question: 'Dalam penentuan harga produk, apa yang dimaksud dengan Harga Pokok Penjualan (HPP)?',
        options: [
          { key: 'A', text: 'Harga tertinggi yang pernah dibayar oleh pelanggan' },
          { key: 'B', text: 'Total seluruh biaya langsung yang dikeluarkan untuk menghasilkan barang atau jasa siap jual' },
          { key: 'C', text: 'Total diskon yang diberikan saat tanggal kembar' },
          { key: 'D', text: 'Biaya liburan tahunan tim pemasaran' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 3,
        question: 'Pepatah keuangan bisnis mengatakan "Omset is vanity, Cashflow is reality". Makna kalimat tersebut adalah:',
        options: [
          { key: 'A', text: 'Uang kas fisik di bank jauh lebih menentukan kelangsungan hidup bisnis dibanding angka penjualan besar yang belum tertagih' },
          { key: 'B', text: 'Omset tidak perlu dicatat dalam laporan keuangan' },
          { key: 'C', text: 'Wirausaha tidak boleh menerima pembayaran tunai' },
          { key: 'D', text: 'Bisnis hanya perlu fokus menaikkan omset tanpa memedulikan laba' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 4,
        question: 'Berapa rekomendasi minimal dana cadangan darurat operasional yang ideal dimiliki usaha?',
        options: [
          { key: 'A', text: '1 hari operasional' },
          { key: 'B', text: '3 sampai 6 bulan biaya operasional rutin' },
          { key: 'C', text: '10 tahun biaya operasional' },
          { key: 'D', text: 'Tidak perlu ada dana cadangan' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 5,
        question: 'Bagaimana cara terbaik bagi pemilik usaha pemula dalam mengambil penghasilan dari bisnisnya?',
        options: [
          { key: 'A', text: 'Mengambil semua uang di laci kasir setiap sore secara sembarangan' },
          { key: 'B', text: 'Menetapkan gaji rutin yang wajar bagi diri sendiri dan dicatat sebagai biaya usaha' },
          { key: 'C', text: 'Menjual aset pabrik setiap akhir pekan' },
          { key: 'D', text: 'Tidak boleh mengambil penghasilan sama sekali seumur hidup' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
};

// Fallback jika ada kursus kustom di luar 3 yang default
const FALLBACK_MATERIAL: CourseContent = {
  modules: [
    {
      id: 'modul-1',
      title: 'Modul 1: Pengenalan Materi & Fondasi Praktis',
      content: [
        'Pelatihan ini dirancang untuk membekali wirausaha mahasiswa dan UMKM dengan pengetahuan aplikatif yang relevan.',
        'Pelajari setiap konsep dasar, studi kasus, dan instrumen kerja yang dipaparkan dalam modul ini.',
        'Terapkan materi yang dipelajari secara bertahap dalam pengembangan usaha rintisan Anda.',
      ],
      keyTakeaway: 'Kombinasi antara pemahaman teori yang kuat dan eksekusi konsisten adalah kunci keberhasilan bisnis.',
    },
    {
      id: 'modul-2',
      title: 'Modul 2: Implementasi & Evaluasi Strategis',
      content: [
        'Setiap strategi bisnis harus diukur melalui indikator kinerja utama (KPI) yang terukur dan realistis.',
        'Lakukan evaluasi berkala terhadap respon pasar, efisiensi operasional, dan kepuasan pelanggan.',
        'Adaptasi cepat terhadap perubahan tren teknologi digital untuk mempertahankan daya saing usaha.',
      ],
      keyTakeaway: 'Bisnis yang tangguh adalah bisnis yang mampu beradaptasi dengan kebutuhan pelanggan.',
    },
  ],
  quiz: [
    {
      id: 1,
      question: 'Apa langkah pertama yang paling bijak dalam memulai inisiatif bisnis baru?',
      options: [
        { key: 'A', text: 'Memahami masalah nyata pelanggan dan melakukan riset pasar' },
        { key: 'B', text: 'Menghabiskan modal untuk sewa ruko mahal' },
        { key: 'C', text: 'Langsung membuat brosur sebelum tahu apa yang dijual' },
        { key: 'D', text: 'Menunggu orang lain memulai terlebih dahulu' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 2,
      question: 'Mengapa evaluasi berkala sangat penting dalam menjalankan usaha?',
      options: [
        { key: 'A', text: 'Agar dapat mengetahui efektivitas strategi dan melakukan perbaikan segera' },
        { key: 'B', text: 'Hanya untuk membuang-buang waktu' },
        { key: 'C', text: 'Karena diwajibkan oleh aturan kantor' },
        { key: 'D', text: 'Supaya tidak perlu melayani pembeli' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 3,
      question: 'Apa kunci utama keberhasilan wirausaha di era digital?',
      options: [
        { key: 'A', text: 'Adaptif terhadap teknologi dan berorientasi pada kepuasan pelanggan' },
        { key: 'B', text: 'Menolak semua bentuk pembayaran elektronik' },
        { key: 'C', text: 'Menutup diri dari kritik dan masukan konsumen' },
        { key: 'D', text: 'Mengabaikan pencatatan laporan keuangan' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 4,
      question: 'Dalam manajemen waktu usaha, hal apa yang harus diprioritaskan?',
      options: [
        { key: 'A', text: 'Kegiatan yang memberikan dampak nilai langsung ke pelanggan dan pertumbuhan produk' },
        { key: 'B', text: 'Mendebat kompetitor di media sosial' },
        { key: 'C', text: 'Tidur seharian saat jam kerja operasional' },
        { key: 'D', text: 'Menunda pesanan pembeli' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 5,
      question: 'Berapa skor minimum yang harus diraih untuk lulus sertifikasi mikro kredensial ini?',
      options: [
        { key: 'A', text: '70 dari 100' },
        { key: 'B', text: '10 dari 100' },
        { key: 'C', text: '1000 dari 100' },
        { key: 'D', text: '0 dari 100' },
      ],
      correctAnswer: 'A',
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// HALAMAN UTAMA RUANG BELAJAR & KUIS INTERAKTIF
// ═════════════════════════════════════════════════════════════════════════════
export default function StudyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = (params?.id as string) || '';

  const { data: enrollmentResponse, isLoading, refetch } = useGetEnrollmentById(enrollmentId);
  const completeMutation = useCompleteEnrollment();

  const enrollment = (enrollmentResponse as any)?.data || enrollmentResponse;
  const courseSlug = enrollment?.kursus?.slug || '';
  const kursusId = enrollment?.kursusId || enrollment?.kursus?.id || '';

  const { data: dbModules } = useGetModulesByKursus(kursusId);
  const { data: dbQuizzes } = useGetQuizzesByKursus(kursusId);

  // Dapatkan silabus dan kuis yang cocok (prioritas: data database dari admin, fallback: template terkurasi)
  const courseData = useMemo(() => {
    let modules = COURSE_MATERIALS[courseSlug]?.modules || FALLBACK_MATERIAL.modules;
    if (dbModules && dbModules.length > 0) {
      modules = dbModules.map((m, idx) => ({
        id: m.id || `modul-${idx + 1}`,
        title: m.title,
        content: m.content.split('\n\n').filter(Boolean),
        keyTakeaway: `Pahami konsep ${m.title} dan terapkan pada operasional usaha Anda.`,
        fileUrl: m.fileUrl,
        videoUrl: m.videoUrl,
      }));
    }

    let quiz = COURSE_MATERIALS[courseSlug]?.quiz || FALLBACK_MATERIAL.quiz;
    if (dbQuizzes && dbQuizzes.length > 0) {
      const optionKeys = ['A', 'B', 'C', 'D'];
      quiz = dbQuizzes.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options.map((optText, oIdx) => ({
          key: optionKeys[oIdx] || `${oIdx + 1}`,
          text: optText,
        })),
        correctAnswer: optionKeys[q.correctAnswer] || 'A',
      }));
    }

    return { modules, quiz };
  }, [courseSlug, dbModules, dbQuizzes]);

  const [activeTab, setActiveTab] = useState<string>('modul-1');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isPassed, setIsPassed] = useState(false);

  const totalModules = courseData.modules.length;
  const progressPercent = Math.round((completedModules.length / Math.max(1, totalModules)) * 100);

  const handleNextModule = (currentId: string, nextId?: string) => {
    setCompletedModules((prev) => Array.from(new Set([...prev, currentId])));
    if (nextId) {
      setActiveTab(nextId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = courseData.quiz.length;

  const handleSelectAnswer = (questionId: number, optionKey: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitQuiz = async () => {
    if (answeredCount < totalQuestions) {
      toast.error(`Mohon jawab semua soal terlebih dahulu (${answeredCount}/${totalQuestions} terjawab)`);
      return;
    }

    // Hitung score
    let correctCount = 0;
    courseData.quiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;

    try {
      await completeMutation.mutateAsync({
        id: enrollmentId,
        score,
      });

      setQuizScore(score);
      setIsPassed(passed);
      setResultModalOpen(true);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan hasil ujian');
    }
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setResultModalOpen(false);
    setActiveTab('quiz');
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500">Menyiapkan ruang belajar...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-4 max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Kursus Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500">
          Data pendaftaran kursus tidak valid atau telah dihapus.
        </p>
        <Link href="/dashboard/mikro-kredensial">
          <Button variant="primary">Kembali ke Mikro Kredensial</Button>
        </Link>
      </div>
    );
  }

  const alreadyCompleted = enrollment.status === 'COMPLETED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/mikro-kredensial">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs font-semibold">
                Mikro Kredensial
              </Badge>
              {alreadyCompleted && (
                <Badge className="bg-green-100 text-green-800 border-0 text-xs flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lulus (Skor: {enrollment.score}/100)
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              {enrollment.kursus?.title}
            </h1>
          </div>
        </div>

        {alreadyCompleted && enrollment.certificate && (
          <Link href="/dashboard/certificates/my">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
              <Award className="w-4 h-4 mr-1.5" />
              Lihat Sertifikat Saya
            </Button>
          </Link>
        )}
      </div>

      {/* Main Grid: Sidebar Navigator + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Navigation */}
        <div className="lg:col-span-1 space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs h-fit">
          <div className="px-2 pt-1 pb-2 border-b border-gray-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Progres Belajar</span>
              <span className="text-emerald-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              {completedModules.length} dari {totalModules} materi selesai dibaca
            </p>
          </div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 pt-1">
            Daftar Modul
          </h3>

          <div className="space-y-1.5">
            {courseData.modules.map((m, idx) => {
              const isActive = activeTab === m.id;
              const isCompleted = completedModules.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isActive
                        ? 'bg-white text-emerald-700'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isCompleted && !isActive ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="truncate flex-1">{m.title.split(':')[0]}</span>
                  {m.fileUrl && (
                    <span className="text-[10px] opacity-75">PDF</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Ujian Akhir */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                activeTab === 'quiz'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100/70'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  activeTab === 'quiz' ? 'bg-white text-amber-700' : 'bg-amber-200 text-amber-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold flex-1">Kuis Asesmen Kelulusan</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'quiz' ? (
            /* ─── TAMPILAN KUIS INTERAKTIF ───────────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Evaluasi Kompetensi Akhir
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Kuis Sertifikasi: {enrollment.kursus?.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Jawab seluruh {totalQuestions} pertanyaan pilihan ganda. Raih skor minimal <strong>70%</strong> untuk lulus dan menerbitkan sertifikat digital resmi.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-400 block font-medium">Progress Soal</span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {answeredCount} / {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Daftar Soal Pilihan Ganda */}
              <div className="space-y-8">
                {courseData.quiz.map((q, qIndex) => {
                  const selectedKey = userAnswers[q.id];
                  return (
                    <div key={q.id} className="space-y-3 pt-2">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 pl-9">
                        {q.options.map((opt) => {
                          const isSelected = selectedKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleSelectAnswer(q.id, opt.key)}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-500'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {opt.key}
                              </div>
                              <span className="flex-1">{opt.text}</span>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {answeredCount === totalQuestions
                    ? 'Semua soal telah dijawab, silakan kumpulkan jawaban Anda.'
                    : `Masih ada ${totalQuestions - answeredCount} soal yang belum dijawab.`}
                </p>

                <Button
                  onClick={handleSubmitQuiz}
                  disabled={completeMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5"
                >
                  {completeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Kumpulkan &amp; Lihat Hasil Ujian
                </Button>
              </div>
            </div>
          ) : (
            /* ─── TAMPILAN MATERI PEMBELAJARAN ──────────────────────────────── */
            (() => {
              const currentMod = courseData.modules.find((m) => m.id === activeTab) || courseData.modules[0];
              const currentIndex = courseData.modules.findIndex((m) => m.id === currentMod.id);
              const hasNextMod = currentIndex < courseData.modules.length - 1;

              return (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-10 space-y-8">
                  <div className="space-y-2 border-b border-gray-100 pb-5">
                    <Badge className="bg-emerald-50 text-emerald-800 border-0 text-xs">
                      Modul Pembelajaran {currentIndex + 1}
                    </Badge>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {currentMod.title}
                    </h2>
                  </div>

                  {/* TAMPILAN MATERI TEKS */}
                  <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                    {currentMod.content.map((paragraph, pIdx) => (
                      <div key={pIdx} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <p>{paragraph}</p>
                      </div>
                    ))}
                  </div>

                  {/* EMBED VIDEO JIKA TERSEDIA */}
                  {currentMod.videoUrl && (
                    <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm">
                        <Video className="w-4 h-4 text-blue-600" />
                        Video Pembelajaran Tambahan
                      </div>
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black">
                        <iframe
                          src={getEmbedUrl(currentMod.videoUrl)}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`Video ${currentMod.title}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* DOKUMEN PDF JIKA TERSEDIA */}
                  {currentMod.fileUrl && (
                    <div className="border border-red-200 bg-red-50/30 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Dokumen Materi & Slide Presentasi (PDF)
                            </h4>
                            <p className="text-xs text-gray-500">
                              Pelajari dokumen panduan ini langsung di bawah atau unduh sebagai arsip.
                            </p>
                          </div>
                        </div>
                        <a
                          href={getSafeStorageUrl(currentMod.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 px-3.5 py-2 rounded-lg shadow-xs shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka Dokumen Penuh / Unduh
                        </a>
                      </div>

                      {/* PDF Viewer Iframe */}
                      <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">
                        <iframe
                          src={getSafeStorageUrl(currentMod.fileUrl)}
                          className="w-full h-[550px] border-0"
                          title={`Dokumen ${currentMod.title}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Key Takeaway Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Poin Inti Pembelajaran:
                    </div>
                    <p className="text-sm font-semibold text-emerald-950 italic">
                      &ldquo;{currentMod.keyTakeaway}&rdquo;
                    </p>
                  </div>

                  {/* Navigation Buttons (Dicoding-Style) */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    {currentIndex > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab(courseData.modules[currentIndex - 1].id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                        Modul Sebelumnya
                      </Button>
                    ) : <div />}

                    {hasNextMod ? (
                      <Button
                        onClick={() => handleNextModule(currentMod.id, courseData.modules[currentIndex + 1].id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        Tandai Selesai & Lanjut
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleNextModule(currentMod.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                      >
                        Selesai Materi & Mulai Ujian Akhir
                        <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* MODAL HASIL KELULUSAN KUIS */}
      <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <DialogContent className="max-w-md text-center p-8">
          <DialogHeader>
            <div className="mx-auto mb-2">
              {isPassed ? (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
                  <Award className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8" />
                </div>
              )}
            </div>

            <DialogTitle className="text-2xl font-extrabold text-gray-900">
              {isPassed ? 'Selamat, Anda Lulus!' : 'Belum Mencapai Nilai Kelulusan'}
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              {isPassed
                ? 'Anda telah berhasil menyelesaikan evaluasi dan meraih kompetensi resmi IBISTEK UTY.'
                : 'Ambang batas kelulusan sertifikasi adalah minimal 70 dari 100.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="text-4xl font-extrabold text-gray-900">
              <span className={isPassed ? 'text-emerald-600' : 'text-amber-600'}>
                {quizScore}
              </span>
              <span className="text-gray-400 text-2xl font-normal"> / 100</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isPassed
                ? 'Sertifikat Digital resmi telah otomatis diterbitkan oleh sistem.'
                : 'Jangan berkecil hati, Anda dapat mengulangi kuis ini kapan saja.'}
            </p>
          </div>

          <DialogFooter className="sm:justify-center flex-col sm:flex-row gap-2">
            {isPassed ? (
              <Link href="/dashboard/certificates/my" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <Award className="w-4 h-4 mr-2" />
                  Klaim &amp; Lihat Sertifikat
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleRetakeQuiz}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Ujian Lagi
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
