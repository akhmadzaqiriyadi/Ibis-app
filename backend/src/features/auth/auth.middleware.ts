import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { errorResponse } from '@/common/response';
import { Role } from '@prisma/client';

export const authMiddleware = (app: Elysia) =>
  app
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
    .derive(async ({ jwt, cookie: { auth }, headers, request }) => {
      // console.log(`[AuthMiddleware] Process: ${request.method} ${request.url}`);
      
      const authHeader = headers['authorization'];
      let token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : (auth as any).value;
      
      if (!token && typeof auth === 'string') {
        token = auth;
      }

      if (!token) {
        return { user: null };
      }

      const profile = await jwt.verify(token as string);

      if (!profile) {
        console.log('[AuthMiddleware] Invalid signature');
        return { user: null };
      }

      const payload = profile as unknown as { id: string; role: Role };

      return {
        user: payload,
      };
    })
    .macro(({ onBeforeHandle }) => ({
      isAuthenticated: (required: boolean = true) => {
        if (!required) return;
        onBeforeHandle(({ user, set, request }) => {
          if (!user) {
            console.log(`[AuthMiddleware] Auth FAIL: ${request.url}`);
            set.status = 401;
            return errorResponse('Unauthorized');
          }
        });
      },
      hasRole: (roles: Role[]) => {
        onBeforeHandle(({ user, set, request }) => {
          if (!user) {
            console.log(`[AuthMiddleware] Role Check FAIL (No User): ${request.url}`);
            set.status = 401;
            return errorResponse('Unauthorized');
          }
          if (!roles.includes(user.role)) {
            console.log(`[AuthMiddleware] Role Check FAIL (User ${user.role} not in [${roles.join(', ')}]): ${request.url}`);
            set.status = 403;
            return errorResponse('Forbidden: Insufficient permissions');
          }
        });
      },
    }));
