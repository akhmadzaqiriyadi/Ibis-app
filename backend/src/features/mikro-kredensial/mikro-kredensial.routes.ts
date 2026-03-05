import { Elysia, t } from 'elysia';
import { mikroKredensialService } from './mikro-kredensial.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

const requireAuth = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
};

const requireAdminOrStaff = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
  if (![Role.ADMIN, Role.STAFF].includes(user.role)) {
    set.status = 403; return errorResponse('Forbidden: Admin atau Staff saja');
  }
};

export const mikroKredensialRoutes = new Elysia({ prefix: '/mikro-kredensial' })
  .use(authMiddleware)

  // ══════════════════════════════════════════════════════════
  // KURSUS
  // ══════════════════════════════════════════════════════════

  .get('/kursus', async ({ query }) => {
    const onlyActive = query.all === 'true' ? false : true;
    const data = await mikroKredensialService.getAllKursus(onlyActive);
    return successResponse(data, 'Daftar kursus mikro kredensial');
  }, {
    detail: { tags: ['Mikro Kredensial'], summary: 'List semua kursus', description: 'Query param `all=true` untuk menampilkan yang non-aktif (Admin/Staff)' },
  })

  .get('/kursus/:slug', async ({ params, set }) => {
    try {
      const data = await mikroKredensialService.getKursusBySlug(params.slug);
      return successResponse(data, 'Detail kursus');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal mengambil detail');
    }
  }, {
    detail: { tags: ['Mikro Kredensial'], summary: 'Get detail kursus via slug' },
    params: t.Object({ slug: t.String() }),
  })

  .post('/kursus', async ({ body, set }: any) => {
    try {
      const data = await mikroKredensialService.createKursus(body);
      set.status = 201; return successResponse(data, 'Kursus berhasil dibuat');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal membuat kursus');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Mikro Kredensial'], summary: 'Buat kursus baru', security: [{ BearerAuth: [] }] },
    body: t.Object({
      title: t.String({ minLength: 3 }),
      slug: t.String({ minLength: 3 }),
      description: t.String({ minLength: 10 }),
      duration: t.Optional(t.Number({ description: 'Dalam menit' })),
      thumbnail: t.Optional(t.String()),
      order: t.Optional(t.Number()),
    }),
  })

  .put('/kursus/:id', async ({ params, body, set }: any) => {
    try {
      const data = await mikroKredensialService.updateKursus(params.id, body);
      return successResponse(data, 'Kursus berhasil diperbarui');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memperbarui kursus');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Mikro Kredensial'], summary: 'Update kursus', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      slug: t.Optional(t.String()),
      description: t.Optional(t.String()),
      duration: t.Optional(t.Number()),
      thumbnail: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
    }),
  })

  .delete('/kursus/:id', async ({ params, set }: any) => {
    try {
      await mikroKredensialService.deleteKursus(params.id);
      return successResponse(null, 'Kursus berhasil dihapus');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menghapus kursus');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Mikro Kredensial'], summary: 'Hapus (soft delete) kursus', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
  })

  // ══════════════════════════════════════════════════════════
  // ENROLLMENT
  // ══════════════════════════════════════════════════════════

  .post('/enroll', async ({ user, body, set }: any) => {
    try {
      if (![Role.MAHASISWA, Role.UMKM].includes(user.role)) {
        throw new AppError(403, 'Akses ditolak: Hanya Mahasiswa dan UMKM yang dapat mengambil kursus ini.');
      }
      const data = await mikroKredensialService.enroll(user.id, body.kursusId);
      set.status = 201; return successResponse(data, `Berhasil mendaftar di kursus ${data.kursus.title}`);
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal mendaftar kursus');
    }
  }, {
    beforeHandle: requireAuth,
    detail: { tags: ['Mikro Kredensial'], summary: 'Daftar (enroll) kursus', security: [{ BearerAuth: [] }] },
    body: t.Object({ kursusId: t.String() }),
  })

  .get('/enroll/my', async ({ user, set }: any) => {
    try {
      const data = await mikroKredensialService.getMyEnrollments(user.id);
      return successResponse(data, 'Progress kursus saya');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAuth,
    detail: { tags: ['Mikro Kredensial'], summary: 'List enrollment & progress milik saya', security: [{ BearerAuth: [] }] },
  })

  .get('/enroll', async ({ query, set }: any) => {
    try {
      const data = await mikroKredensialService.getAllEnrollments(
        query.page ? parseInt(query.page) : 1,
        query.limit ? parseInt(query.limit) : 10,
        query.status
      );
      return successResponse(data, 'Seluruh data pendaftaran kursus');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Mikro Kredensial'], summary: 'Lihat semua enrollment peserta', security: [{ BearerAuth: [] }] },
    query: t.Object({ page: t.Optional(t.String()), limit: t.Optional(t.String()), status: t.Optional(t.String()) }),
  })

  .patch('/enroll/:id/complete', async ({ params, body, set }: any) => {
    try {
      const data = await mikroKredensialService.completeKursus(params.id, body.score);
      return successResponse(data, 'Progress kursus berhasil ditandai selesai.');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memproses penilaian kursus');
    }
  }, {
    beforeHandle: requireAdminOrStaff,
    detail: { tags: ['Mikro Kredensial'], summary: 'Selesaikan kursus dan input nilai (Akan generate sertifikat jika lulus)', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      score: t.Number({ description: 'Nilai kelulusan, contoh: 85.5. Auto generate sertifikat jika >= 70' }),
    }),
  })

  // ══════════════════════════════════════════════════════════
  // SERTIFIKAT DIGITAL
  // ══════════════════════════════════════════════════════════

  .get('/certificates/my', async ({ user, set }: any) => {
    try {
      const data = await mikroKredensialService.getMyCertificates(user.id);
      return successResponse(data, 'Daftar sertifikat saya');
    } catch (err) {
      set.status = 500; return errorResponse('Gagal mengambil data');
    }
  }, {
    beforeHandle: requireAuth,
    detail: { tags: ['Mikro Kredensial'], summary: 'Daftar sertifikat digital milik saya', security: [{ BearerAuth: [] }] },
  })

  .get('/certificates/verify/:certNumber', async ({ params, set }: any) => {
    try {
      const data = await mikroKredensialService.verifyCertificate(params.certNumber);
      return successResponse(data, 'Sertifikat valid');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal verifikasi sertifikat');
    }
  }, {
    detail: { tags: ['Mikro Kredensial'], summary: 'Verifikasi validitas sertifikat', description: 'Public endpoint untuk verifikasi sertifikat digital (contoh IBIS/KRED/2026/A1B2)' },
    params: t.Object({ certNumber: t.String() }),
  });
