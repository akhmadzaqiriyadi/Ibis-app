# PROJECT REQUIREMENTS DOCUMENT (PRD)

**Project Name:** IBISTEK UTY Landing Page

**Version:** 1.0

**Status:** Ready for Development

## 1. Executive Summary

Pembuatan Landing Page modern untuk **Inkubator Bisnis dan Teknologi (IBISTEK) UTY**. Website ini berfungsi sebagai gerbang utama informasi mengenai program inkubasi, konsultasi bisnis, dan kredensial mikro.
**Key Constraint:** Platform ini harus terintegrasi dengan konsep ekosistem UTY Creative Hub (UCH), di mana fitur utama (Inkubasi, Konsultasi, Kredensial) memerlukan autentikasi user (Login/Register).

## 2. Technical Stack Requirements

Project ini wajib menggunakan stack teknologi terkini untuk menjamin performa, SEO, dan kemudahan maintenance.

- **Framework:** Next.js 16+ (App Router).
- **Language:** TypeScript (Strict Mode).
- **Styling:** Tailwind CSS (Utility-first approach).
- **Icons:** Lucide React (Modern & Lightweight).
- **Font:** Inter atau Plus Jakarta Sans (Clean/Professional).
- **State Management:** React Context / Zustand (jika diperlukan untuk Auth state simple).

## 3. Architecture Principles (MANDATORY)

### A. DRY (Don't Repeat Yourself)

- **Dilarang Hardcode Text:** Semua konten teks (Visi, Misi, Deskripsi Program, List Team) **TIDAK BOLEH** ditulis langsung di dalam file komponen (`.tsx`).
- **Centralized Data:** Semua data statis harus disimpan dalam folder terpisah (misal: `src/constants/content.ts`). Komponen UI hanya bertugas me-render data tersebut via `.map()`.

### B. Component Reusability (Atomic Design)

Pecah UI menjadi bagian-bagian kecil yang bisa dipakai berulang kali. Jangan membuat komponen raksasa.

- **Atoms:** Button, Badge, Input, SectionTitle, Container.
- **Molecules:** ProgramCard, TeamMemberCard, InfoItem.
- **Organisms:** Navbar, Footer, HeroSection, TeamSection.

### C. Folder Structure (Scalable)

Struktur folder harus memisahkan antara **Routing**, **UI Logic**, dan **Data**.

```
src/
├── app/                  # Next.js App Router (Pages)
│   ├── layout.tsx        # Root Layout (Include Navbar & Footer)
│   ├── page.tsx          # Main Landing Page (Composition of Sections)
│   └── (auth)/           # Route Group untuk Auth (Login/Register)
├── components/
│   ├── ui/               # Reusable Atoms (Button, Container, etc)
│   ├── layout/           # Navbar, Footer, Mobile Menu
│   └── sections/         # Page Blocks (Hero, About, Programs, etc)
├── constants/            # DATA CENTER (All Text from PDF goes here)
├── lib/                  # Utility functions (cn, formatter)
└── types/                # TypeScript Interfaces

```

## 4. UI/UX & Content Specifications

### A. Navigation (Navbar)

- **Logo:** IBISTEK UTY.
- **Menu:** Home, About Us, Programs, Updates, Contact Us.
- **Action:** Tombol "Login/Register" (Primary Button) - Karena fitur utama butuh akses akun.

### B. Hero Section (Home)

- **Headline:** "Mewujudkan Inovasi, Mengakselerasi Bisnis, Menciptakan Dampak".
- **Sub-headline:** (Ambil dari PDF: "Selamat datang di Inkubator...").
- **CTA:** Tombol "Jelajahi Program" (Scroll ke section Programs).
- **Visual:** Clean, modern, academic but startup-friendly.

### C. About Us Section

- **Visi:** Display text centered.
- **Misi:** Grid layout (4 points). Gunakan icon untuk representasi visual setiap poin misi.
- **Team:**
    - **Leaders:** Tampilkan Ms. Hendriawan A & Adi Wibawa dengan foto lebih besar/menonjol.
    - **Staff/Mentors:** Grid layout untuk staff divisi dan mentor. Gunakan placeholder jika foto belum ada.

### D. Programs Section (Core Feature)

Gunakan **Card Component** yang seragam untuk 4 item ini.

1. **Inkubasi Bisnis:** (CTA: "Daftar Sekarang" -> Redirect ke Login/Register).
2. **Konsultasi Bisnis:** (CTA: "Jadwalkan Konsultasi" -> Redirect ke Login/Register).
3. **Kredensial Mikro:** (CTA: "Ikuti Sekarang" -> Redirect ke Login/Register).
4. **Event Bisnis:** Info sosialisasi P2MW.

*Note:* Tambahkan visual cue (icon gembok atau tooltip) yang menandakan user harus login untuk fitur 1, 2, dan 3.

### E. Updates & Partners

- **Updates:** Grid layout menampilkan berita/kegiatan terbaru (Placeholder data dari IG).
- **Partners:** Logo carousel/grid untuk unit internal (Fastlab, USH) dan Startups (Hubungin, Aruna).

### F. Footer (Contact)

- **Address:** Gedung UTY Creative Hub, Jl. Siliwangi.
- **Socials:** Link aktif ke Instagram & Email.

## 5. Development Phases

