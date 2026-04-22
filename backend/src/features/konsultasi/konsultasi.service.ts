import { prisma } from '@/config/database';
import { AppError, NotFoundError } from '@/common/errors';
import { KonsultasiStatus, MetodeKonsultasi, PlatformPenjualan, Role } from '@prisma/client';
import { emailService } from '@/services/email.service';

export class KonsultasiService {
  async getMyApplications(userId: string, filters: {
    status?: KonsultasiStatus;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { status, search, page, limit } = filters;

    const where: any = { userId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { namaPemilik: { contains: search, mode: 'insensitive' } },
        { topikKonsultasi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.konsultasiApplication.findMany({
        where,
        include: {
          kategoriUsaha: { select: { name: true } },
          assignedMentor: { select: { id: true, name: true, email: true } },
          confirmedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.konsultasiApplication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMentorApplications(mentorId: string, filters: {
    status?: KonsultasiStatus;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { status, search, page, limit } = filters;

    const where: any = { assignedMentorId: mentorId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { namaPemilik: { contains: search, mode: 'insensitive' } },
        { topikKonsultasi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.konsultasiApplication.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          kategoriUsaha: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.konsultasiApplication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAllApplications(filters: {
    status?: KonsultasiStatus;
    mentorId?: string;
    page: number;
    limit: number;
  }) {
    const { status, mentorId, page, limit } = filters;
    const where: any = {};
    if (status) where.status = status;
    if (mentorId) where.assignedMentorId = mentorId;

    const [items, total] = await Promise.all([
      prisma.konsultasiApplication.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          kategoriUsaha: { select: { name: true } },
          assignedMentor: { select: { id: true, name: true, email: true } },
          confirmedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.konsultasiApplication.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getApplicationById(id: string) {
    const app = await prisma.konsultasiApplication.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        kategoriUsaha: true,
        assignedMentor: { select: { id: true, name: true, email: true } },
        assignedBy: { select: { name: true } },
        confirmedBy: { select: { name: true } },
      },
    });
    if (!app) throw new NotFoundError('Pengajuan konsultasi tidak ditemukan');
    return app;
  }

  async submitApplication(
    userId: string,
    data: {
      namaPemilik: string;
      tahunBerdiri: number;
      kategoriUsahaId: string;
      rataOmsetPerBulan: string;
      platformPenjualan: PlatformPenjualan;
      uraianProduk: string;
      topikKonsultasi: string;
      preferredDate: string;
      metode: MetodeKonsultasi;
    }
  ) {
    // Guard: pastikan user dengan ID dari token masih ada di database
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      throw new AppError(401, 'Sesi tidak valid. Silakan login ulang.');
    }

    return prisma.konsultasiApplication.create({
      data: {
        userId,
        ...data,
        preferredDate: new Date(data.preferredDate),
      },
    });
  }

  async assignMentor(
    id: string,
    adminId: string,
    data: { assignedMentorId: string; mentorResponseDeadline: string }
  ) {
    const app = await this.getApplicationById(id);
    if (!(['PENDING', 'ASSIGNED', 'MENTOR_DECLINED', 'MENTOR_TIMEOUT'] as string[]).includes(app.status)) {
      throw new AppError(400, 'Pengajuan tidak dalam status yang dapat di-assign (harus PENDING, ASSIGNED, MENTOR_DECLINED, atau MENTOR_TIMEOUT)');
    }

    // Validasi mentor
    const mentor = await prisma.user.findUnique({ where: { id: data.assignedMentorId } });
    if (!mentor || mentor.role !== Role.MENTOR) throw new AppError(400, 'User yang dipilih bukan Mentor');

    const deadline = new Date(data.mentorResponseDeadline);

    const updated = await prisma.konsultasiApplication.update({
      where: { id },
      data: {
        status: KonsultasiStatus.ASSIGNED,
        assignedMentorId: data.assignedMentorId,
        assignedAt: new Date(),
        assignedById: adminId,
        mentorResponseDeadline: deadline,
        mentorConfirmedAt: null,
        mentorDeclineReason: null,
      },
      include: { user: true },
    });

    // Notifikasi ke user bahwa mentor sudah ditugaskan
    try {
      await emailService.sendKonsultasiAssigned(updated.user.email, updated.user.name, mentor.name, deadline);
    } catch (e) {
      console.error('⚠️  Gagal kirim email assign mentor:', e);
    }

    return updated;
  }

  async mentorRespond(
    id: string,
    mentorId: string,
    data: { bersedia: boolean; declineReason?: string }
  ) {
    const app = await this.getApplicationById(id);
    if (app.assignedMentorId !== mentorId) throw new AppError(403, 'Anda tidak ditugaskan untuk konsultasi ini');
    if (app.status !== KonsultasiStatus.ASSIGNED) throw new AppError(400, 'Pengajuan tidak dalam status ASSIGNED');

    const newStatus = data.bersedia ? KonsultasiStatus.MENTOR_CONFIRMED : KonsultasiStatus.MENTOR_DECLINED;

    return prisma.konsultasiApplication.update({
      where: { id },
      data: {
        status: newStatus,
        mentorConfirmedAt: data.bersedia ? new Date() : null,
        mentorDeclineReason: data.bersedia ? null : (data.declineReason ?? 'Tidak ada keterangan'),
      },
    });
  }

  async confirmToUser(
    id: string,
    adminId: string,
    data: {
      confirmedDate: string;
      meetingLink?: string;
      meetingLocation?: string;
    }
  ) {
    const app = await this.getApplicationById(id);
    if (app.status !== KonsultasiStatus.MENTOR_CONFIRMED) {
      throw new AppError(400, 'Konfirmasi hanya bisa dilakukan setelah mentor menyatakan bersedia');
    }

    const confirmedDate = new Date(data.confirmedDate);

    const updated = await prisma.konsultasiApplication.update({
      where: { id },
      data: {
        status: KonsultasiStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmedById: adminId,
        confirmedDate,
        meetingLink: data.meetingLink,
        meetingLocation: data.meetingLocation,
      },
      include: {
        user: true,
        assignedMentor: true,
      },
    });

    // Kirim email konfirmasi ke user
    try {
      await emailService.sendKonsultasiConfirmed(
        updated.user.email,
        updated.user.name,
        updated.assignedMentor?.name ?? 'Mentor',
        confirmedDate,
        updated.metode,
        data.meetingLink,
        data.meetingLocation
      );
    } catch (e) {
      console.error('⚠️  Gagal kirim email konfirmasi konsultasi:', e);
    }

    return updated;
  }

  /**
   * Generate wa.me link untuk admin kirim notifikasi WhatsApp ke user.
   * Admin's WA number diambil dari profil admin yang sedang login.
   */
  async generateWaLink(id: string, adminPhone: string) {
    const app = await this.getApplicationById(id);
    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: { profile: true },
    });

    if (!user?.profile?.noWhatsApp) throw new AppError(400, 'User tidak memiliki nomor WhatsApp terdaftar');

    const userPhone = user.profile.noWhatsApp.replace(/^0/, '62');
    const tanggal = app.confirmedDate?.toLocaleDateString('id-ID', { dateStyle: 'long' }) ?? '-';
    const waktu = app.confirmedDate?.toLocaleTimeString('id-ID', { timeStyle: 'short' }) ?? '-';
    const metode = app.metode === 'ONLINE' ? `Online via Zoom: ${app.meetingLink ?? '-'}` : `Offline di: ${app.meetingLocation ?? '-'}`;

    const pesan = encodeURIComponent(
      `Halo ${user.name}, kami dari IBISTEK UTY ingin mengkonfirmasi jadwal konsultasi bisnis Anda.\n\nTanggal  : ${tanggal}\nJam      : ${waktu} WIB\nMetode   : ${metode}\n\nSilakan hadir tepat waktu. Terima kasih!`
    );

    return { waLink: `https://wa.me/${userPhone}?text=${pesan}`, adminPhone };
  }

  async cancel(id: string, _adminId: string, reason?: string) {
    const app = await this.getApplicationById(id);
    if ((['COMPLETED', 'CANCELLED'] as string[]).includes(app.status)) {
      throw new AppError(400, 'Pengajuan sudah selesai atau dibatalkan');
    }

    const updated = await prisma.konsultasiApplication.update({
      where: { id },
      data: { status: KonsultasiStatus.CANCELLED, cancelledAt: new Date(), cancelReason: reason },
      include: { user: true },
    });

    try {
      await emailService.sendKonsultasiCancelled(updated.user.email, updated.user.name, reason);
    } catch (e) {
      console.error('⚠️  Gagal kirim email pembatalan:', e);
    }

    return updated;
  }

  async complete(id: string) {
    const app = await this.getApplicationById(id);
    if (app.status !== KonsultasiStatus.CONFIRMED) {
      throw new AppError(400, 'Hanya konsultasi berstatus CONFIRMED yang dapat diselesaikan');
    }
    return prisma.konsultasiApplication.update({
      where: { id },
      data: { status: KonsultasiStatus.COMPLETED, completedAt: new Date() },
    });
  }

  async submitLaporan(id: string, userId: string, laporanMahasiswa: string) {
    const app = await this.getApplicationById(id);

    // Pastikan yang submit adalah pemilik pengajuan
    if (app.userId !== userId) {
      throw new AppError(403, 'Anda tidak berhak mengirim laporan untuk konsultasi ini');
    }

    // Laporan hanya bisa dikirim jika konsultasi sudah selesai
    if (app.status !== KonsultasiStatus.COMPLETED) {
      throw new AppError(400, 'Laporan hanya dapat dikirim setelah sesi konsultasi selesai (status COMPLETED)');
    }

    return prisma.konsultasiApplication.update({
      where: { id },
      data: {
        laporanMahasiswa,
        laporanSubmittedAt: new Date(),
      },
    });
  }
}

export const konsultasiService = new KonsultasiService();
