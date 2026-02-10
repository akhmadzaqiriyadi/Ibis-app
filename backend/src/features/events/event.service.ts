import { prisma } from '@/config/database';
import { NotFoundError } from '@/common/errors';
import type { Event, Prisma } from '@prisma/client';

export class EventService {
  // Get all events with optional filters
  async getAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    isPublished?: boolean;
  }) {
    const { page = 1, limit = 10, status, category, isPublished } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      ...(status && { status: status as any }),
      ...(category && { category }),
      ...(isPublished !== undefined && { isPublished }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total, page, limit };
  }

  // Get event by ID
  async getById(id: string): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  // Get event by slug
  async getBySlug(slug: string): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  // Create new event
  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return prisma.event.create({
      data,
    });
  }

  // Update event
  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    await this.getById(id); // Verify exists
    return prisma.event.update({
      where: { id },
      data,
    });
  }

  // Delete event
  async delete(id: string): Promise<Event> {
    await this.getById(id); // Verify exists
    return prisma.event.delete({
      where: { id },
    });
  }

  // Get upcoming events
  async getUpcoming(limit = 5) {
    return prisma.event.findMany({
      where: {
        isPublished: true,
        status: 'UPCOMING',
        date: {
          gte: new Date(),
        },
      },
      take: limit,
      orderBy: { date: 'asc' },
    });
  }
}

export const eventService = new EventService();
