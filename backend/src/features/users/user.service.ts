import { prisma } from '@/config/database';
import { NotFoundError, AppError } from '@/common/errors';
import type { Prisma, User, Role } from '@prisma/client';

export class UserService {
  // Get all users with minimal fields
  async getAll(params: {
    page?: number;
    limit?: number;
    role?: Role;
    search?: string;
  }) {
    const { page = 1, limit = 10, role, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  // Get user by ID
  async getById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // Create new user (Admin)
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  // Update user
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    await this.getById(id); // Check existence

    if (data.password && typeof data.password === 'string') {
        data.password = await Bun.password.hash(data.password, {
            algorithm: 'bcrypt',
            cost: 10,
        });
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Delete user
  async delete(id: string): Promise<User> {
    await this.getById(id); // Check existence
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
