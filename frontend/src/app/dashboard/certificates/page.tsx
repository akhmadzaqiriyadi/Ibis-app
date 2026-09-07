'use client';

import { useState } from 'react';
import { useGetAllEnrollments } from '@/features/mikro-kredensial/hooks';
import { Award, Search, ShieldCheck, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default function AdminCertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: enrollmentsResponse, isLoading } = useGetAllEnrollments();

  const allEnrollments: any[] =
    (enrollmentsResponse as any)?.data?.items ||
    (enrollmentsResponse as any)?.items ||
    [];

  // Filter only enrollments that have certificates
  const certifiedItems = allEnrollments.filter((item) => item.certificate && item.certificate.certificateNumber);

  const filteredItems = certifiedItems.filter((item) => {
    const certNum = item.certificate?.certificateNumber?.toLowerCase() || '';
    const studentName = item.user?.name?.toLowerCase() || '';
    const courseTitle = item.kursus?.title?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return certNum.includes(query) || studentName.includes(query) || courseTitle.includes(query);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Manajemen Sertifikat Digital
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Data rekapitulasi seluruh sertifikat digital yang telah diterbitkan sistem IBISTEK UTY.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari nomor sertifikat, nama penerima, atau judul kursus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 text-sm p-0 shadow-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            {searchTerm ? 'Tidak ada sertifikat yang cocok dengan pencarian.' : 'Belum ada sertifikat yang diterbitkan.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Nomor Sertifikat</TableHead>
                <TableHead className="font-semibold text-gray-700">Penerima</TableHead>
                <TableHead className="font-semibold text-gray-700">Program Kursus</TableHead>
                <TableHead className="font-semibold text-gray-700">Skor</TableHead>
                <TableHead className="font-semibold text-gray-700">Tanggal Terbit</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      {item.certificate.certificateNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{item.user?.name || '-'}</div>
                    <div className="text-xs text-gray-500">{item.user?.email || '-'}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-800 font-medium">
                    {item.kursus?.title || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.score || 100} / 100
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(item.certificate.issuedAt || item.completedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/verify-certificate?number=${encodeURIComponent(item.certificate.certificateNumber)}`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm" className="text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Verifikasi
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
