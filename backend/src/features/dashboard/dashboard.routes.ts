import { Elysia } from 'elysia';
import { prisma } from '@/config/database';
import { successResponse, errorResponse } from '@/common/response';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
  .use(authMiddleware)
  .get(
    '/stats',
    async ({ user, set }: any) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('Unauthorized');
        }

        if (![Role.ADMIN, Role.STAFF].includes(user.role)) {
          set.status = 403;
          return errorResponse('Forbidden: Khusus Admin dan Staff');
        }

        const [
          totalUsers,
          pendingVerifications,
          activeEvents,
          activePrograms,
          inkubasiPending,
          konsultasiActive,
          certificatesIssued,
          totalKursus,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.userProfile.count({ where: { verificationStatus: 'PENDING' } }),
          prisma.event.count({ where: { status: 'UPCOMING' } }),
          prisma.program.count({ where: { isActive: true } }),
          prisma.inkubasiApplication.count({ where: { status: 'PENDING' } }),
          prisma.konsultasiApplication.count({
            where: { status: { in: ['ASSIGNED', 'CONFIRMED'] } },
          }),
          prisma.certificate.count(),
          prisma.mikroKredensialKursus.count({ where: { isActive: true } }),
        ]);

        return successResponse({
          totalUsers,
          pendingVerifications,
          activeEvents,
          activePrograms,
          inkubasiPending,
          konsultasiActive,
          certificatesIssued,
          totalKursus,
        }, 'Statistik ringkasan dashboard');
      } catch (err: any) {
        set.status = 500;
        return errorResponse(err?.message || 'Gagal mengambil data statistik');
      }
    },
    {
      detail: {
        tags: ['Dashboard'],
        summary: 'Ringkasan Statistik Dashboard Admin/Staff',
        description: 'Menghitung statistik agregat real-time dari database untuk dashboard overview.',
        security: [{ BearerAuth: [] }],
      },
    }
  );
