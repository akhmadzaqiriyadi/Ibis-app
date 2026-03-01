import { Elysia, t } from 'elysia';
import { faqService } from './faq.service';
import { successResponse, errorResponse } from '@/common/response';
import { AppError } from '@/common/errors';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const faqRoutes = new Elysia({ prefix: '/faq' })
  .use(authMiddleware)

  // GET /faq - public, with optional filters
  .get(
    '/',
    async ({ query }) => {
      try {
        const faqs = await faqService.getAll({
          category: query.category,
          isActive: query.active ? query.active === 'true' : undefined,
        });
        return successResponse(faqs);
      } catch (error) {
        return errorResponse('Failed to fetch FAQs');
      }
    },
    {
      detail: {
        tags: ['FAQ'],
        summary: 'Get all FAQs',
        description: 'Retrieve a list of FAQs with optional filtering by category or active status.',
      },
      query: t.Object({
        category: t.Optional(t.String()),
        active: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Array(t.Any())),
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
        }),
      },
    }
  )

  // GET /faq/:id - public
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const faq = await faqService.getById(params.id);
        return successResponse(faq);
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to fetch FAQ');
      }
    },
    {
      detail: {
        tags: ['FAQ'],
        summary: 'Get FAQ by ID',
        description: 'Retrieve a specific FAQ by its ID.',
      },
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Any()),
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
        }),
        404: t.Object({
          success: t.Boolean({ example: false }),
          error: t.String({ example: 'FAQ not found' }),
          message: t.Optional(t.String()),
        }),
      },
    }
  )

  // POST /faq - Admin or Staff only
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const faq = await faqService.create(body as any);
        set.status = 201;
        return successResponse(faq, 'FAQ created successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to create FAQ');
      }
    },
    {
      beforeHandle: ({ user, set }: { user: { id: string; role: Role } | null; set: any }) => {
        if (!user) {
          set.status = 401;
          return errorResponse('Unauthorized');
        }
        const allowedRoles: Role[] = [Role.ADMIN, Role.STAFF];
        if (!allowedRoles.includes(user.role)) {
          set.status = 403;
          return errorResponse('Forbidden: Insufficient permissions');
        }
      },
      detail: {
        tags: ['FAQ'],
        summary: 'Create a new FAQ',
        description: 'Create a new FAQ entry. Requires ADMIN or STAFF role.',
        security: [{ BearerAuth: [] }],
      },
      body: t.Object({
        question: t.String(),
        answer: t.String(),
        category: t.Optional(t.String()),
        order: t.Optional(t.Number()),
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
    }
  )

  // PUT /faq/:id - Admin or Staff only
  .put(
    '/:id',
    async ({ params, body, set }) => {
      try {
        const faq = await faqService.update(params.id, body as any);
        return successResponse(faq, 'FAQ updated successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to update FAQ');
      }
    },
    {
      isAuthenticated: true,
      hasRole: [Role.ADMIN, Role.STAFF],
      detail: {
        tags: ['FAQ'],
        summary: 'Update a FAQ',
        description: 'Update an existing FAQ. Requires ADMIN or STAFF role.',
        security: [{ BearerAuth: [] }],
      },
      params: t.Object({ id: t.String() }),
      body: t.Object({
        question: t.Optional(t.String()),
        answer: t.Optional(t.String()),
        category: t.Optional(t.String()),
        order: t.Optional(t.Number()),
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
    }
  )

  // DELETE /faq/:id - Admin only
  .delete(
    '/:id',
    async ({ params, set }) => {
      try {
        await faqService.delete(params.id);
        return successResponse(null, 'FAQ deleted successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to delete FAQ');
      }
    },
    {
      isAuthenticated: true,
      hasRole: [Role.ADMIN],
      detail: {
        tags: ['FAQ'],
        summary: 'Delete a FAQ',
        description: 'Delete a FAQ entry. Requires ADMIN role.',
        security: [{ BearerAuth: [] }],
      },
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Any()),
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
        }),
      },
    }
  );
