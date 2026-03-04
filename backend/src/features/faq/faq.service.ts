import { prisma } from '@/config/database';
import { NotFoundError } from '@/common/errors';
import type { FAQ, Prisma } from '@prisma/client';

export class FaqService {
  async getAll(params: {
    category?: string;
    isActive?: boolean;
  }) {
    const { category, isActive } = params;

    const where: Prisma.FAQWhereInput = {
      ...(category && { category: { contains: category, mode: 'insensitive' } }),
      ...(isActive !== undefined && { isActive }),
    };

    return prisma.fAQ.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getById(id: string): Promise<FAQ> {
    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) throw new NotFoundError('FAQ not found');
    return faq;
  }

  async create(data: Prisma.FAQCreateInput): Promise<FAQ> {
    return prisma.fAQ.create({ data });
  }

  async update(id: string, data: Prisma.FAQUpdateInput): Promise<FAQ> {
    await this.getById(id);
    return prisma.fAQ.update({ where: { id }, data });
  }

  async delete(id: string): Promise<FAQ> {
    await this.getById(id);
    return prisma.fAQ.delete({ where: { id } });
  }
}

export const faqService = new FaqService();
