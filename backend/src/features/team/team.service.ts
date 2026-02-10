import { prisma } from '@/config/database';
import { NotFoundError } from '@/common/errors';
import type { TeamMember, Prisma } from '@prisma/client';

export class TeamService {
  async getAll(params: {
    type?: string;
    division?: string;
    batch?: number;
    isActive?: boolean;
  }) {
    const { type, division, batch, isActive } = params;

    const where: Prisma.TeamMemberWhereInput = {
      ...(type && { type: type as any }),
      ...(division && { division: { contains: division, mode: 'insensitive' } }),
      ...(batch && { batch }),
      ...(isActive !== undefined && { isActive }),
    };

    return prisma.teamMember.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async getById(id: string): Promise<TeamMember> {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundError('Team member not found');
    return member;
  }

  async create(data: Prisma.TeamMemberCreateInput): Promise<TeamMember> {
    return prisma.teamMember.create({ data });
  }

  async update(id: string, data: Prisma.TeamMemberUpdateInput): Promise<TeamMember> {
    await this.getById(id);
    return prisma.teamMember.update({ where: { id }, data });
  }

  async delete(id: string): Promise<TeamMember> {
    await this.getById(id);
    return prisma.teamMember.delete({ where: { id } });
  }
}

export const teamService = new TeamService();
