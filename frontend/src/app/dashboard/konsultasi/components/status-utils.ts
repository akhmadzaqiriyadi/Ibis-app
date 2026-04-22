import { KonsultasiStatus } from '@/types/konsultasi';

export const getStatusBadgeClass = (status: KonsultasiStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'ASSIGNED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'MENTOR_CONFIRMED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'MENTOR_DECLINED':
    case 'MENTOR_TIMEOUT':
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: KonsultasiStatus): string => {
  switch (status) {
    case 'PENDING':           return 'Menunggu Assignment';
    case 'ASSIGNED':          return 'Menunggu Respon Mentor';
    case 'MENTOR_CONFIRMED':  return 'Mentor Bersedia';
    case 'MENTOR_DECLINED':   return 'Mentor Menolak';
    case 'MENTOR_TIMEOUT':    return 'Mentor Timeout';
    case 'CONFIRMED':         return 'Jadwal Dikonfirmasi';
    case 'COMPLETED':         return 'Selesai';
    case 'CANCELLED':         return 'Dibatalkan';
    default:                  return status;
  }
};
