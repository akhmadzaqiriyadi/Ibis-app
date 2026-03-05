export type Role = 'ADMIN' | 'STAFF' | 'MENTOR' | 'MAHASISWA' | 'UMKM' | 'MEMBER' | 'USER';
export type UserType = 'MAHASISWA' | 'UMKM';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  id: string;
  userId: string;
  userType: UserType;
  noWhatsApp?: string | null;
  npm?: string | null;
  programStudiId?: string | null;
  alamatUsaha?: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt: string;
  programStudi?: {
    id: string;
    name: string;
    code?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface AuthResponse {
  user: User;
  token: string;
}
