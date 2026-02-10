import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { authService } from './auth.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { Role } from '@prisma/client';

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
        const user = await authService.register({
          email: body.email,
          password: body.password,
          name: body.name,
          role: (body.role as Role) || Role.MEMBER,
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
  );
