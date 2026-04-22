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
  Search,
  X,
} from "lucide-react";

import { useMentorKonsultasiApplications } from "@/hooks/useKonsultasi";
import { getStatusBadgeClass, getStatusLabel } from "@/app/dashboard/konsultasi/components/status-utils";
import { KonsultasiStatus } from "@/types/konsultasi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS: Array<{ value: "all" | KonsultasiStatus; label: string }> = [
  { value: "all", label: "Semua Status" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "MENTOR_CONFIRMED", label: "Saya Konfirmasi" },
  { value: "MENTOR_DECLINED", label: "Saya Tolak" },
  { value: "CONFIRMED", label: "Dijadwalkan" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export default function MentorView() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | KonsultasiStatus>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Reset page ketika filter berubah
  useEffect(() => { setPage(1); }, [statusFilter, search, limit]);

  const { data, isLoading, isError } = useMentorKonsultasiApplications({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit,
  });

  const applications = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  if (isLoading && !data) {
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4">
          Tugas Konsultasi Saya
        </h2>
        <p className="text-muted-foreground mt-2">
          Daftar pengajuan konsultasi yang ditugaskan ke Anda oleh Admin.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex items-center w-full sm:w-80">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari pemilik atau topik..."
            className="pl-9 pr-8 bg-white"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 text-muted-foreground hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-52 bg-white">
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

        {/* Limit */}
        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-full sm:w-36 bg-white">
            <SelectValue placeholder="Per halaman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / halaman</SelectItem>
            <SelectItem value="20">20 / halaman</SelectItem>
            <SelectItem value="50">50 / halaman</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Pemilik</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Topik</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[40vh] text-center text-muted-foreground">
                  {search || statusFilter !== "all"
                    ? "Tidak ada data yang cocok dengan filter."
                    : "Belum ada pengajuan konsultasi yang ditugaskan ke Anda."}
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium align-middle">
                    {app.namaPemilik}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {app.user?.email || app.user?.name}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle">{app.metode}</TableCell>
                  <TableCell className="align-middle max-w-64">
                    <div className="truncate" title={app.topikKonsultasi}>
                      {app.topikKonsultasi}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle text-sm">
                    {app.preferredDate
                      ? new Date(app.preferredDate).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="align-middle">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(app.status)}`}
                    >
                      {getStatusLabel(app.status)}
                    </span>
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Menampilkan{" "}
          {applications.length > 0 ? (page - 1) * limit + 1 : 0} sampai{" "}
          {Math.min(page * limit, data?.total ?? page * limit)} dari {data?.total ?? 0} data
        </div>

        <div className="flex items-center gap-6">
          <div className="flex w-28 items-center justify-center text-sm font-medium">
            Hal {data?.page ?? page} dari {totalPages}
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
