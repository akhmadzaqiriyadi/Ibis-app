import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authService } from './auth.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { Role, UserType } from '@prisma/client';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'secret',
      schema: t.Object({
        id: t.String(),
        role: t.Enum(Role),
      }),
    })
  )
  .post(
    '/register',
    async ({ body, jwt, set }) => {
      try {
        const profileData = body.userType ? {
            userType: body.userType as UserType,
            noWhatsApp: body.noWhatsApp,
            npm: body.npm,
            programStudiId: body.programStudiId,
            alamatUsaha: body.alamatUsaha,
        } : undefined;

        let roleToAssign = (body.role as Role) || Role.MEMBER;
        if (body.userType === 'MAHASISWA') {
          roleToAssign = Role.MAHASISWA;
        } else if (body.userType === 'UMKM') {
          roleToAssign = Role.UMKM;
        }

        const user = await authService.register({
          email: body.email,
          password: body.password,
          name: body.name,
          role: roleToAssign,
          profile: profileData,
        });

        const token = await jwt.sign({
          id: user.id,
          role: user.role,
        });

        set.status = 201;

        // Strip password from response
        const { password, ...userWithoutPassword } = user;

        return successResponse({
          user: userWithoutPassword,
          token,
        }, 'User registered successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to register user');
      }
    },
    {
      detail: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account and returns an access token.',
      },
      body: t.Object({
        email: t.String({ format: 'email', example: 'user@example.com' }),
        password: t.String({ minLength: 6, example: 'password123' }),
        name: t.String({ example: 'John Doe' }),
        role: t.Optional(t.Enum(Role, { example: 'MEMBER' })),
        userType: t.Optional(t.Enum(UserType)),
        noWhatsApp: t.Optional(t.String()),
        npm: t.Optional(t.String()),
        programStudiId: t.Optional(t.String()),
        alamatUsaha: t.Optional(t.String()),
      }),
      response: {
        201: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Object({
            user: t.Object({
              id: t.String(),
              email: t.String(),
              name: t.String(),
              role: t.Enum(Role),
              isActive: t.Boolean(),
              createdAt: t.Any(), // Date object often returned as string in JSON
              updatedAt: t.Any(),
            }),
            token: t.String(),
          }),
          message: t.String({ example: 'User registered successfully' }),
        }),
        400: t.Object({
          success: t.Boolean({ example: false }),
          error: t.String({ example: 'Email already registered' }),
        }),
      },
    }
  )
  .post(
    '/login',
    async ({ body, jwt, set, cookie: { auth } }) => {
      try {
        const user = await authService.login(body.email, body.password);
        
        const token = await jwt.sign({
          id: user.id,
          role: user.role,
        });

        // Set cookie option
        auth.set({
          value: token,
          httpOnly: true,
          maxAge: 7 * 86400, // 7 days
          path: '/',
        });

        const { password, ...userWithoutPassword } = user;

        return successResponse({
          user: userWithoutPassword,
          token,
        }, 'Login successful');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to login');
      }
    },
    {
      detail: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticates a user and returns an access token.',
      },
      body: t.Object({
        email: t.String({ format: 'email', example: 'user@example.com' }),
        password: t.String({ example: 'password123' }),
      }),
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Object({
            user: t.Object({
              id: t.String(),
              email: t.String(),
              name: t.String(),
              role: t.Enum(Role),
              isActive: t.Boolean(),
              createdAt: t.Any(),
              updatedAt: t.Any(),
            }),
            token: t.String(),
          })),
          message: t.Optional(t.String({ example: 'Login successful' })),
          error: t.Optional(t.String()),
        }),
        401: t.Object({
          success: t.Boolean({ example: false }),
          error: t.String({ example: 'Invalid email or password' }),
          message: t.Optional(t.String()),
        }),
      },
    }
  )
  .get(
    '/me',
    async ({ jwt, cookie: { auth }, headers, set }) => {
      try {
        // Get token from header or cookie
        const authHeader = headers['authorization'];
        let token = authHeader?.startsWith('Bearer ') 
          ? authHeader.slice(7) 
          : (auth as any).value;
        
        // If auth is not an object with value, it might be the string value directly (depending on elysia version)
        if (!token && typeof auth === 'string') {
          token = auth;
        }
        
        if (!token) {
          set.status = 401;
          return errorResponse('Unauthorized');
        }

        const profile = await jwt.verify(token as string);
        
        if (!profile) {
            set.status = 401;
            return errorResponse('Invalid token');
        }

        // Explicitly cast payload to expected type to resolve lint errors
        const payload = profile as unknown as { id: string; role: Role };

        const user = await authService.getById(payload.id);
        const { password, ...userWithoutPassword } = user;

        return successResponse(userWithoutPassword);
      } catch (err) {
        set.status = 401;
        return errorResponse('Unauthorized');
      }
    },
    {
      detail: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Returns the profile of the currently authenticated user.',
        security: [{ BearerAuth: [] }],
      },
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Object({
            id: t.String(),
            email: t.String(),
            name: t.String(),
            role: t.Enum(Role),
            isActive: t.Boolean(),
            createdAt: t.Any(),
            updatedAt: t.Any(),
          })),
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
        }),
        401: t.Object({
          success: t.Boolean({ example: false }),
          error: t.String({ example: 'Unauthorized' }),
          message: t.Optional(t.String()),
        }),
      },
    }
  )
  .get('/pending-users', async ({ query, set }) => {
    try {
      const page = query.page ? parseInt(query.page as string) : 1;
      const limit = query.limit ? parseInt(query.limit as string) : 10;
      const search = query.search && query.search !== 'undefined' ? (query.search as string) : undefined;
      const userType = query.userType && query.userType !== 'undefined' ? (query.userType as string) : undefined;
      const result = await authService.getPendingUsers(page, limit, search, userType);
      return successResponse({
          data: result.items,
          pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: result.totalPages
          }
      });
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to fetch pending users');
    }
  })
  .get('/users', async ({ query, set, jwt, cookie: { auth }, headers }) => {
    try {
      // Must be admin check
      const authHeader = headers['authorization'];
      let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (auth as any).value;
      if (!token && typeof auth === 'string') token = auth;
      if (!token) {
        set.status = 401;
        return errorResponse('Unauthorized');
      }
      const profile = await jwt.verify(token as string);
      
      const payload = profile as unknown as { id: string; role: Role };
      if (!profile || payload.role !== Role.ADMIN) {
        set.status = 403;
        return errorResponse('Forbidden: Only admin can access user list');
      }

      const page = query.page ? parseInt(query.page as string) : 1;
      const limit = query.limit ? parseInt(query.limit as string) : 10;
      const search = query.search && query.search !== 'undefined' ? (query.search as string) : undefined;
      const roleFilter = query.roleFilter && query.roleFilter !== 'undefined' ? (query.roleFilter as string) : undefined;
      const statusFilter = query.statusFilter && query.statusFilter !== 'undefined' ? (query.statusFilter as string) : undefined;
      
      const result = await authService.getUsers(page, limit, search, roleFilter, statusFilter);
      return successResponse({
          data: result.items,
          pagination: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: result.totalPages
          }
      });
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to fetch users');
    }
  })
  .put('/users/:id', async ({ params, body, set, jwt, cookie: { auth }, headers }) => {
    try {
      const authHeader = headers['authorization'];
      let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (auth as any).value;
      if (!token && typeof auth === 'string') token = auth;
      if (!token) {
        set.status = 401;
        return errorResponse('Unauthorized');
      }
      const profile = await jwt.verify(token as string);
      const payload = profile as unknown as { id: string; role: Role };
      if (!profile || payload.role !== Role.ADMIN) {
        set.status = 403;
        return errorResponse('Forbidden');
      }

      const userId = params.id;
      const updatedUser = await authService.updateUser(userId, body as { name?: string; role?: Role; isActive?: boolean });
      return successResponse(updatedUser, 'User updated successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to update user');
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      role: t.Optional(t.Enum(Role)),
      isActive: t.Optional(t.Boolean())
    })
  })
  .delete('/users/:id', async ({ params, set, jwt, cookie: { auth }, headers }) => {
    try {
      const authHeader = headers['authorization'];
      let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (auth as any).value;
      if (!token && typeof auth === 'string') token = auth;
      if (!token) {
        set.status = 401;
        return errorResponse('Unauthorized');
      }
      const profile = await jwt.verify(token as string);
      const payload = profile as unknown as { id: string; role: Role };
      if (!profile || payload.role !== Role.ADMIN) {
        set.status = 403;
        return errorResponse('Forbidden');
      }

      await authService.deleteUser(params.id);
      return successResponse(null, 'User deleted successfully');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to delete user');
    }
  })
  .post('/verify/:id', async ({ params, body, set, jwt, cookie: { auth }, headers }) => {
    try {
        const authHeader = headers['authorization'];
        let token = authHeader?.startsWith('Bearer ') 
          ? authHeader.slice(7) 
          : (auth as any).value;
        if (!token && typeof auth === 'string') {
          token = auth;
        }
        if (!token) {
          set.status = 401;
          return errorResponse('Unauthorized');
        }
        const profile = await jwt.verify(token as string);
        if (!profile) {
            set.status = 401;
            return errorResponse('Invalid token');
        }

        const payload = profile as unknown as { id: string; role: Role };

        const result = await authService.verifyUser(params.id, payload.id, body as { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string });
        return successResponse(result, 'User verification processed');
    } catch (err) {
      if (err instanceof AppError) {
        set.status = err.statusCode;
        return errorResponse(err.message);
      }
      set.status = 500;
      return errorResponse('Failed to verify user');
    }
  }, {
      body: t.Object({
          status: t.Union([t.Literal('APPROVED'), t.Literal('REJECTED')]),
          rejectionReason: t.Optional(t.String())
      })
  });
