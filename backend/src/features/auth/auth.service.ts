import { prisma } from '@/config/database';
import { AppError, NotFoundError } from '@/common/errors';
import { emailService } from '@/services/email.service';
import { Role, UserType, VerificationStatus } from '@prisma/client';
import type { User } from '@prisma/client';

interface RegisterProfile {
  userType: UserType;
  noWhatsApp?: string;
  // Mahasiswa
  npm?: string;
  programStudiId?: string;
  // UMKM
  alamatUsaha?: string;
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: Role;
    profile?: RegisterProfile;
  }): Promise<User> {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError(400, 'Email sudah terdaftar');

    const hashedPassword = await Bun.password.hash(data.password, { algorithm: 'bcrypt', cost: 10 });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role ?? Role.MAHASISWA,
        isActive: ([Role.ADMIN, Role.STAFF, Role.MENTOR] as string[]).includes(data.role ?? Role.MAHASISWA),
      },
    });

    // Buat profil jika ada
    if (data.profile) {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          userType: data.profile.userType,
          noWhatsApp: data.profile.noWhatsApp,
          npm: data.profile.npm,
          programStudiId: data.profile.programStudiId,
          alamatUsaha: data.profile.alamatUsaha,
          verificationStatus: VerificationStatus.PENDING,
        },
      });
    }

    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Email atau password salah');

    const isValid = await Bun.password.verify(password, user.password);
    if (!isValid) throw new AppError(401, 'Email atau password salah');

    if (!user.isActive) {
      throw new AppError(403, 'Akun Anda belum diverifikasi oleh Admin. Silakan tunggu konfirmasi melalui email.');
    }

    return user;
  }

  async getById(id: string): Promise<User & { profile?: any }> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: { include: { programStudi: true } } },
    });
    if (!user) throw new NotFoundError('User tidak ditemukan');
    return user as any;
  }

  // ─── Verifikasi Admin ──────────────────────────────────

  async getPendingUsers(page = 1, limit = 10, search?: string, userType?: string) {
    const where: any = { isActive: false, role: { in: [Role.MAHASISWA, Role.UMKM] } };
    
    if (userType && userType !== 'all') {
      where.profile = { userType: userType as UserType };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: { include: { programStudi: true } } },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    return { items: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Manajemen Pengguna (CRUD) ──────────────────────────

  async getUsers(page = 1, limit = 10, search?: string, roleFilter?: string, statusFilter?: string) {
    const where: any = {};
    
    if (roleFilter && roleFilter !== 'all') {
      where.role = roleFilter as Role;
    }

    if (statusFilter && statusFilter !== 'all') {
      where.isActive = statusFilter === 'active';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: { include: { programStudi: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Hilangkan password sebelum response dikirim
    const sanitizedUsers = users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    return { items: sanitizedUsers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUser(id: string, data: { name?: string; role?: Role; isActive?: boolean }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
    });
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(id: string) {
    // Cascade delete handle via prisma schema or manually
    // hapus profil terlebih dahulu jika perlu
    await prisma.userProfile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async verifyUser(
    userId: string,
    adminId: string,
    data: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw new NotFoundError('User tidak ditemukan');
    if (user.isActive) throw new AppError(400, 'User sudah aktif');

    const isApproved = data.status === 'APPROVED';

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { isActive: isApproved } }),
      prisma.userProfile.update({
        where: { userId },
        data: {
          verificationStatus: isApproved ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
          verifiedAt: isApproved ? new Date() : null,
          verifiedById: isApproved ? adminId : null,
          rejectionReason: isApproved ? null : data.rejectionReason,
        },
      }),
    ]);

    // Kirim email notifikasi
    try {
      if (isApproved) {
        await emailService.sendAccountVerified(user.email, user.name);
      } else {
        await emailService.sendAccountRejected(user.email, user.name, data.rejectionReason);
      }
    } catch (e) {
      console.error('⚠️  Gagal kirim email verifikasi:', e);
    }

    return { userId, status: data.status };
  }
}

export const authService = new AuthService();
