export interface KategoriUsaha {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramStudi {
  id: string;
  name: string;
  code?: string | null;
  fakultas?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
