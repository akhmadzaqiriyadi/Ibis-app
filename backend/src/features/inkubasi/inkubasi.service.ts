import { prisma } from '@/config/database';
import { AppError, NotFoundError } from '@/common/errors';
import { InkubasiStatus } from '@prisma/client';
import { emailService } from '@/services/email.service';

export class InkubasiService {
  // ─── Period ──────────────────────────────────────────────

  async getAllPeriods() {
    return prisma.inkubasiPeriod.findMany({ orderBy: { startDate: 'desc' } });
  }

  async getActivePeriod() {
    const now = new Date();
    return prisma.inkubasiPeriod.findFirst({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    });
  }

  async createPeriod(data: { name: string; startDate: Date; endDate: Date; description?: string }, createdById: string) {
    if (data.startDate >= data.endDate) throw new AppError(400, 'Tanggal mulai harus sebelum tanggal selesai');
    return prisma.inkubasiPeriod.create({ data: { ...data, createdById } });
  }

  async updatePeriod(id: string, data: { name?: string; startDate?: Date; endDate?: Date; isActive?: boolean; description?: string }) {
    await this.findPeriodOrThrow(id);
    return prisma.inkubasiPeriod.update({ where: { id }, data });
  }

  async deletePeriod(id: string) {
    await this.findPeriodOrThrow(id);
    const apps = await prisma.inkubasiApplication.count({ where: { periodId: id } });
    if (apps > 0) throw new AppError(400, 'Periode tidak dapat dihapus karena sudah memiliki pengajuan');
    return prisma.inkubasiPeriod.delete({ where: { id } });
  }

  private async findPeriodOrThrow(id: string) {
    const period = await prisma.inkubasiPeriod.findUnique({ where: { id } });
    if (!period) throw new NotFoundError('Periode inkubasi tidak ditemukan');
    return period;
  }

  // ─── Application ─────────────────────────────────────────

  async getMyApplications(userId: string) {
    return prisma.inkubasiApplication.findMany({
      where: { userId },
      include: {
        period: { select: { name: true, startDate: true, endDate: true } },
        kategoriUsaha: { select: { name: true } },
        reviewedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllApplications(filters: { status?: InkubasiStatus; periodId?: string; page: number; limit: number }) {
    const { status, periodId, page, limit } = filters;
    const where: any = {};
    if (status) where.status = status;
    if (periodId) where.periodId = periodId;

    const [items, total] = await Promise.all([
      prisma.inkubasiApplication.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          period: { select: { name: true } },
          kategoriUsaha: { select: { name: true } },
          reviewedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inkubasiApplication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getApplicationById(id: string) {
    const app = await prisma.inkubasiApplication.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        period: true,
        kategoriUsaha: true,
        reviewedBy: { select: { name: true, email: true } },
      },
    });
    if (!app) throw new NotFoundError('Pengajuan inkubasi tidak ditemukan');
    return app;
  }

  async submitApplication(
    userId: string,
    data: {
      periodId: string;
      namaPemilik: string;
      tahunBerdiri: number;
      kategoriUsahaId: string;
      rataOmsetPerBulan: string;
      platformPenjualan: any;
      uraianProduk: string;
      kendala: string;
      harapan: string;
    }
  ) {
    // Cek periode aktif
    const period = await prisma.inkubasiPeriod.findUnique({ where: { id: data.periodId } });
    if (!period || !period.isActive) throw new AppError(400, 'Periode inkubasi tidak aktif atau tidak ditemukan');

    const now = new Date();
    if (now < period.startDate || now > period.endDate) throw new AppError(400, 'Periode pendaftaran belum dibuka atau sudah ditutup');

    // Cek apakah sudah pernah daftar di periode ini
    const existing = await prisma.inkubasiApplication.findFirst({
      where: { userId, periodId: data.periodId, status: { not: 'REJECTED' } },
    });
    if (existing) throw new AppError(400, 'Anda sudah memiliki pengajuan aktif di periode ini');

    return prisma.inkubasiApplication.create({ data: { userId, ...data } });
  }

  async reviewApplication(
    id: string,
    reviewerId: string,
    data: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }
  ) {
    const app = await this.getApplicationById(id);
    if (app.status !== 'PENDING') throw new AppError(400, 'Hanya pengajuan berstatus PENDING yang dapat di-review');

    const updated = await prisma.inkubasiApplication.update({
      where: { id },
      data: { status: data.status, reviewNote: data.reviewNote, reviewedAt: new Date(), reviewedById: reviewerId },
    });

    // Kirim email notifikasi
    try {
      const user = await prisma.user.findUnique({ where: { id: app.userId } });
      if (user) {
        if (data.status === 'APPROVED') {
          await emailService.sendInkubasiApproved(user.email, user.name, app.period.name);
        } else {
          await emailService.sendInkubasiRejected(user.email, user.name, app.period.name, data.reviewNote);
        }
      }
    } catch (e) {
      console.error('⚠️  Gagal kirim email notifikasi inkubasi:', e);
    }

    return updated;
  }
}

export const inkubasiService = new InkubasiService();
