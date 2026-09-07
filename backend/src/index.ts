import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { config } from './config/env';
import { AppError } from './common/errors';
import { eventRoutes } from './features/events/event.routes';
import { programRoutes } from './features/programs/program.routes';
import { teamRoutes } from './features/team/team.routes';
import { updateRoutes } from './features/updates/update.routes';
import { userRoutes } from './features/users/user.routes';
import { authRoutes } from './features/auth/auth.routes';
import { uploadRoutes } from './features/upload/upload.routes';
import { faqRoutes } from './features/faq/faq.routes';
import { masterDataRoutes } from './features/master-data/master-data.routes';
import { inkubasiRoutes } from './features/inkubasi/inkubasi.routes';
import { konsultasiRoutes } from './features/konsultasi/konsultasi.routes';
import { mikroKredensialRoutes } from './features/mikro-kredensial/mikro-kredensial.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';

const app = new Elysia()
  .use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: 'IBISTEK UTY API',
          version: '1.0.0',
          description: 'API Documentation for IBISTEK UTY Backend',
        },
        tags: [
          { name: 'Auth', description: 'Autentikasi & manajemen sesi' },
          { name: 'Dashboard', description: 'Statistik agregat dashboard platform' },
          { name: 'Events', description: 'Event management endpoints' },
          { name: 'Programs', description: 'Program management endpoints' },
          { name: 'Team', description: 'Team member management endpoints' },
          { name: 'Updates', description: 'News and updates endpoints' },
          { name: 'FAQ', description: 'FAQ management endpoints' },
          { name: 'Users', description: 'User management endpoints (Admin only)' },
          { name: 'Upload', description: 'File upload endpoints' },
          { name: 'Master Data', description: 'Kategori usaha & program studi' },
          { name: 'Inkubasi', description: 'Program inkubasi bisnis — periode & pengajuan' },
          { name: 'Konsultasi', description: 'Program konsultasi bisnis — pengajuan & mentor flow' },
          { name: 'Mikro Kredensial', description: 'Program sertifikasi digital, kursus & evaluasi' },
        ],
      },
    })
  )
  .get('/', () => ({
    message: 'IBISTEK UTY API',
    version: '1.0.0',
    docs: '/swagger',
  }))
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .group(config.apiPrefix, (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(eventRoutes)
      .use(programRoutes)
      .use(teamRoutes)
      .use(updateRoutes)
      .use(faqRoutes)
      .use(uploadRoutes)
      .use(masterDataRoutes)
      .use(inkubasiRoutes)
      .use(konsultasiRoutes)
      .use(mikroKredensialRoutes)
      .use(dashboardRoutes)
  )
  .onError(({ error, code, set }) => {
    console.error('Error:', error);
    
    if (error instanceof AppError || (error as any)?.statusCode) {
      const statusCode = (error as any).statusCode || 400;
      set.status = statusCode;
      return {
        success: false,
        error: (error as any)?.name || 'Application Error',
        message: (error as any)?.message || 'Something went wrong',
      };
    }

    if (code === 'VALIDATION') {
      set.status = 422;
      return {
        success: false,
        error: 'Validation Error',
        message: error.toString(),
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Not Found',
        message: 'Route not found',
      };
    }

    set.status = 500;
    return {
      success: false,
      error: 'Internal Server Error',
      message: config.nodeEnv === 'development' ? error.toString() : 'Something went wrong',
    };
  })
  .listen(config.port);

console.log(`[INFO] Server is running at http://localhost:${app.server?.port}`);
console.log(`[DOCS] API Documentation at http://localhost:${app.server?.port}/swagger`);
console.log(`[HEALTH] Health check at http://localhost:${app.server?.port}/health`);
console.log(`[ENV] Environment: ${config.nodeEnv}`);
