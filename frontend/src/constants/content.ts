export const CONTENT = {
  nav: {
    image: "/images/logos/brand.webp",
    links: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Programs", href: "#programs" },
      { label: "Our Team", href: "#team" },
      { label: "Partners", href: "#partners" },
      { label: "Updates", href: "#updates" },
      { label: "Contact Us", href: "#contact" },
    ],
    cta: "Sign In",
  },
  hero: {
    headline: "Mewujudkan Inovasi, Mengakselerasi Bisnis, Menciptakan Dampak",
    subheadline:
      "Selamat datang di Inkubator Bisnis dan Teknologi UTY, ruang kolaborasi untuk mewujudkan inovasi, memperkuat kapasitas usaha, dan mendorong lahirnya wirausaha berbasis teknologi yang berdampak dan berkelanjutan.",
    cta: "Jelajahi Program",
  },
  about: {
    title: "About Us",
    vision:
      "Menjadi inkubator bisnis dan teknologi yang mampu mendorong inovasi dan kewirausahaan serta berkontribusi pada Pembangunan ekonomi masyarakat.",
    mission: [
      {
        text: "Mendorong lahirnya inovasi berbasis teknologi dan kebutuhan masyarakat melalui proses inkubasi yang terstruktur, aplikatif, dan berkelanjutan.",
      },
      {
        text: "Menumbuhkan jiwa kewirausahaan yang mandiri, kreatif, dan berdaya saing, khususnya bagi mahasiswa, alumni, dan pelaku UMKM.",
      },
      {
        text: "Menyediakan pendampingan, fasilitas, dan jejaring strategis untuk mendukung pengembangan usaha rintisan dari tahap ide hingga komersialisasi.",
      },
      {
        text: "Berkontribusi aktif terhadap pembangunan ekonomi masyarakat melalui penciptaan usaha produktif, peningkatan kapasitas pelaku usaha, dan penguatan ekosistem kewirausahaan local.",
      },
    ],
    team: {
      leaders: [
        {
          name: "Ms. Hendriawan A, Ph.D",
          role: "Wakil Rektor IV UTY bidang Kreativitas, Kewirausahaan dan Pengabdian Masyarakat",
          image: "/images/team/hendriawan.jpg", // Placeholder
        },
        {
          name: "Adi Wibawa, M.A.",
          role: "Kepala Bidang Kewirausahaan UTY",
          image: "/images/team/adi-wibawa.jpg", // Placeholder
        },
      ],
      staff: Array(6).fill({
        name: "Staff Name",
        role: "Staff Division",
        image: "/images/team/placeholder.jpg",
      }),
      mentors: Array(4).fill({
        name: "Mentor Name",
        role: "Business Mentor",
        image: "/images/team/placeholder.jpg",
      }),
    },
  },
  programs: [
    {
      id: "inkubasi",
      title: "Inkubasi Bisnis",
      icon: "/svgs/incube.svg",
      description:
        "Inkubasi bisnis adalah program pembinaan, pendampingan, dan pengembangan terstruktur bagi usaha rintisan. Program inkubasi bisnis di IBISTEK UTY diselenggarakan secara periodik bagi sejumlah unit bisnis yang terpilih untuk diinkubasi.",
      cta: "Daftar Sekarang",
      href: "/auth/register?program=inkubasi",
      requiresAuth: true,
    },
    {
      id: "konsultasi",
      title: "Konsultasi bisnis",
      icon: "/svgs/like-dislike.svg",
      description:
        "Konsultasi bisnis adalah layanan konsultasi dengan mentor atau praktisi untuk menyelesaikan problem-problem yang dihadapi pelaku bisnis secara gratis. Pendaftar dapat mengajukan layanan konsultasi bisnis ke IBISTEK UTY. Selanjutnya akan dijadwalkan waktu untuk berkonsultasi langsung dengan mentor atau praktisi yang sesuai. Ayo konsultasikan problem bisnismu.",
      cta: "Daftar Sekarang",
      href: "/auth/register?program=konsultasi",
      requiresAuth: true,
    },
    {
      id: "kredensial",
      title: "Kredensial Mikro",
      icon: "/svgs/vuesax.svg",
      description:
        "Kredensial Mikro adalah program pelatihan dan sertifikasi jangka pendek yang dirancang untuk meningkatkan pengetahuan dan keterampilan berwirausaha secara cepat, relevan dengan kebutuhan dunia usaha, dan diakui secara formal.",
      cta: "Daftar Sekarang",
      href: "/auth/register?program=kredensial",
      requiresAuth: true,
    },
  ],
  team: {
    title: "Team Kami",
    members: [
      {
        division: "Public Relations",
        name: "Fransisca Laksmi",
        prodi: "Ilmu Komunikasi 2024",
        image: "/images/assets/member-2.webp",
        instagram: "#",
        linkedin: "#",
      },
      {
        division: "DVE",
        name: "Ayudya Priagus",
        prodi: "Perencanaan Wilayah dan Kota 2024",
        image: "/images/assets/member-1.webp",
        instagram: "#",
        linkedin: "#",
      },
      {
        division: "Social Media Management",
        name: "Adam Prasetya Deva",
        prodi: "Manajemen 2023",
        image: "/images/assets/member-3.webp",
        instagram: "#",
        linkedin: "#",
      },
      {
        division: "Web Developer",
        name: "Nehemia Hasbadhana",
        prodi: "Informatika 2023",
        image: "/images/assets/member-4.webp",
        instagram: "#",
        linkedin: "#",
      },
      {
        division: "Public Relations",
        name: "Fransisca Laksmi",
        prodi: "Ilmu Komunikasi 2024",
        image: "/images/assets/member-2.webp",
        instagram: "#",
        linkedin: "#",
      },
      {
        division: "DVE",
        name: "Ayudya Priagus",
        prodi: "Perencanaan Wilayah dan Kota 2024",
        image: "/images/assets/member-1.webp",
        instagram: "#",
        linkedin: "#",
      },
      {
        division: "Social Media Management",
        name: "Adam Prasetya Deva",
        prodi: "Manajemen 2023",
        image: "/images/assets/member-3.webp",
        instagram: "#",
        linkedin: "#",
      },
    ],
    cta: "Selengkapnya",
  },
  partners: {
    title: "Kerjasama IBISTEK",
    description: "IBISTEK memiliki program kerjasama dengan beberapa komunitas dan startup",
    logo: "/images/assets/partners-1.webp",
    count: 15,
  },
  updates: {
    title: "Event Terbaru",
    events: [
      {
        date: "4-5 Desember 2025",
        title: "UTY Growpath Season 3",
        description: "GROWPATH EXPO SEASON 3 Siap memamerkan hasil akhir yuk datang ke Growpath Expo Season 3 yang akan di adakan di Kampus UTY 3 4-5 Desember 2025",
        image: "/images/assets/news-1.webp",
      },
      {
        date: "30 Januari 2026",
        title: "Sosialisasi P2MW 2026",
        description: "Halo Young Entrepreneur\nMau usahamu Tumbuh ya? Ingin tau? Ayo raih keinginan ingin dan mimpi! Temang, semua ada jalannya karena kesempatan itu harus di gapai dengan semangat!",
        image: "/images/assets/news-2.webp",
      },
      {
        date: "4-5 Desember 2025",
        title: "UTY Growpath Season 3",
        description: "GROWPATH EXPO SEASON 3\nSiap memamerkan hasil akhir yuk?\nDatang ke Growpath Expo Season 3 yang akan di adakan di Kampus UTY 3 4-5 Desember 2025",
        image: "/images/assets/news-1.webp",
      },
      {
        date: "30 Januari 2026",
        title: "Sosialisasi P2MW 2026",
        description: "Halo Young Entrepreneur\nMau usahamu Tumbuh ya? Ingin tau? Ayo raih keinginan ingin dan mimpi! Temang, semua ada jalannya karena kesempatan itu harus di gapai dengan semangat!",
        image: "/images/assets/news-2.webp",
      },
    ],
    cta: "Selengkapnya",
    instagram: {
      title: "Kenal lebih dekat dengan IBISTEK",
      description: "Kunjungi media sosial IBISTEK UTY untuk mendapatkan informasi terbaru",
      handle: "@ibistek.uty",
      logo: "/images/logos/brand-raw.webp",
      stats: {
        posts: 163,
        followers: "1.3k",
      },
      feedImages: [
        "/images/assets/feed-1.webp",
        "/images/assets/feed-2.webp",
        "/images/assets/feed-3.webp",
        "/images/assets/feed-4.webp",
      ],
      socialLinks: [
        {
          platform: "Instagram",
          handle: "@ibistek.uty",
          url: "https://instagram.com/ibistek.uty",
          icon: "instagram",
        },
        {
          platform: "Twitter",
          handle: "@ibistek.uty",
          url: "https://twitter.com/ibistek.uty",
          icon: "twitter",
        },
        {
          platform: "YouTube",
          handle: "Ibistek UTY",
          url: "https://youtube.com/@ibistekuty",
          icon: "youtube",
        },
      ],
    },
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Temukan jawaban untuk pertanyaan yang sering diajukan",
    image: "/images/assets/about-us-right.webp",
    items: [
      {
        question: "Bagaimana cara menjadi anggota IBISTEK?",
        answer:
          "Mendaftar pada google-form melalui website ini ataupun link.tree pada bio instagram resmi kami @ibistek.uty, lalu memilih divisi yang diinginkan. Jangan lupa daftar karena kuota terbatas dan hanya oprec beberapa kali se tahun.",
      },
      {
        question: "Di mana lokasi basecamp IBISTEK?",
        answer:
          "Basecamp IBISTEK berlokasi di Gedung Fakultas Sains dan Teknologi, Universitas Teknologi Yogyakarta. Kami biasanya berkumpul di ruang laboratorium komputer atau ruang organisasi mahasiswa.",
      },
      {
        question: "Kapan basecamp buka dan tutup?",
        answer:
          "Basecamp IBISTEK buka setiap hari Senin hingga Jumat pukul 08.00 - 17.00 WIB. Untuk hari Sabtu dan Minggu, basecamp buka sesuai dengan jadwal kegiatan atau event yang sedang berlangsung.",
      },
      {
        question:
          "Bagaimana cara mengikuti lomba, mencari anggota team, dan mencari dosen pembimbing?",
        answer:
          "Untuk mengikuti lomba, kamu bisa pantau informasi lomba yang kami share di media sosial. Jika butuh tim, kamu bisa bergabung dengan komunitas IBISTEK dan mencari partner di sana. Untuk dosen pembimbing, kami akan membantu menghubungkan dengan dosen yang sesuai dengan bidang lomba.",
      },
      {
        question:
          "Saya masih binggung dalam pengembangan karya saya, apa saya bisa melakukan konsultasi?",
        answer:
          "Tentu saja! IBISTEK menyediakan program mentoring dan konsultasi untuk anggota yang ingin mengembangkan karya atau project mereka. Kamu bisa menghubungi koordinator divisi terkait atau langsung datang ke basecamp untuk konsultasi.",
      },
      {
        question: "Bagaimana cara mengajukan dana riset?",
        answer:
          "Untuk mengajukan dana riset, kamu perlu menyiapkan proposal riset yang lengkap dan mengajukannya melalui sistem yang telah ditentukan oleh universitas. Tim IBISTEK dapat membantu dalam proses penyusunan proposal dan pengajuan dana riset.",
      },
      {
        question:
          "Jika saya pihak eksternal, bagaimana cara melakukan kolaborasi dengan Infinite?",
        answer:
          "Kami sangat terbuka untuk kolaborasi dengan pihak eksternal! Silakan hubungi kami melalui email resmi atau DM Instagram @ibistek.uty. Sampaikan proposal kolaborasi atau ide kerjasama yang ingin dilakukan, dan tim kami akan segera merespons.",
      },
    ],
  },
  contact: {
    address:
      "Gedung UTY Creative Hub, Jl. Siliwangi (Ringroad Utara), Jombor, Sleman, D.I. Yogyakarta 55285",
    email: "ibistek@uty.ac.id",
    whatsapp: "+62877-1234-1234",
    instagram: "@ibistek.uty",
  },
};
