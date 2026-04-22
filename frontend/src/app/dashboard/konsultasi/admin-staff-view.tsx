"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";

import { useUsers } from "@/features/auth/hooks";
import { useAllKonsultasiApplications } from "@/hooks/useKonsultasi";
import { KonsultasiStatus } from "@/types/konsultasi";
import { getStatusBadgeClass, getStatusLabel } from "@/app/dashboard/konsultasi/components/status-utils";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS: Array<{ value: "all" | KonsultasiStatus; label: string }> = [
  { value: "all", label: "Semua Status" },
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "MENTOR_CONFIRMED", label: "Mentor Confirmed" },
  { value: "MENTOR_DECLINED", label: "Mentor Declined" },
  { value: "MENTOR_TIMEOUT", label: "Mentor Timeout" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

export default function AdminStaffView() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | KonsultasiStatus>("all");
  const [mentorFilter, setMentorFilter] = useState<string>("all");

  const { data: appsData, isLoading, isError } = useAllKonsultasiApplications({
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
    mentorId: mentorFilter === "all" ? undefined : mentorFilter,
  });

  const { data: mentorsData } = useUsers({ page: 1, limit: 100, roleFilter: "MENTOR", statusFilter: "active" });
  const mentors = useMemo(() => {
    const raw = (mentorsData as any)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [mentorsData]);

  const applications = appsData?.items ?? [];
  const totalPages = Math.max(1, appsData?.totalPages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, mentorFilter, limit]);

  if (isLoading && !appsData) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-red-500">
        <AlertTriangle className="h-10 w-10" />
        <p>Gagal memuat data konsultasi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4">Konsultasi Bisnis</h2>
        <p className="text-muted-foreground mt-2">Kelola pengajuan konsultasi: assign mentor, konfirmasi jadwal, dan monitoring status.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-55 bg-white">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mentorFilter} onValueChange={setMentorFilter}>
          <SelectTrigger className="w-full sm:w-65 bg-white">
            <SelectValue placeholder="Filter mentor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mentor</SelectItem>
            {mentors.map((m: any) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name || m.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-full sm:w-37.5 bg-white">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / halaman</SelectItem>
            <SelectItem value="20">20 / halaman</SelectItem>
            <SelectItem value="50">50 / halaman</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Pemilik</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Preferred</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[60vh] text-center text-muted-foreground">
                  Data konsultasi belum ada.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium align-middle">
                    {app.namaPemilik}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {app.user?.email || app.user?.name || app.userId}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle">{app.metode}</TableCell>
                  <TableCell className="align-middle">
                    {app.preferredDate ? new Date(app.preferredDate).toLocaleString("id-ID") : "-"}
                  </TableCell>
                  <TableCell className="align-middle">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle">
                    {app.assignedMentor?.name || app.assignedMentor?.email || (app.assignedMentorId ? app.assignedMentorId : "-")}
                  </TableCell>
                  <TableCell className="align-middle text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/konsultasi/${app.id}`}>Detail</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Menampilkan {applications.length > 0 ? (page - 1) * limit + 1 : 0} sampai {Math.min(page * limit, appsData?.total ?? page * limit)} dari {appsData?.total ?? 0} data
        </div>

        <div className="flex items-center gap-6">
          <div className="flex w-27.5 items-center justify-center text-sm font-medium">
            Page {appsData?.page ?? page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
