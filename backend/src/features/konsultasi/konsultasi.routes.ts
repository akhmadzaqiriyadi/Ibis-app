import { Elysia, t } from 'elysia';
import { konsultasiService } from './konsultasi.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Role, KonsultasiStatus, MetodeKonsultasi, PlatformPenjualan } from '@prisma/client';

const requireAuth = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
};

const requireAdminOrStaff = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
  if (![Role.ADMIN, Role.STAFF].includes(user.role)) {
    set.status = 403; return errorResponse('Forbidden: Admin atau Staff saja');
  }
};

const requireMahasiswa = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
  if (user.role !== Role.MAHASISWA) {
    set.status = 403; return errorResponse('Forbidden: Hanya Mahasiswa yang dapat mengakses fitur ini');
  }
};

const requireMentor = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
  if (user.role !== Role.MENTOR) {
    set.status = 403; return errorResponse('Forbidden: Hanya Mentor yang dapat mengakses endpoint ini');
  }
};

export const konsultasiRoutes = new Elysia({ prefix: '/konsultasi' })
  .use(authMiddleware)

  // ══════════════════════════════════════════════════════════
  // USER — Pengajuan & Tracking Status
  // ══════════════════════════════════════════════════════════

  .get('/applications/my', async ({ user, query, set }: any) => {
    try {
      const data = await konsultasiService.getMyApplications(user.id, {
        status: query.status as KonsultasiStatus | undefined,
        search: query.search || undefined,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
      });
      return successResponse(data, 'Pengajuan konsultasi saya');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAuth,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Lihat status pengajuan konsultasi saya',
      security: [{ BearerAuth: [] }],
    },
    query: t.Object({
      status: t.Optional(t.Enum(KonsultasiStatus)),
      search: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  .post('/applications', async ({ body, user, set }: any) => {
    try {
      const data = await konsultasiService.submitApplication(user.id, body);
      set.status = 201;
      return successResponse(data, 'Pengajuan konsultasi berhasil dikirim. Kami akan menghubungi Anda segera.');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal mengirim pengajuan');
    }
  }, {
    beforeHandle: requireMahasiswa,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Submit pengajuan konsultasi (Mahasiswa)',
      security: [{ BearerAuth: [] }],
    },
    body: t.Object({
      namaPemilik: t.String({ minLength: 2 }),
      tahunBerdiri: t.Number({ minimum: 1900, maximum: 2030 }),
      kategoriUsahaId: t.String(),
      rataOmsetPerBulan: t.String({ example: '1-5 juta' }),
      platformPenjualan: t.Enum(PlatformPenjualan),
      uraianProduk: t.String({ minLength: 20 }),
      topikKonsultasi: t.String({ minLength: 20 }),
      preferredDate: t.String({ format: 'date-time', example: '2026-03-20T10:00:00Z' }),
      metode: t.Enum(MetodeKonsultasi),
    }),
  })

  // ══════════════════════════════════════════════════════════
  // MENTOR — Lihat & Konfirmasi Tugas (harus sebelum /:id !)
  // ══════════════════════════════════════════════════════════

  .get('/applications/mentor/my', async ({ user, query, set }: any) => {
    try {
      const data = await konsultasiService.getMentorApplications(user.id, {
        status: query.status as KonsultasiStatus | undefined,
        search: query.search || undefined,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
      });
      return successResponse(data, 'Pengajuan konsultasi yang ditugaskan ke saya');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireMentor,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Lihat pengajuan yang di-assign ke mentor ini (dengan filter & pagination)',
      security: [{ BearerAuth: [] }],
    },
    query: t.Object({
      status: t.Optional(t.Enum(KonsultasiStatus)),
      search: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  // ══════════════════════════════════════════════════════════
  // ADMIN/STAFF — Kelola Pengajuan
  // ══════════════════════════════════════════════════════════

  .get('/applications', async ({ query, set }: any) => {
    try {
      const data = await konsultasiService.getAllApplications({
        status: query.status as KonsultasiStatus | undefined,
        mentorId: query.mentorId,
        search: query.search || undefined,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
      });
      return successResponse(data, 'Daftar pengajuan konsultasi');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Konsultasi'],
      summary: 'List semua pengajuan konsultasi (Admin/Staff)',
      security: [{ BearerAuth: [] }],
    },
    query: t.Object({
      status: t.Optional(t.Enum(KonsultasiStatus)),
      mentorId: t.Optional(t.String()),
      search: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  .get('/applications/:id', async ({ params, set }: any) => {
    try {
      const data = await konsultasiService.getApplicationById(params.id);
      return successResponse(data, 'Detail pengajuan konsultasi');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAuth,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Detail pengajuan konsultasi',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
  })

  .patch('/applications/:id/assign', async ({ params, body, user, set }: any) => {
    try {
      const data = await konsultasiService.assignMentor(params.id, user.id, body);
      return successResponse(data, 'Mentor berhasil di-assign. Email notifikasi dikirim ke pendaftar.');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal assign mentor');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Assign mentor ke pengajuan (Admin/Staff)',
      description: 'Menugaskan mentor dan set deadline konfirmasi. Email dikirim ke pendaftar.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      assignedMentorId: t.String(),
      mentorResponseDeadline: t.String({ format: 'date-time', example: '2026-03-15T23:59:59Z' }),
    }),
  })

  .patch('/applications/:id/confirm', async ({ params, body, user, set }: any) => {
    try {
      const data = await konsultasiService.confirmToUser(params.id, user.id, body);
      return successResponse(data, 'Konsultasi dikonfirmasi. Email jadwal dikirim ke pendaftar.');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal konfirmasi konsultasi');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Konfirmasi jadwal final ke user (Admin/Staff)',
      description: 'Mengkonfirmasi jadwal+metode. Email dikirim ke pendaftar.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      confirmedDate: t.String({ format: 'date-time' }),
      meetingLink: t.Optional(t.String()),
      meetingLocation: t.Optional(t.String()),
    }),
  })

  .get('/applications/:id/wa-link', async ({ params, user, set }: any) => {
    try {
      // Ambil nomor WA admin dari profil (atau pakai fallback dari query param)
      const adminProfile = await (await import('@/config/database')).prisma.userProfile.findUnique({
        where: { userId: user.id },
      });
      const adminPhone = adminProfile?.noWhatsApp?.replace(/^0/, '62') ?? '';
      const data = await konsultasiService.generateWaLink(params.id, adminPhone);
      return successResponse(data, 'WA link berhasil dibuat');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal membuat WA link');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Generate WA link untuk konfirmasi ke user via WhatsApp (Admin/Staff)',
      description: 'Menghasilkan wa.me link dengan pesan yang sudah dikustomisasi. Admin tinggal klik dan kirim.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
  })

  .patch('/applications/:id/cancel', async ({ params, body, set }: any) => {
    try {
      const data = await konsultasiService.cancel(params.id, '', body.reason);
      return successResponse(data, 'Konsultasi dibatalkan. Email notifikasi dikirim ke pendaftar.');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal membatalkan konsultasi');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Batalkan konsultasi (Admin/Staff)',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
    body: t.Object({ reason: t.Optional(t.String()) }),
  })

  .patch('/applications/:id/complete', async ({ params, set }: any) => {
    try {
      const data = await konsultasiService.complete(params.id);
      return successResponse(data, 'Konsultasi ditandai selesai');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menyelesaikan konsultasi');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Tandai konsultasi selesai (Admin/Staff)',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
  })

  // ══════════════════════════════════════════════════════════
  // MENTOR — Respon Tugas
  // ══════════════════════════════════════════════════════════

  .patch('/applications/:id/mentor-response', async ({ params, body, user, set }: any) => {
    try {
      const data = await konsultasiService.mentorRespond(params.id, user.id, body);
      const pesan = body.bersedia ? 'Anda menyatakan bersedia. Admin akan konfirmasi jadwal ke pendaftar.' : 'Anda menyatakan tidak bisa. Admin akan mencari mentor pengganti.';
      return successResponse(data, pesan);
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memproses respons mentor');
    }
  }, {
    beforeHandle: requireMentor,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Mentor konfirmasi bersedia / tidak (Mentor)',
      description: 'Mentor menyatakan ketersediaannya. Jika tidak bersedia, admin akan assign mentor lain.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      bersedia: t.Boolean({ description: 'true = bersedia, false = tidak bisa' }),
      declineReason: t.Optional(t.String({ description: 'Alasan jika tidak bersedia' })),
    }),
  })

  // ══════════════════════════════════════════════════════════
  // MAHASISWA — Submit Laporan Pasca Konsultasi
  // ══════════════════════════════════════════════════════════

  .post('/applications/:id/laporan', async ({ params, body, user, set }: any) => {
    try {
      const data = await konsultasiService.submitLaporan(params.id, user.id, body.laporanMahasiswa);
      return successResponse(data, 'Laporan konsultasi berhasil dikirim. Terima kasih!');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal mengirim laporan');
    }
  }, {
    beforeHandle: requireAuth,
    detail: {
      tags: ['Konsultasi'],
      summary: 'Submit laporan hasil konsultasi (Mahasiswa)',
      description: 'Mahasiswa mengirimkan laporan/refleksi pasca sesi konsultasi. Hanya bisa jika status COMPLETED.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      laporanMahasiswa: t.String({ minLength: 20, description: 'Isi laporan / catatan hasil konsultasi' }),
    }),
  });
