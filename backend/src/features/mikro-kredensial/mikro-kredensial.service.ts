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

  async getKursusBySlug(slug: string) {
    const kursus = await prisma.mikroKredensialKursus.findUnique({ where: { slug } });
    if (!kursus) throw new NotFoundError('Kursus tidak ditemukan');
    return kursus;
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
    if (enrollment.status === MikroKredensialStatus.COMPLETED) {
      throw new AppError(400, 'Kursus ini sudah pernah diselesaikan');
    }

    const PASSING_GRADE = 70; // Hardcode dulu
    const isPassed = score >= PASSING_GRADE;
    const newStatus = isPassed ? MikroKredensialStatus.COMPLETED : MikroKredensialStatus.FAILED;

    const updated = await prisma.mikroKredensialEnrollment.update({
      where: { id: enrollmentId },
      data: { status: newStatus, score, completedAt: new Date() },
    });

    // Otomatis generate sertifikat jika lulus
    let certificate = null;
    if (isPassed) {
      certificate = await prisma.certificate.create({
        data: {
          userId: enrollment.userId,
          enrollmentId: enrollment.id,
          // Generate unique cert number: IBIS/KRED/[TAHUN]/[RANDOM_HEX_4]
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
}

export const mikroKredensialService = new MikroKredensialService();
