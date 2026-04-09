import { Elysia, t } from 'elysia';
import { inkubasiService } from './inkubasi.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Prisma, Role, InkubasiStatus, PlatformPenjualan } from '@prisma/client';

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

const parsePositiveInt = (value: unknown, fallback: number) => {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || Number.isNaN(n) || n <= 0) return fallback;
  return n;
};

export const inkubasiRoutes = new Elysia({ prefix: '/inkubasi' })
  .use(authMiddleware)

  // ══════════════════════════════════════════════════════════
  // PERIODE
  // ══════════════════════════════════════════════════════════

  .get('/periods', async () => {
    const data = await inkubasiService.getAllPeriods();
    return successResponse(data, 'Daftar periode inkubasi');
  }, {
    detail: { tags: ['Inkubasi'], summary: 'List semua periode inkubasi' },
  })

  .get('/periods/active', async () => {
    const data = await inkubasiService.getActivePeriod();
    return successResponse(data, data ? 'Periode aktif ditemukan' : 'Tidak ada periode aktif saat ini');
  }, {
    detail: { tags: ['Inkubasi'], summary: 'Get periode inkubasi yang aktif saat ini' },
  })

  .post('/periods', async ({ body, user, set }: any) => {
    try {
      const data = await inkubasiService.createPeriod(
        { ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate) },
        user.id
      );
      set.status = 201;
      return successResponse(data, 'Periode inkubasi berhasil dibuat');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal membuat periode');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Inkubasi'], summary: 'Buat periode inkubasi baru (Admin/Staff)', security: [{ BearerAuth: [] }] },
    body: t.Object({
      name: t.String({ example: 'Periode 1 Tahun 2026' }),
      startDate: t.String({ format: 'date-time', example: '2026-03-01T00:00:00Z' }),
      endDate: t.String({ format: 'date-time', example: '2026-04-30T23:59:59Z' }),
      description: t.Optional(t.String()),
    }),
  })

  .put('/periods/:id', async ({ params, body, set }: any) => {
    try {
      const data = await inkubasiService.updatePeriod(params.id, {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      });
      return successResponse(data, 'Periode berhasil diperbarui');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memperbarui periode');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Inkubasi'], summary: 'Update periode (buka/tutup)', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      startDate: t.Optional(t.String()),
      endDate: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
      description: t.Optional(t.String()),
    }),
  })

  .delete('/periods/:id', async ({ params, set }: any) => {
    try {
      await inkubasiService.deletePeriod(params.id);
      return successResponse(null, 'Periode berhasil dihapus');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menghapus periode');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Inkubasi'], summary: 'Hapus periode (hanya jika belum ada pengajuan)', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
  })

  // ══════════════════════════════════════════════════════════
  // PENGAJUAN / APPLICATION
  // ══════════════════════════════════════════════════════════

  .get('/applications/my', async ({ user, set }: any) => {
    try {
      const data = await inkubasiService.getMyApplications(user.id);
      return successResponse(data, 'Pengajuan inkubasi saya');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAuth,
    detail: { tags: ['Inkubasi'], summary: 'Lihat status pengajuan inkubasi saya (Mahasiswa)', security: [{ BearerAuth: [] }] },
  })

  .get('/applications', async ({ query, set }: any) => {
    try {
      const data = await inkubasiService.getAllApplications({
        status: query.status as InkubasiStatus | undefined,
        periodId: query.periodId,
        page: parsePositiveInt(query.page, 1),
        limit: Math.min(parsePositiveInt(query.limit, 10), 100),
      });
      return successResponse(data, 'Daftar pengajuan inkubasi');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Inkubasi'], summary: 'List semua pengajuan (Admin/Staff)', security: [{ BearerAuth: [] }] },
    query: t.Object({
      status: t.Optional(t.Enum(InkubasiStatus)),
      periodId: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  .get('/applications/:id', async ({ params, set }: any) => {
    try {
      const data = await inkubasiService.getApplicationById(params.id);
      return successResponse(data, 'Detail pengajuan inkubasi');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Inkubasi'], summary: 'Detail pengajuan (Admin/Staff)', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
  })

  .post('/applications', async ({ body, user, set }: any) => {
    try {
      const data = await inkubasiService.submitApplication(user.id, body);
      set.status = 201;
      return successResponse(data, 'Pengajuan inkubasi berhasil dikirim');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          set.status = 409;
          return errorResponse('Anda sudah pernah mengajukan pada periode ini');
        }
        if (err.code === 'P2003') {
          set.status = 400;
          return errorResponse('Data relasi tidak valid');
        }
      }
      set.status = 500; return errorResponse('Gagal mengirim pengajuan');
    }
  }, {
    beforeHandle: requireMahasiswa,
    detail: { tags: ['Inkubasi'], summary: 'Submit pengajuan inkubasi (Mahasiswa)', security: [{ BearerAuth: [] }] },
    body: t.Object({
      periodId: t.String(),
      namaPemilik: t.String({ minLength: 2 }),
      tahunBerdiri: t.Number({ minimum: 1900, maximum: 2030 }),
      kategoriUsahaId: t.String(),
      rataOmsetPerBulan: t.String({ example: '5-10 juta' }),
      platformPenjualan: t.Enum(PlatformPenjualan),
      uraianProduk: t.String({ minLength: 20 }),
      kendala: t.String({ minLength: 20 }),
      harapan: t.String({ minLength: 20 }),
    }),
  })

  .patch('/applications/:id/review', async ({ params, body, user, set }: any) => {
    try {
      const data = await inkubasiService.reviewApplication(params.id, user.id, body);
      return successResponse(data, `Pengajuan berhasil ${body.status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memproses review');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: {
      tags: ['Inkubasi'],
      summary: 'Review pengajuan: Approve / Reject (Admin/Staff)',
      description: 'Mengubah status pengajuan dan mengirim email notifikasi ke pendaftar.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      status: t.Union([t.Literal('APPROVED'), t.Literal('REJECTED')]),
      reviewNote: t.Optional(t.String()),
    }),
  });
