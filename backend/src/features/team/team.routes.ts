import { Elysia, t } from 'elysia';
import { teamService } from './team.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import type { TeamType } from '@prisma/client';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const teamRoutes = new Elysia({ prefix: '/team' })
  .use(authMiddleware)
  .get('/', async ({ query }) => {
    try {
      const members = await teamService.getAll({
        type: query.type,
        division: query.division,
        batch: query.batch ? parseInt(query.batch) : undefined,
        isActive: query.active ? query.active === 'true' : undefined,
      });
      return successResponse(members);
    } catch (error) {
      return errorResponse('Failed to fetch team members');
    }
  }, {
    detail: {
      tags: ['Team'],
      summary: 'Get all team members',
      description: 'Retrieve a list of team members with optional filtering.',
    },
    query: t.Object({
      type: t.Optional(t.String()),
      division: t.Optional(t.String()),
      batch: t.Optional(t.String()),
      active: t.Optional(t.String()),
    }),
    response: {
        200: t.Object({
            success: t.Boolean({ example: true }),
            data: t.Optional(t.Array(t.Any())),
            message: t.Optional(t.String()),
            error: t.Optional(t.String()),
        })
    }
  })

  .get('/:id', async ({ params, set }) => {
    try {
      const member = await teamService.getById(params.id);
      return successResponse(member);
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to fetch team member');
    }
  }, {
    detail: {
      tags: ['Team'],
      summary: 'Get team member by ID',
      description: 'Retrieve details of a specific team member using their ID.',
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
        }),
        404: t.Object({
            success: t.Boolean({ example: false }),
            error: t.String({ example: 'Team member not found' }),
            message: t.Optional(t.String()),
        })
    }
  })

  .post('/', async ({ body, set }) => {
    try {
      const createData: any = {
        ...body,
        type: body.type as TeamType,
      };
      const member = await teamService.create(createData);
      set.status = 201;
      return successResponse(member, 'Team member created successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to create team member');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN, Role.STAFF],
    detail: {
      tags: ['Team'],
      summary: 'Create a new team member',
      description: 'Create a new team member. Requires ADMIN or STAFF role.',
      security: [{ BearerAuth: [] }],
    },
    body: t.Object({
      name: t.String(),
      title: t.Optional(t.String()),
      type: t.String(), // Enum: LEADER, STAFF, MENTOR, MEMBER
      division: t.Optional(t.String()),
      image: t.Optional(t.String()),
      bio: t.Optional(t.String()),
      email: t.Optional(t.String()),
      linkedin: t.Optional(t.String()),
      instagram: t.Optional(t.String()),
      batch: t.Optional(t.Number()),
      prodi: t.Optional(t.String()),
      order: t.Optional(t.Number()),
      isActive: t.Optional(t.Boolean()),
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
        type: (body as any).type ? ((body as any).type as TeamType) : undefined,
      };
      const member = await teamService.update(params.id, updateData);
      return successResponse(member, 'Team member updated successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to update team member');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN, Role.STAFF],
    detail: {
      tags: ['Team'],
      summary: 'Update a team member',
      description: 'Update an existing team member. Requires ADMIN or STAFF role.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({
        id: t.String()
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      title: t.Optional(t.String()),
      type: t.Optional(t.String()),
      division: t.Optional(t.String()),
      image: t.Optional(t.String()),
      bio: t.Optional(t.String()),
      email: t.Optional(t.String()),
      linkedin: t.Optional(t.String()),
      instagram: t.Optional(t.String()),
      batch: t.Optional(t.Number()),
      prodi: t.Optional(t.String()),
      order: t.Optional(t.Number()),
      isActive: t.Optional(t.Boolean()),
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
      await teamService.delete(params.id);
      return successResponse(null, 'Team member deleted successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to delete team member');
    }
  }, {
    isAuthenticated: true,
    hasRole: [Role.ADMIN],
    detail: {
      tags: ['Team'],
      summary: 'Delete a team member',
      description: 'Delete a team member. Requires ADMIN role.',
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
