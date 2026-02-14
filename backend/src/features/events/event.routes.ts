import { Elysia, t } from 'elysia';
import { eventService } from './event.service';
import { successResponse, errorResponse } from '@/common/response';
import { paginate } from '@/common/pagination';
import { AppError } from '@/common/errors';
import type { EventStatus } from '@prisma/client';
import { authMiddleware } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

export const eventRoutes = new Elysia({ prefix: '/events' })
  .use(authMiddleware)
  // Get all events
  .get(
    '/',
    async ({ query }) => {
      try {
        const { events, total, page, limit } = await eventService.getAll({
          page: query.page ? parseInt(query.page) : 1,
          limit: query.limit ? parseInt(query.limit) : 10,
          status: query.status,
          category: query.category,
          isPublished: query.published ? query.published === 'true' : undefined,
        });

        return successResponse(paginate(events, total, page, limit));
      } catch (error) {
        if (error instanceof AppError) {
          return errorResponse(error.message);
        }
        return errorResponse('Failed to fetch events');
      }
    },
    {
      detail: {
        tags: ['Events'],
        summary: 'Get all events',
        description: 'Retrieve a paginated list of events with optional filtering.',
      },
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        status: t.Optional(t.String()),
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
              description: t.String(),

              date: t.Any(),
              endDate: t.Union([t.Any(), t.Null()]),
              location: t.Union([t.String(), t.Null()]),
              image: t.Union([t.String(), t.Null()]),
              category: t.String(),
              status: t.String(),
              maxParticipants: t.Union([t.Number(), t.Null()]),
              registrationUrl: t.Union([t.String(), t.Null()]),
              isPublished: t.Boolean(),
              createdAt: t.Any(),
              updatedAt: t.Any(),
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
        }),
      },
    }
  )

  // Get upcoming events
  .get('/upcoming', async ({ query }) => {
    try {
      const limit = query.limit ? parseInt(query.limit) : 5;
      const events = await eventService.getUpcoming(limit);
      return successResponse(events);
    } catch (error) {
      return errorResponse('Failed to fetch upcoming events');
    }
  }, {
    detail: {
      tags: ['Events'],
      summary: 'Get upcoming events',
      description: 'Retrieve a list of upcoming events.',
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
              slug: t.String(),
              description: t.String(),
              image: t.Nullable(t.String()),
              location: t.Nullable(t.String()),
              date: t.Any(), // simplified since Date handling can be tricky in schemas
              status: t.String(),
          }))),
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
      })
    }
  })

  // Get event by slug
  .get(
    '/:slug',
    async ({ params, set }) => {
      try {
        const event = await eventService.getBySlug(params.slug);
        return successResponse(event);
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to fetch event');
      }
    },
    {
      detail: {
        tags: ['Events'],
        summary: 'Get event by slug',
        description: 'Retrieve details of a specific event using its slug.',
      },
      params: t.Object({
        slug: t.String(),
      }),
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Any()), // Using Any specific schema helps but kept simple for brevity
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
        }),
        404: t.Object({
          success: t.Boolean({ example: false }),
          error: t.String({ example: 'Event not found' }),
          message: t.Optional(t.String()),
        }),
      }
    }
  )

  // Create event - Private (Admin, Staff)
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const createData: any = {
          ...body,
          date: new Date(body.date),
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          status: body.status as EventStatus | undefined,
        };
        const event = await eventService.create(createData);
        set.status = 201;
        return successResponse(event, 'Event created successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to create event');
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
        tags: ['Events'],
        summary: 'Create a new event',
        description: 'Create a new event. Requires ADMIN or STAFF role.',
        security: [{ BearerAuth: [] }],
      },
      body: t.Object({
        title: t.String({ example: 'Tech Workshop 2024' }),
        slug: t.String({ example: 'tech-workshop-2024' }),
        description: t.String({ example: 'A workshop about...' }),
        date: t.String({ example: '2024-12-25T10:00:00Z' }),
        endDate: t.Optional(t.String()),
        location: t.Optional(t.String()),
        image: t.Optional(t.String()),
        category: t.Optional(t.String()),
        status: t.Optional(t.String()),
        maxParticipants: t.Optional(t.Number()),
        registrationUrl: t.Optional(t.String()),
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
    }
  )

  // Update event - Private (Admin, Staff)
  .put(
    '/:id',
    async ({ params, body, set }) => {
      try {
        const updateData: any = {
          ...body,
          date: body.date ? new Date(body.date) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          status: body.status as EventStatus | undefined,
        };
        const event = await eventService.update(params.id, updateData);
        return successResponse(event, 'Event updated successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to update event');
      }
    },
    {
      isAuthenticated: true,
      hasRole: [Role.ADMIN, Role.STAFF],
      detail: {
        tags: ['Events'],
        summary: 'Update an event',
        description: 'Update an existing event. Requires ADMIN or STAFF role.',
        security: [{ BearerAuth: [] }],
      },
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        slug: t.Optional(t.String()),
        description: t.Optional(t.String()),
        date: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        location: t.Optional(t.String()),
        image: t.Optional(t.String()),
        category: t.Optional(t.String()),
        status: t.Optional(t.String()),
        maxParticipants: t.Optional(t.Number()),
        registrationUrl: t.Optional(t.String()),
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
    }
  )

  // Delete event - Private (Admin only)
  .delete(
    '/:id',
    async ({ params, set }) => {
      try {
        await eventService.delete(params.id);
        return successResponse(null, 'Event deleted successfully');
      } catch (err) {
        if (err instanceof AppError) {
          set.status = err.statusCode;
          return errorResponse(err.message);
        }
        set.status = 500;
        return errorResponse('Failed to delete event');
      }
    },
    {
      isAuthenticated: true,
      hasRole: [Role.ADMIN],
      detail: {
        tags: ['Events'],
        summary: 'Delete an event',
        description: 'Delete an event. Requires ADMIN role.',
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
        })
      }
    }
  );
