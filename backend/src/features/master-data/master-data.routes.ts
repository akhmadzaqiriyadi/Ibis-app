import { Elysia, t } from 'elysia';
import { masterDataService } from './master-data.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

const isAdminOrStaff = ({ user, set }: any) => {
  if (!user) { set.status = 401; return errorResponse('Unauthorized'); }
  if (![Role.ADMIN, Role.STAFF].includes(user.role)) {
    set.status = 403; return errorResponse('Forbidden: Admin atau Staff saja');
  }
};

export const masterDataRoutes = new Elysia({ prefix: '/master-data' })
  .use(authMiddleware)

  // ══════════════════════════════════════════════════════════
  // KATEGORI USAHA
  // ══════════════════════════════════════════════════════════

  .get('/kategori-usaha', async () => {
    const data = await masterDataService.getAllKategori();
    return successResponse(data, 'Daftar kategori usaha');
  }, {
    detail: { tags: ['Master Data'], summary: 'List kategori usaha', description: 'Mengambil semua kategori usaha yang aktif.' },
  })

  .post('/kategori-usaha', async ({ body, set }) => {
    try {
      const data = await masterDataService.createKategori(body);
      set.status = 201;
      return successResponse(data, 'Kategori usaha berhasil ditambahkan');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menambahkan kategori usaha');
    }
  }, {
    beforeHandle: isAdminOrStaff,
    detail: { tags: ['Master Data'], summary: 'Tambah kategori usaha', security: [{ BearerAuth: [] }] },
    body: t.Object({
      name: t.String({ minLength: 2, example: 'Makanan dan Minuman' }),
      order: t.Optional(t.Number()),
    }),
  })

  .put('/kategori-usaha/:id', async ({ params, body, set }) => {
    try {
      const data = await masterDataService.updateKategori(params.id, body);
      return successResponse(data, 'Kategori usaha berhasil diperbarui');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memperbarui kategori usaha');
    }
  }, {
    beforeHandle: isAdminOrStaff,
    detail: { tags: ['Master Data'], summary: 'Update kategori usaha', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
      order: t.Optional(t.Number()),
    }),
  })

  .delete('/kategori-usaha/:id', async ({ params, set }) => {
    try {
      await masterDataService.deleteKategori(params.id);
      return successResponse(null, 'Kategori usaha berhasil dinonaktifkan');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menghapus kategori usaha');
    }
  }, {
    beforeHandle: isAdminOrStaff,
    detail: { tags: ['Master Data'], summary: 'Hapus (soft-delete) kategori usaha', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
  })

  // ══════════════════════════════════════════════════════════
  // PROGRAM STUDI
  // ══════════════════════════════════════════════════════════

  .get('/program-studi', async () => {
    const data = await masterDataService.getAllProdi();
    return successResponse(data, 'Daftar program studi');
  }, {
    detail: { tags: ['Master Data'], summary: 'List program studi', description: 'Mengambil semua program studi yang aktif.' },
  })

  .post('/program-studi', async ({ body, set }) => {
    try {
      const data = await masterDataService.createProdi(body);
      set.status = 201;
      return successResponse(data, 'Program studi berhasil ditambahkan');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menambahkan program studi');
    }
  }, {
    beforeHandle: isAdminOrStaff,
    detail: { tags: ['Master Data'], summary: 'Tambah program studi', security: [{ BearerAuth: [] }] },
    body: t.Object({
      name: t.String({ minLength: 2, example: 'Teknik Informatika' }),
      code: t.Optional(t.String({ example: 'TI' })),
      fakultas: t.Optional(t.String()),
      order: t.Optional(t.Number()),
    }),
  })

  .put('/program-studi/:id', async ({ params, body, set }) => {
    try {
      const data = await masterDataService.updateProdi(params.id, body);
      return successResponse(data, 'Program studi berhasil diperbarui');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal memperbarui program studi');
    }
  }, {
    beforeHandle: isAdminOrStaff,
    detail: { tags: ['Master Data'], summary: 'Update program studi', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      code: t.Optional(t.String()),
      fakultas: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
      order: t.Optional(t.Number()),
    }),
  })

  .delete('/program-studi/:id', async ({ params, set }) => {
    try {
      await masterDataService.deleteProdi(params.id);
      return successResponse(null, 'Program studi berhasil dinonaktifkan');
    } catch (err) {
      if (err instanceof AppError) { set.status = err.statusCode; return errorResponse(err.message); }
      set.status = 500; return errorResponse('Gagal menghapus program studi');
    }
  }, {
    beforeHandle: isAdminOrStaff,
    detail: { tags: ['Master Data'], summary: 'Hapus (soft-delete) program studi', security: [{ BearerAuth: [] }] },
    params: t.Object({ id: t.String() }),
  });
