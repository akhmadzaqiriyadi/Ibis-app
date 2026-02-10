import { prisma } from '@/config/database';
import { AppError, NotFoundError } from '@/common/errors';
import type { User, Prisma } from '@prisma/client';

export class AuthService {
  async register(data: Prisma.UserCreateInput): Promise<User> {
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

  async login(email: string, password: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isValid = await Bun.password.verify(password, user.password);

    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    return user;
  }

  async getById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export const authService = new AuthService();
