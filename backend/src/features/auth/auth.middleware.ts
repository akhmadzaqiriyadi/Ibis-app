import { Elysia, t, type Context } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';
import { errorResponse } from '@/common/response';
import { Role } from '@prisma/client';

export const authMiddleware = new Elysia({ name: 'auth.middleware' })
  .use(bearer())
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
  .derive({ as: 'global' }, async ({ jwt, bearer, cookie }): Promise<{ user: { id: string; role: Role } | null }> => {
    let token: string | undefined = bearer;

    if (!token && cookie && cookie.auth) {
      token = cookie.auth.value as string;
    }

    if (!token) {
      return { user: null };
    }

    try {
      const profile = await jwt.verify(token);

      if (!profile) {
        return { user: null };
      }

      return {
        user: profile as { id: string; role: Role },
      };
    } catch (error) {
      return { user: null };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    isAuthenticated: (required: boolean) => {
      if (!required) return;
      onBeforeHandle(({ user, set }: { user: { id: string; role: Role } | null; set: Context['set'] }) => {
        if (!user) {
          set.status = 401;
          return errorResponse('Unauthorized');
        }
      });
    },
    hasRole: (allowedRoles: Role[]) => {
      if (!allowedRoles || allowedRoles.length === 0) return;
      onBeforeHandle(({ user, set }: { user: { id: string; role: Role } | null; set: Context['set'] }) => {
        if (!user) {
          set.status = 401;
          return errorResponse('Unauthorized');
        }
        if (!allowedRoles.includes(user.role)) {
          set.status = 403;
          return errorResponse('Forbidden: Insufficient permissions');
        }
      });
    },
  }));
