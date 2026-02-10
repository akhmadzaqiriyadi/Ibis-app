import { Elysia, t } from 'elysia';
import { updateService } from './update.service';
import { successResponse, errorResponse } from '@/common/response';
import { paginate } from '@/common/pagination';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const updateRoutes = new Elysia({ prefix: '/updates' })
  .use(authMiddleware)
  .get('/', async ({ query }) => {
    try {
      const { updates, total, page, limit } = await updateService.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
        category: query.category,
        isPublished: query.published ? query.published === 'true' : undefined,
      });
      return successResponse(paginate(updates, total, page, limit));
    } catch (error) {
      return errorResponse('Failed to fetch updates');
    }
  }, {
    detail: {
      tags: ['Updates'],
      summary: 'Get all updates',
      description: 'Retrieve a paginated list of updates with optional filtering.',
    },
    query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        category: t.Optional(t.String()),
        published: t.Optional(t.String()),
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Object({
                data: t.Array(t.Object({
                    id: t.String(),
                    title: t.String(),
                    slug: t.String(),
                    date: t.Any(),
                    category: t.Optional(t.String()),
                })),
                pagination: t.Object({
                    total: t.Number(),
                    page: t.Number(),
                    limit: t.Number(),
                    totalPages: t.Number(),
                })
            })),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  })

  .get('/recent', async ({ query }) => {
    try {
      const limit = query.limit ? parseInt(query.limit) : 4;
      const updates = await updateService.getRecent(limit);
      return successResponse(updates);
    } catch (error) {
      return errorResponse('Failed to fetch recent updates');
    }
  }, {
    detail: {
      tags: ['Updates'],
      summary: 'Get recent updates',
      description: 'Retrieve a list of recent updates.',
    },
    query: t.Object({
        limit: t.Optional(t.String())
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Array(t.Object({
                id: t.String(),
                title: t.String(),
                date: t.String(),
            }))),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  })

  .get('/:slug', async ({ params, set }) => {
    try {
      const update = await updateService.getBySlug(params.slug);
      return successResponse(update);
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to fetch update');
    }
  }, {
    detail: {
      tags: ['Updates'],
      summary: 'Get update by slug',
      description: 'Retrieve details of a specific update using its slug.',
    },
    params: t.Object({
        slug: t.String()
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Any()),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        }),
        404: t.Object({
            success: t.Boolean({ example: false }),
            error: t.String({ example: 'Update not found' }),
            message: t.Optional(t.String()),
        })
    }
  })

  .post('/', async ({ body, set }) => {
    try {
      const createData: any = {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      };
      const update = await updateService.create(createData);
      set.status = 201;
      return successResponse(update, 'Update created successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to create update');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN, Role.STAFF],
    detail: {
      tags: ['Updates'],
      summary: 'Create a new update',
      description: 'Create a new update or news item. Requires ADMIN or STAFF role.',
      security: [{ BearerAuth: [] }],
    },
    body: t.Object({
      title: t.String(),
      slug: t.String(),
      summary: t.String(),
      content: t.Optional(t.String()),
      image: t.Optional(t.String()),
      date: t.Optional(t.String()),
      category: t.Optional(t.String()),
      isPublished: t.Optional(t.Boolean()),
    }),
    response: {
        201: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Any()),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  })

  .put('/:id', async ({ params, body, set }) => {
    try {
      const updateData: any = {
        ...(body as any),
        date: (body as any).date ? new Date((body as any).date) : undefined,
      };
      const update = await updateService.update(params.id, updateData);
      return successResponse(update, 'Update updated successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to update update');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN, Role.STAFF],
    detail: {
      tags: ['Updates'],
      summary: 'Update an update',
      description: 'Update an existing news/update item. Requires ADMIN or STAFF role.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({
        id: t.String()
    }),
    body: t.Object({ // Body schema copied from original file but making fields optional as PUT usually allows partial
      title: t.Optional(t.String()),
      slug: t.Optional(t.String()),
      summary: t.Optional(t.String()),
      content: t.Optional(t.String()),
      image: t.Optional(t.String()),
      date: t.Optional(t.String()),
      category: t.Optional(t.String()),
      isPublished: t.Optional(t.Boolean()),
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Any()),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  })

  .delete('/:id', async ({ params, set }) => {
    try {
      await updateService.delete(params.id);
      return successResponse(null, 'Update deleted successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to delete update');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN],
    detail: {
      tags: ['Updates'],
      summary: 'Delete an update',
      description: 'Delete a news/update item. Requires ADMIN role.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({
        id: t.String()
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Any()),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  });
