-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'MEMBER', 'USER', 'MENTOR', 'MAHASISWA', 'UMKM');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('MAHASISWA', 'UMKM');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlatformPenjualan" AS ENUM ('ONLINE', 'OFFLINE', 'KEDUANYA');

-- CreateEnum
CREATE TYPE "MetodeKonsultasi" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "InkubasiStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KonsultasiStatus" AS ENUM ('PENDING', 'ASSIGNED', 'MENTOR_CONFIRMED', 'MENTOR_DECLINED', 'MENTOR_TIMEOUT', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MikroKredensialStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('INKUBASI', 'KONSULTASI', 'KREDENSIAL', 'EVENT');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('LEADER', 'STAFF', 'MENTOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('INTERNAL', 'STARTUP', 'CORPORATE', 'GOVERNMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MAHASISWA',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "noWhatsApp" TEXT,
    "npm" TEXT,
    "programStudiId" TEXT,
    "alamatUsaha" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramStudi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "fakultas" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramStudi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriUsaha" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KategoriUsaha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InkubasiPeriod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InkubasiPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InkubasiApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "namaPemilik" TEXT NOT NULL,
    "tahunBerdiri" INTEGER NOT NULL,
    "kategoriUsahaId" TEXT NOT NULL,
    "rataOmsetPerBulan" TEXT NOT NULL,
    "platformPenjualan" "PlatformPenjualan" NOT NULL,
    "uraianProduk" TEXT NOT NULL,
    "kendala" TEXT NOT NULL,
    "harapan" TEXT NOT NULL,
    "status" "InkubasiStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InkubasiApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KonsultasiApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namaPemilik" TEXT NOT NULL,
    "tahunBerdiri" INTEGER NOT NULL,
    "kategoriUsahaId" TEXT NOT NULL,
    "rataOmsetPerBulan" TEXT NOT NULL,
    "platformPenjualan" "PlatformPenjualan" NOT NULL,
    "uraianProduk" TEXT NOT NULL,
    "topikKonsultasi" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "metode" "MetodeKonsultasi" NOT NULL,
    "status" "KonsultasiStatus" NOT NULL DEFAULT 'PENDING',
    "assignedMentorId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "assignedById" TEXT,
    "mentorResponseDeadline" TIMESTAMP(3),
    "mentorConfirmedAt" TIMESTAMP(3),
    "mentorDeclineReason" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "confirmedDate" TIMESTAMP(3),
    "meetingLink" TEXT,
    "meetingLocation" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "laporanMahasiswa" TEXT,
    "laporanSubmittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KonsultasiApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MikroKredensialKursus" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MikroKredensialKursus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MikroKredensialEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kursusId" TEXT NOT NULL,
    "status" "MikroKredensialStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MikroKredensialEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "maxParticipants" INTEGER,
    "registrationUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "image" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Daftar Sekarang',
    "ctaUrl" TEXT,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "type" "TeamType" NOT NULL DEFAULT 'MEMBER',
    "division" TEXT,
    "image" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "batch" INTEGER,
    "prodi" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Update" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT,
    "image" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL DEFAULT 'news',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userType_idx" ON "UserProfile"("userType");

-- CreateIndex
CREATE INDEX "UserProfile_verificationStatus_idx" ON "UserProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramStudi_code_key" ON "ProgramStudi"("code");

-- CreateIndex
CREATE INDEX "ProgramStudi_isActive_idx" ON "ProgramStudi"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriUsaha_name_key" ON "KategoriUsaha"("name");

-- CreateIndex
CREATE INDEX "KategoriUsaha_isActive_idx" ON "KategoriUsaha"("isActive");

-- CreateIndex
CREATE INDEX "InkubasiPeriod_isActive_idx" ON "InkubasiPeriod"("isActive");

-- CreateIndex
CREATE INDEX "InkubasiPeriod_startDate_endDate_idx" ON "InkubasiPeriod"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "InkubasiApplication_userId_idx" ON "InkubasiApplication"("userId");

-- CreateIndex
CREATE INDEX "InkubasiApplication_periodId_idx" ON "InkubasiApplication"("periodId");

-- CreateIndex
CREATE INDEX "InkubasiApplication_status_idx" ON "InkubasiApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InkubasiApplication_userId_periodId_key" ON "InkubasiApplication"("userId", "periodId");

-- CreateIndex
CREATE INDEX "KonsultasiApplication_userId_idx" ON "KonsultasiApplication"("userId");

-- CreateIndex
CREATE INDEX "KonsultasiApplication_assignedMentorId_idx" ON "KonsultasiApplication"("assignedMentorId");

-- CreateIndex
CREATE INDEX "KonsultasiApplication_status_idx" ON "KonsultasiApplication"("status");

-- CreateIndex
CREATE INDEX "KonsultasiApplication_preferredDate_idx" ON "KonsultasiApplication"("preferredDate");

-- CreateIndex
CREATE UNIQUE INDEX "MikroKredensialKursus_slug_key" ON "MikroKredensialKursus"("slug");

-- CreateIndex
CREATE INDEX "MikroKredensialKursus_slug_idx" ON "MikroKredensialKursus"("slug");

-- CreateIndex
CREATE INDEX "MikroKredensialKursus_isActive_idx" ON "MikroKredensialKursus"("isActive");

-- CreateIndex
CREATE INDEX "MikroKredensialEnrollment_status_idx" ON "MikroKredensialEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MikroKredensialEnrollment_userId_kursusId_key" ON "MikroKredensialEnrollment"("userId", "kursusId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_enrollmentId_key" ON "Certificate"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_issuedAt_idx" ON "Certificate"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_slug_idx" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_type_idx" ON "Program"("type");

-- CreateIndex
CREATE INDEX "Program_order_idx" ON "Program"("order");

-- CreateIndex
CREATE INDEX "TeamMember_type_idx" ON "TeamMember"("type");

-- CreateIndex
CREATE INDEX "TeamMember_batch_idx" ON "TeamMember"("batch");

-- CreateIndex
CREATE INDEX "TeamMember_order_idx" ON "TeamMember"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Update_slug_key" ON "Update"("slug");

-- CreateIndex
CREATE INDEX "Update_slug_idx" ON "Update"("slug");

-- CreateIndex
CREATE INDEX "Update_date_idx" ON "Update"("date");

-- CreateIndex
CREATE INDEX "Update_isPublished_idx" ON "Update"("isPublished");

-- CreateIndex
CREATE INDEX "Partner_type_idx" ON "Partner"("type");

-- CreateIndex
CREATE INDEX "Partner_order_idx" ON "Partner"("order");

-- CreateIndex
CREATE INDEX "FAQ_category_idx" ON "FAQ"("category");

-- CreateIndex
CREATE INDEX "FAQ_order_idx" ON "FAQ"("order");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_programStudiId_fkey" FOREIGN KEY ("programStudiId") REFERENCES "ProgramStudi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InkubasiPeriod" ADD CONSTRAINT "InkubasiPeriod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InkubasiApplication" ADD CONSTRAINT "InkubasiApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InkubasiApplication" ADD CONSTRAINT "InkubasiApplication_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "InkubasiPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InkubasiApplication" ADD CONSTRAINT "InkubasiApplication_kategoriUsahaId_fkey" FOREIGN KEY ("kategoriUsahaId") REFERENCES "KategoriUsaha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InkubasiApplication" ADD CONSTRAINT "InkubasiApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonsultasiApplication" ADD CONSTRAINT "KonsultasiApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonsultasiApplication" ADD CONSTRAINT "KonsultasiApplication_kategoriUsahaId_fkey" FOREIGN KEY ("kategoriUsahaId") REFERENCES "KategoriUsaha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonsultasiApplication" ADD CONSTRAINT "KonsultasiApplication_assignedMentorId_fkey" FOREIGN KEY ("assignedMentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonsultasiApplication" ADD CONSTRAINT "KonsultasiApplication_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KonsultasiApplication" ADD CONSTRAINT "KonsultasiApplication_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MikroKredensialEnrollment" ADD CONSTRAINT "MikroKredensialEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MikroKredensialEnrollment" ADD CONSTRAINT "MikroKredensialEnrollment_kursusId_fkey" FOREIGN KEY ("kursusId") REFERENCES "MikroKredensialKursus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "MikroKredensialEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
