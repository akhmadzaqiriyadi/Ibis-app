import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { config } from './config/env';
import { eventRoutes } from './features/events/event.routes';
import { programRoutes } from './features/programs/program.routes';
import { teamRoutes } from './features/team/team.routes';
import { updateRoutes } from './features/updates/update.routes';
import { userRoutes } from './features/users/user.routes';
import { authRoutes } from './features/auth/auth.routes';
import { uploadRoutes } from './features/upload/upload.routes';

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
          { name: 'Events', description: 'Event management endpoints' },
          { name: 'Programs', description: 'Program management endpoints' },
          { name: 'Team', description: 'Team member management endpoints' },
          { name: 'Updates', description: 'News and updates endpoints' },
          { name: 'Users', description: 'User management endpoints (Admin only)' },
          { name: 'Upload', description: 'File upload endpoints' },
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
      .use(uploadRoutes)
  )
  .onError(({ error, code, set }) => {
    console.error('Error:', error);
    
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

console.log(`🚀 Server is running at http://localhost:${app.server?.port}`);
console.log(`📚 API Documentation at http://localhost:${app.server?.port}/swagger`);
console.log(`🏥 Health check at http://localhost:${app.server?.port}/health`);
console.log(`📦 Environment: ${config.nodeEnv}`);
