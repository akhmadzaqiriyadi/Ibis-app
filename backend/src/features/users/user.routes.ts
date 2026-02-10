import { Elysia, t } from 'elysia';
import { userService } from './user.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authMiddleware)
  // Get all users
  .get('/', async ({ query }) => {
    try {
      const page = query.page ? parseInt(query.page) : 1;
      const limit = query.limit ? parseInt(query.limit) : 10;
      const { users, total } = await userService.getAll({
        page,
        limit,
        role: query.role as Role,
        search: query.search,
      });

      return successResponse({
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return errorResponse('Failed to fetch users');
    }
  }, {
    beforeHandle: ({ user, set }: { user: { id: string; role: Role } | null; set: any }) => {
        if (!user) {
            set.status = 401;
            return errorResponse('Unauthorized');
        }
        if (user.role !== Role.ADMIN) {
            set.status = 403;
            return errorResponse('Forbidden: Admin access required');
        }
    },
    detail: {
      tags: ['Users'],
      summary: 'Get all users (Admin only)',
      description: 'Retrieve a list of users with optional filtering (Admin only).',
      security: [{ BearerAuth: [] }],
    },
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      role: t.Optional(t.String()),
      search: t.Optional(t.String()),
    }),
    response: {
      200: t.Object({
        success: t.Boolean({ example: true }),
        data: t.Optional(t.Object({
          data: t.Array(t.Any()),
          pagination: t.Object({
            total: t.Number(),
            page: t.Number(),
            limit: t.Number(),
            totalPages: t.Number(),
          }),
        })),
        message: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    },
  })

  // Create User (Admin)
  .post('/', async ({ body, set }) => {
    try {
      const user = await userService.create(body as any);
      const { password, ...userWithoutPassword } = user;
      set.status = 201;
      return successResponse(userWithoutPassword, 'User created successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to create user');
    }
  }, {
    beforeHandle: ({ user, set }: { user: { id: string; role: Role } | null; set: any }) => {
        if (!user) {
            set.status = 401;
            return errorResponse('Unauthorized');
        }
        if (user.role !== Role.ADMIN) {
            set.status = 403;
            return errorResponse('Forbidden: Admin access required');
        }
    },
    detail: {
      tags: ['Users'],
      summary: 'Create a new user (Admin only)',
      description: 'Create a new user manually. Requires ADMIN role.',
      security: [{ BearerAuth: [] }],
    },
    body: t.Object({
      email: t.String(),
      password: t.String(),
      name: t.String(),
      role: t.Optional(t.String()), // "ADMIN" | "STAFF" | "MEMBER"
      isActive: t.Optional(t.Boolean()),
    }),
    response: {
      201: t.Object({
        success: t.Boolean({ example: true }),
        data: t.Optional(t.Any()),
        message: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    },
  })

  // Update User
  .put('/:id', async ({ params, body, set }) => {
    try {
      const user = await userService.update(params.id, body as any);
      const { password, ...userWithoutPassword } = user;
      return successResponse(userWithoutPassword, 'User updated successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to update user');
    }
  }, {
    beforeHandle: ({ user, set }: { user: { id: string; role: Role } | null; set: any }) => {
        if (!user) {
            set.status = 401;
            return errorResponse('Unauthorized');
        }
        if (user.role !== Role.ADMIN) {
            set.status = 403;
            return errorResponse('Forbidden: Admin access required');
        }
    },
    detail: {
      tags: ['Users'],
      summary: 'Update user (Admin only)',
      description: 'Update an existing user. Requires ADMIN role.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
      email: t.Optional(t.String()),
      password: t.Optional(t.String()),
      name: t.Optional(t.String()),
      role: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
    }),
    response: {
      200: t.Object({
        success: t.Boolean({ example: true }),
        data: t.Optional(t.Any()),
        message: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    },
  })

  // Delete User
  .delete('/:id', async ({ params, set }) => {
    try {
      await userService.delete(params.id);
      return successResponse(null, 'User deleted successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to delete user');
    }
  }, {
    beforeHandle: ({ user, set }: { user: { id: string; role: Role } | null; set: any }) => {
        if (!user) {
            set.status = 401;
            return errorResponse('Unauthorized');
        }
        if (user.role !== Role.ADMIN) {
            set.status = 403;
            return errorResponse('Forbidden: Admin access required');
        }
    },
    detail: {
      tags: ['Users'],
      summary: 'Delete user (Admin only)',
      description: 'Delete a user. Requires ADMIN role.',
      security: [{ BearerAuth: [] }],
    },
    params: t.Object({
        id: t.String(),
    }),
    response: {
      200: t.Object({
        success: t.Boolean({ example: true }),
        data: t.Optional(t.Any()),
        message: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    },
  });
