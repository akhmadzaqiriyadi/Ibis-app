import { prisma } from '@/config/database';
import { AppError, NotFoundError } from '@/common/errors';
import { MikroKredensialStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class MikroKredensialService {
  // ─── Kursus ─────────────────────────────────────────────

  async getAllKursus(onlyActive = true) {
    return prisma.mikroKredensialKursus.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async getKursusByIdOrSlug(idOrSlug: string) {
    const kursus = await prisma.mikroKredensialKursus.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });
    if (!kursus) throw new NotFoundError('Kursus tidak ditemukan');
    return kursus;
  }

  async getKursusBySlug(slug: string) {
    return this.getKursusByIdOrSlug(slug);
  }

  async createKursus(data: { title: string; slug: string; description: string; duration?: number; thumbnail?: string; order?: number }) {
    const existing = await prisma.mikroKredensialKursus.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError(400, 'Slug kursus sudah digunakan');
    return prisma.mikroKredensialKursus.create({ data: { ...data, isActive: true } });
  }

  async updateKursus(id: string, data: any) {
    const kursus = await prisma.mikroKredensialKursus.findUnique({ where: { id } });
    if (!kursus) throw new NotFoundError('Kursus tidak ditemukan');
    return prisma.mikroKredensialKursus.update({ where: { id }, data });
  }

  async deleteKursus(id: string) {
    return prisma.mikroKredensialKursus.update({ where: { id }, data: { isActive: false } });
  }

  // ─── Enrollment ──────────────────────────────────────────

  async enroll(userId: string, kursusId: string) {
    const kursus = await prisma.mikroKredensialKursus.findUnique({ where: { id: kursusId } });
    if (!kursus || !kursus.isActive) throw new AppError(400, 'Kursus tidak ditemukan atau tidak aktif');

    const existing = await prisma.mikroKredensialEnrollment.findUnique({
      where: { userId_kursusId: { userId, kursusId } },
    });

    if (existing) throw new AppError(400, 'Anda sudah terdaftar di kursus ini');

    return prisma.mikroKredensialEnrollment.create({
      data: { userId, kursusId, status: MikroKredensialStatus.IN_PROGRESS },
      include: { kursus: { select: { title: true } } },
    });
  }

  async getMyEnrollments(userId: string) {
    return prisma.mikroKredensialEnrollment.findMany({
      where: { userId },
      include: {
        kursus: true,
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEnrollmentById(id: string) {
    return prisma.mikroKredensialEnrollment.findUnique({
      where: { id },
      include: {
        kursus: true,
        user: true,
        certificate: true,
      },
    });
  }

  async getAllEnrollments(page = 1, limit = 10, status?: string) {
    const where = status ? { status: status as MikroKredensialStatus } : {};
    
    // Fallback status check specific as Enum type problem on Prisma 7 if not matching types.
    // Assuming status is a valid MikroKredensialStatus if provided.
    
    const [items, total] = await Promise.all([
      prisma.mikroKredensialEnrollment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          kursus: { select: { id: true, title: true } },
          certificate: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mikroKredensialEnrollment.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Complete & Sertifikat ───────────────────────────────

  async completeKursus(enrollmentId: string, score: number) {
    const enrollment = await prisma.mikroKredensialEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { user: true, kursus: true },
    });

    if (!enrollment) throw new NotFoundError('Data enrollment tidak ditemukan');

    const PASSING_GRADE = 70;
    const isPassed = score >= PASSING_GRADE;
    const newStatus = isPassed ? MikroKredensialStatus.COMPLETED : MikroKredensialStatus.FAILED;
    const finalScore = enrollment.score ? Math.max(enrollment.score, score) : score;

    const updated = await prisma.mikroKredensialEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: newStatus,
        score: finalScore,
        completedAt: isPassed ? (enrollment.completedAt || new Date()) : null,
      },
    });

    // Otomatis generate/upsert sertifikat jika lulus
    let certificate = null;
    if (isPassed) {
      certificate = await prisma.certificate.upsert({
        where: { enrollmentId: enrollment.id },
        update: {
          issuedAt: new Date(),
        },
        create: {
          userId: enrollment.userId,
          enrollmentId: enrollment.id,
          certificateNumber: `IBIS/KRED/${new Date().getFullYear()}/${uuidv4().split('-')[0].toUpperCase()}`,
        },
      });
    }

    return { enrollment: updated, certificate };
  }

  async getMyCertificates(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      include: {
        enrollment: {
          include: { kursus: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verifyCertificate(certificateNumber: string) {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: { select: { name: true, email: true } },
        enrollment: { include: { kursus: true } },
      },
    });

    if (!cert) throw new NotFoundError('Sertifikat tidak valid atau tidak ditemukan');
    return cert;
  }

  // ─── Modul Materi ───────────────────────────────────────

  async getModulesByKursusId(kursusId: string) {
    return prisma.mikroKredensialModul.findMany({
      where: { kursusId },
      orderBy: { order: 'asc' },
    });
  }

  async createModule(kursusId: string, data: { title: string; content: string; duration?: number; videoUrl?: string; fileUrl?: string; order?: number }) {
    const kursus = await prisma.mikroKredensialKursus.findUnique({ where: { id: kursusId } });
    if (!kursus) throw new NotFoundError('Kursus tidak ditemukan');

    const highestOrder = await prisma.mikroKredensialModul.findFirst({
      where: { kursusId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = data.order !== undefined ? data.order : (highestOrder?.order ?? -1) + 1;

    return prisma.mikroKredensialModul.create({
      data: {
        kursusId,
        title: data.title,
        content: data.content,
        duration: data.duration,
        videoUrl: data.videoUrl,
        fileUrl: data.fileUrl,
        order,
      },
    });
  }

  async updateModule(id: string, data: { title?: string; content?: string; duration?: number; videoUrl?: string; fileUrl?: string; order?: number }) {
    const modul = await prisma.mikroKredensialModul.findUnique({ where: { id } });
    if (!modul) throw new NotFoundError('Modul tidak ditemukan');
    return prisma.mikroKredensialModul.update({ where: { id }, data });
  }

  async deleteModule(id: string) {
    const modul = await prisma.mikroKredensialModul.findUnique({ where: { id } });
    if (!modul) throw new NotFoundError('Modul tidak ditemukan');
    return prisma.mikroKredensialModul.delete({ where: { id } });
  }

  // ─── Bank Soal Kuis ─────────────────────────────────────

  async getQuizzesByKursusId(kursusId: string) {
    return prisma.mikroKredensialQuiz.findMany({
      where: { kursusId },
      orderBy: { order: 'asc' },
    });
  }

  async createQuiz(kursusId: string, data: { question: string; options: string[]; correctAnswer: number; explanation?: string; order?: number }) {
    const kursus = await prisma.mikroKredensialKursus.findUnique({ where: { id: kursusId } });
    if (!kursus) throw new NotFoundError('Kursus tidak ditemukan');

    const highestOrder = await prisma.mikroKredensialQuiz.findFirst({
      where: { kursusId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = data.order !== undefined ? data.order : (highestOrder?.order ?? -1) + 1;

    return prisma.mikroKredensialQuiz.create({
      data: {
        kursusId,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        order,
      },
    });
  }

  async updateQuiz(id: string, data: { question?: string; options?: string[]; correctAnswer?: number; explanation?: string; order?: number }) {
    const quiz = await prisma.mikroKredensialQuiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundError('Soal kuis tidak ditemukan');
    return prisma.mikroKredensialQuiz.update({ where: { id }, data });
  }

  async deleteQuiz(id: string) {
    const quiz = await prisma.mikroKredensialQuiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundError('Soal kuis tidak ditemukan');
    return prisma.mikroKredensialQuiz.delete({ where: { id } });
  }
}

export const mikroKredensialService = new MikroKredensialService();
