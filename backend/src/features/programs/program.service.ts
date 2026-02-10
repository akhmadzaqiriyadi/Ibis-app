import { prisma } from '@/config/database';
import { NotFoundError } from '@/common/errors';
import type { Program, Prisma } from '@prisma/client';

export class ProgramService {
  async getAll(params: { isActive?: boolean }) {
    const { isActive } = params;

    const where: Prisma.ProgramWhereInput = {
      ...(isActive !== undefined && { isActive }),
    };

    return prisma.program.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async getById(id: string): Promise<Program> {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundError('Program not found');
    return program;
  }

  async getBySlug(slug: string): Promise<Program> {
    const program = await prisma.program.findUnique({ where: { slug } });
    if (!program) throw new NotFoundError('Program not found');
    return program;
  }

  async create(data: Prisma.ProgramCreateInput): Promise<Program> {
    return prisma.program.create({ data });
  }

  async update(id: string, data: Prisma.ProgramUpdateInput): Promise<Program> {
    await this.getById(id);
    return prisma.program.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Program> {
    await this.getById(id);
    return prisma.program.delete({ where: { id } });
  }
}

export const programService = new ProgramService();
