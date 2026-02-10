import { Elysia, t } from 'elysia';
import { programService } from './program.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import type { ProgramType } from '@prisma/client';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const programRoutes = new Elysia({ prefix: '/programs' })
  .use(authMiddleware)
  .get('/', async ({ query }) => {
    try {
      const programs = await programService.getAll({
        isActive: query.active ? query.active === 'true' : undefined,
      });
      return successResponse(programs);
    } catch (error) {
      return errorResponse('Failed to fetch programs');
    }
  }, {
    detail: {
      tags: ['Programs'],
      summary: 'Get all programs',
      description: 'Retrieve a list of programs with optional filtering by active status.',
    },
    query: t.Object({
        active: t.Optional(t.String())
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Array(t.Object({
                id: t.String(),
                title: t.String(),
                slug: t.String(),
                type: t.String(),
            }))),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  })

  .get('/:slug', async ({ params, set }) => {
    try {
      const program = await programService.getBySlug(params.slug);
      return successResponse(program);
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to fetch program');
    }
  }, {
    detail: {
      tags: ['Programs'],
      summary: 'Get program by slug',
      description: 'Retrieve details of a specific program using its slug.',
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
            error: t.String({ example: 'Program not found' }),
            message: t.Optional(t.String()),
        })
    }
  })

  .post('/', async ({ body, set }) => {
    try {
      const createData: any = {
        ...body,
        type: body.type as ProgramType,
      };
      const program = await programService.create(createData);
      set.status = 201;
      return successResponse(program, 'Program created successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to create program');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN, Role.STAFF],
    detail: {
      tags: ['Programs'],
      summary: 'Create a new program',
      description: 'Create a new program. Requires ADMIN or STAFF role.',
      security: [{ BearerAuth: [] }],
    },
    body: t.Object({
      title: t.String(),
      slug: t.String(),
      description: t.String(),
      type: t.String(),
      image: t.Optional(t.String()),
      ctaText: t.Optional(t.String()),
      ctaUrl: t.Optional(t.String()),
      requiresAuth: t.Optional(t.Boolean()),
      isActive: t.Optional(t.Boolean()),
      order: t.Optional(t.Number()),
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
        type: (body as any).type ? ((body as any).type as ProgramType) : undefined,
      };
      const program = await programService.update(params.id, updateData);
      return successResponse(program, 'Program updated successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to update program');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN, Role.STAFF],
    detail: {
      tags: ['Programs'],
      summary: 'Update a program',
      description: 'Update an existing program. Requires ADMIN or STAFF role.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({
        id: t.String()
    }),
    body: t.Object({
      title: t.Optional(t.String()),
      slug: t.Optional(t.String()),
      description: t.Optional(t.String()),
      type: t.Optional(t.String()),
      image: t.Optional(t.String()),
      ctaText: t.Optional(t.String()),
      ctaUrl: t.Optional(t.String()),
      requiresAuth: t.Optional(t.Boolean()),
      isActive: t.Optional(t.Boolean()),
      order: t.Optional(t.Number()),
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
      await programService.delete(params.id);
      return successResponse(null, 'Program deleted successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to delete program');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN],
    detail: {
      tags: ['Programs'],
      summary: 'Delete a program',
      description: 'Delete a program. Requires ADMIN role.',
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
