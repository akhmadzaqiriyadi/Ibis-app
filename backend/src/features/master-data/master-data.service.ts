import { prisma } from '@/config/database';
import { AppError, NotFoundError } from '@/common/errors';

export class MasterDataService {
  // ─── Kategori Usaha ─────────────────────────────────────

  async getAllKategori() {
    return prisma.kategoriUsaha.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createKategori(data: { name: string; order?: number }) {
    const existing = await prisma.kategoriUsaha.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError(400, 'Kategori usaha sudah ada');
    return prisma.kategoriUsaha.create({ data: { ...data, isActive: true } });
  }

  async updateKategori(id: string, data: { name?: string; isActive?: boolean; order?: number }) {
    await this.findKategoriOrThrow(id);
    return prisma.kategoriUsaha.update({ where: { id }, data });
  }

  async deleteKategori(id: string) {
    await this.findKategoriOrThrow(id);
    return prisma.kategoriUsaha.update({ where: { id }, data: { isActive: false } });
  }

  private async findKategoriOrThrow(id: string) {
    const kat = await prisma.kategoriUsaha.findUnique({ where: { id } });
    if (!kat) throw new NotFoundError('Kategori usaha tidak ditemukan');
    return kat;
  }

  // ─── Program Studi ───────────────────────────────────────

  async getAllProdi() {
    return prisma.programStudi.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async createProdi(data: { name: string; code?: string; fakultas?: string; order?: number }) {
    if (data.code) {
      const existing = await prisma.programStudi.findUnique({ where: { code: data.code } });
      if (existing) throw new AppError(400, 'Kode program studi sudah digunakan');
    }
    return prisma.programStudi.create({ data: { ...data, isActive: true } });
  }

  async updateProdi(id: string, data: { name?: string; code?: string; fakultas?: string; isActive?: boolean; order?: number }) {
    await this.findProdiOrThrow(id);
    return prisma.programStudi.update({ where: { id }, data });
  }

  async deleteProdi(id: string) {
    await this.findProdiOrThrow(id);
    return prisma.programStudi.update({ where: { id }, data: { isActive: false } });
  }

  private async findProdiOrThrow(id: string) {
    const prodi = await prisma.programStudi.findUnique({ where: { id } });
    if (!prodi) throw new NotFoundError('Program studi tidak ditemukan');
    return prodi;
  }
}

export const masterDataService = new MasterDataService();
