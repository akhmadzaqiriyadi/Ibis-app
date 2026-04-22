'use client';
import Link from 'next/link';
import { KonsultasiApplication } from '@/types/konsultasi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusBadgeClass, getStatusLabel } from './status-utils';
import { FileText } from 'lucide-react';

interface Props {
  applications: KonsultasiApplication[];
}

export function KonsultasiApplicationList({ applications }: Props) {
  const formatDate = (value?: string | null, includeTime = false) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleString('id-ID', {
      dateStyle: 'medium',
      ...(includeTime ? { timeStyle: 'short' } : {}),
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal Pengajuan</TableHead>
          <TableHead>Topik</TableHead>
          <TableHead>Jadwal Final</TableHead>
          <TableHead>Mentor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{formatDate(app.createdAt)}</TableCell>
            <TableCell className="max-w-xs truncate">{app.topikKonsultasi}</TableCell>
            <TableCell>
              {formatDate(app.confirmedDate, true)}
            </TableCell>
            <TableCell>{app.assignedMentor?.name ?? '-'}</TableCell>
            <TableCell>
              <Badge className={getStatusBadgeClass(app.status)}>{getStatusLabel(app.status)}</Badge>
            </TableCell>
            <TableCell>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/konsultasi/${app.id}`}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Detail
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
