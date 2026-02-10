import { prisma } from '@/config/database';
import { NotFoundError } from '@/common/errors';
import type { Update, Prisma } from '@prisma/client';

export class UpdateService {
  async getAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    isPublished?: boolean;
  }) {
    const { page = 1, limit = 10, category, isPublished } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UpdateWhereInput = {
      ...(category && { category }),
      ...(isPublished !== undefined && { isPublished }),
    };

    const [updates, total] = await Promise.all([
      prisma.update.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.update.count({ where }),
    ]);

    return { updates, total, page, limit };
  }

  async getById(id: string): Promise<Update> {
    const update = await prisma.update.findUnique({ where: { id } });
    if (!update) throw new NotFoundError('Update not found');
    return update;
  }

  async getBySlug(slug: string): Promise<Update> {
    const update = await prisma.update.findUnique({ where: { slug } });
    if (!update) throw new NotFoundError('Update not found');
    return update;
  }

  async create(data: Prisma.UpdateCreateInput): Promise<Update> {
    return prisma.update.create({ data });
  }

  async update(id: string, data: Prisma.UpdateUpdateInput): Promise<Update> {
    await this.getById(id);
    return prisma.update.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Update> {
    await this.getById(id);
    return prisma.update.delete({ where: { id } });
  }

  async getRecent(limit = 4) {
    return prisma.update.findMany({
      where: { isPublished: true },
      take: limit,
      orderBy: { date: 'desc' },
    });
  }
}

export const updateService = new UpdateService();
