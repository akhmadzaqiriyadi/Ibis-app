export const CONTENT = {
  nav: {
    image: "/images/logos/brand.png",
    links: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Our Team", href: "#team" },
      { label: "Programs", href: "#programs" },
      { label: "Updates", href: "#updates" },
      { label: "Partners", href: "#partners" },
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
      description:
        "Inkubasi bisnis adalah program pembinaan, pendampingan, dan pengembangan terstruktur bagi usaha rintisan. Program inkubasi bisnis di IBISTEK UTY diselenggarakan secara periodik bagi sejumlah unit bisnis yang terpilih untuk diinkubasi. Ayo daftarkan bisnismu untuk diinkubasi!",
      cta: "Daftar Sekarang",
      href: "/auth/register?program=inkubasi",
      requiresAuth: true,
    },
    {
      id: "konsultasi",
      title: "Konsultasi Bisnis",
      description:
        "Konsultasi bisnis adalah layanan konsultasi dengan mentor atau praktisi untuk menyelesaikan problem-problem yang dihadapi pelaku bisnis secara gratis. Pendaftar dapat mengajukan layanan konsultasi bisnis ke IBISTEK UTY. Selanjutnya akan dijadwalkan waktu untuk berkonsultasi langsung dengan mentor atau praktisi yang sesuai. Ayo konsultasikan problem bisnismu.",
      cta: "Jadwalkan Konsultasi",
      href: "/auth/register?program=konsultasi",
      requiresAuth: true,
    },
    {
      id: "kredensial",
      title: "Kredensial Mikro",
      description:
        "Kredensial Mikro adalah program pelatihan dan sertifikasi jangka pendek yang dirancang untuk meningkatkan pengetahuan dan keterampilan berwirausaha secara cepat, relevan dengan kebutuhan dunia usaha, dan diakui secara formal. Ayo ikuti kelas kredensial mikro!",
      cta: "Ikuti Sekarang",
      href: "/auth/register?program=kredensial",
      requiresAuth: true,
    },
    {
      id: "event",
      title: "Event Bisnis",
      description:
        "Ikuti berbagai kegiatan sosialisasi, seminar, dan workshop seputar kewirausahaan. Info terbaru: Sosialisasi P2MW 2026.",
      cta: "Lihat Detail",
      href: "#updates",
      requiresAuth: false,
    },
  ],
  updates: Array(4).fill({
    title: "Kegiatan IBISTEK Terbaru",
    date: "29 Jan 2026",
    summary: "Dokumentasi kegiatan workshop kewirausahaan bersama mahasiswa UTY.",
    image: "/images/updates/placeholder.jpg",
  }),
  partners: {
    internal: ["Fastlab", "USH", "Pusat Karir"],
    startups: ["Hubungin", "Aruna"],
  },
  contact: {
    address:
      "Gedung UTY Creative Hub, Jl. Siliwangi (Ringroad Utara), Jombor, Sleman, D.I. Yogyakarta 55285",
    email: "ibistek@uty.ac.id",
    instagram: "@ibistek.uty",
  },
};