1. **Setup & config:** Install Next.js, Tailwind, setup folder structure.
2. **Data Migration:** Pindahkan semua teks **DATA ISI WEBSITE** ke file `src/constants/index.ts`.
3. **Component Library:** Buat komponen dasar (`Button`, `Card`, `Container`).
4. **Section Assembly:** Rakit halaman Home section per section.
5. **Responsive Testing:** Pastikan tampilan aman di Mobile (Hamburger menu) dan Tablet.

## 6. Success Metrics

- Codebase bersih (No Redundancy).
- Data terpusat (Mudah diedit oleh non-programmer via file constants).
- Responsive 100% di semua device.
- Loading speed optimal (Target Lighthouse Score > 90).

**DATA ISI WEBSITE:**
First page tabs: Home, About Us, Programs, Updates, Contact US

**Home**: welcome notes

**About Us**: Profile

**Programs**: Inkubasi Bisnis, Konsultasi Bisnis, Event Bisnis, Kredensial Mikro

**Updates**: berita kegiatan, info lomba, info seminar, dll

**Partners & Startups**: list partner dan startup binaan

**Contact Us**: Alamat, email, IG

Inkubasi, konsultasi bisnis dan kredensial harus bikin akun terverifikasi (kaya booking UCH)

Rincian per tab:

**Home**:

“Mewujudkan Inovasi, Mengakselerasi Bisnis, Menciptakan Dampak”

“Selamat datang di Inkubator Bisnis dan Teknologi UTY, ruang kolaborasi untuk mewujudkan inovasi, memperkuat kapasitas usaha, dan mendorong lahirnya wirausaha berbasis teknologi yang berdampak dan berkelanjutan.”

**About Us:**

**Visi:**

Menjadi inkubator bisnis dan teknologi yang mampu mendorong inovasi dan kewirausahaan serta berkontribusi pada Pembangunan ekonomi masyarakat.

**Misi:**

1. **Mendorong lahirnya inovasi berbasis teknologi dan kebutuhan masyarakat** melalui proses inkubasi yang terstruktur, aplikatif, dan berkelanjutan.
2. **Menumbuhkan jiwa kewirausahaan yang mandiri, kreatif, dan berdaya saing**, khususnya bagi mahasiswa, alumni, dan pelaku UMKM.
3. **Menyediakan pendampingan, fasilitas, dan jejaring strategis** untuk mendukung pengembangan usaha rintisan dari tahap ide hingga komersialisasi.
4. **Berkontribusi aktif terhadap pembangunan ekonomi masyarakat** melalui penciptaan usaha produktif, peningkatan kapasitas pelaku usaha, dan penguatan ekosistem kewirausahaan local

**Our team:**

| Pembina | Kepala |
| --- | --- |
|  |  |
| MS. Hendriawan A, Ph.D
Wakil Rektor IV UTY bidang Kreativitas, Kewirausahaan dan Pengabdian Masyarakat | Adi Wibawa, M.A.
Kepala Bidang Kewirausahaan UTY
 |

(anak-anak IBIS-minta list comisoon)

| Staff div. | Staff div. | Staff div. | Staff div. | Staff div. | Staff div. |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
| nama | nama | nama | nama | nama | nama |

(isi dummy kek gini dl aja ya)

| Mentor | Mentor | Mentor | Mentor |
| --- | --- | --- | --- |
|  |  |  |  |
| nama | nama | nama | nama |

**Programs:**

**Inkubasi bisnis:**

Inkubasi bisnis adalah program pembinaan, pendampingan, dan pengembangan terstruktur bagi usaha rintisan. Program inkubasi bisnis di IBISTEK UTY diselenggarakan secara periodik bagi sejumlah unit bisnis yang terpilih untuk diinkubasi. Ayo daftarkan bisnismu untuk diinkubasi! daftar sekarang

**Konsultasi bisnis:**

Konsultasi bisnis adalah layanan konsultasi dengan mentor atau praktisi untuk menyelesaikan problem-problem yang dihadapi pelaku bisnis secara gratis.  Pendaftar dapat mengajukan layanan konsultasi bisnis ke IBISTEK UTY. Selanjutnya akan dijadwalkan waktu untuk berkonsultasi langsung dengan mentor atau praktisi yang sesuai. Ayo konsultasikan problem bisnismu jadwalkan konsultasi

**Kredensial Mikro:**

Kredensial Mikro adalah program pelatihan dan sertifikasi jangka pendek yang dirancang untuk meningkatkan pengetahuan dan keterampilan berwirausaha secara cepat, relevan dengan kebutuhan dunia usaha, dan diakui secara formal. Ayo ikuti kelas kredensial mikro!  ikuti sekarang

**Event bisnis:**

Masukin info sosialisasi P2MW 2026 dulu aja

**Updates:**

Ambil aja beberapa postingan kegiatan ibis terbaru di IG Ibistek

**Partners & Startups:**

**Partners:**

(taro aja logo-logo unit-unit di UCH dulu: Fastlab, USH dll)

**Startups:**

(taro aja logo hubungin’s sm aruna dl)

**Contact Us:**

Alamat:

Gedung UTY Creative Hub, Jl. Siliwangi (Ringroad Utara), Jombor, Sleman, D.I. Yogyakarta 55285

Email: [ibistek@uty.ac.id](mailto:ibistek@uty.ac.id)

Instagram: @ibistek.uty