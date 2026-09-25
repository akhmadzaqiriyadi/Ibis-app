import { prisma } from '@/config/database';
import { NotFoundError, AppError, BadRequestError } from '@/common/errors';
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
  async delete(id: string, currentUserId?: string): Promise<User> {
    await this.getById(id); // Check existence

    if (currentUserId && currentUserId === id) {
      throw new BadRequestError('Anda tidak dapat menghapus akun Anda sendiri.');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Unlink administrative / relation references where this user acted as reviewer, assigner, creator, or verifier
      await tx.userProfile.updateMany({
        where: { verifiedById: id },
        data: { verifiedById: null },
      });

      await tx.inkubasiPeriod.updateMany({
        where: { createdById: id },
        data: { createdById: null },
      });

      await tx.inkubasiApplication.updateMany({
        where: { reviewedById: id },
        data: { reviewedById: null },
      });

      await tx.konsultasiApplication.updateMany({
        where: { assignedMentorId: id },
        data: { assignedMentorId: null },
      });

      await tx.konsultasiApplication.updateMany({
        where: { assignedById: id },
        data: { assignedById: null },
      });

      await tx.konsultasiApplication.updateMany({
        where: { confirmedById: id },
        data: { confirmedById: null },
      });

      // 2. Delete certificates associated with user or user's enrollments
      await tx.certificate.deleteMany({
        where: { userId: id },
      });

      const userEnrollments = await tx.mikroKredensialEnrollment.findMany({
        where: { userId: id },
        select: { id: true },
      });
      if (userEnrollments.length > 0) {
        await tx.certificate.deleteMany({
          where: { enrollmentId: { in: userEnrollments.map((e) => e.id) } },
        });
      }

      // 3. Delete enrollments
      await tx.mikroKredensialEnrollment.deleteMany({
        where: { userId: id },
      });

      // 4. Delete applications
      await tx.inkubasiApplication.deleteMany({
        where: { userId: id },
      });

      await tx.konsultasiApplication.deleteMany({
        where: { userId: id },
      });

      // 5. Delete profile
      await tx.userProfile.deleteMany({
        where: { userId: id },
      });

      // 6. Delete user
      return tx.user.delete({
        where: { id },
      });
    });
  }
}

export const userService = new UserService();
