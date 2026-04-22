"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useMyKonsultasiApplications, useMyKonsultasiAppsRaw } from "@/hooks/useKonsultasi";
import { KonsultasiSubmitForm } from "@/app/dashboard/konsultasi/components/konsultasi-submit-form";
import { getStatusBadgeClass, getStatusLabel } from "@/app/dashboard/konsultasi/components/status-utils";
import { KonsultasiStatus } from "@/types/konsultasi";

// Status yang dianggap masih "aktif" — blokir apply baru
const ACTIVE_STATUSES: KonsultasiStatus[] = [
  "PENDING",
  "ASSIGNED",
  "MENTOR_CONFIRMED",
  "CONFIRMED",
];

const STATUS_OPTIONS: Array<{ value: "all" | KonsultasiStatus; label: string }> = [
  { value: "all", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "ASSIGNED", label: "Mentor Ditugaskan" },
  { value: "MENTOR_CONFIRMED", label: "Mentor Bersedia" },
  { value: "MENTOR_DECLINED", label: "Mentor Menolak" },
  { value: "MENTOR_TIMEOUT", label: "Mentor Timeout" },
  { value: "CONFIRMED", label: "Dijadwalkan" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export default function StudentView() {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | KonsultasiStatus>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { setPage(1); }, [statusFilter, search, limit]);

  // Hook ringan untuk cek status aktif (guard tombol apply)
  const { data: rawApps, isLoading: loadingRaw } = useMyKonsultasiAppsRaw();

  // Hook utama dengan filter + pagination
  const { data, isLoading } = useMyKonsultasiApplications({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit,
  });

  const applications = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  // Cek apakah ada konsultasi yang masih aktif
  const hasActiveApplication = useMemo(
    () => rawApps?.some((app) => ACTIVE_STATUSES.includes(app.status as KonsultasiStatus)) ?? false,
    [rawApps]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleFormSuccess = () => setShowSubmitForm(false);

  if (showSubmitForm) {
    return <KonsultasiSubmitForm onSuccess={handleFormSuccess} onCancel={() => setShowSubmitForm(false)} />;
  }

  const formatDate = (value?: string | null, includeTime = false) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      ...(includeTime ? { timeStyle: "short" } : {}),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-orange-100 p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Konsultasi Bisnis
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Pengajuan Konsultasi Saya</h2>
            <p className="max-w-2xl text-sm text-slate-600">
              Ajukan konsultasi, pantau status, dan tunggu konfirmasi jadwal dari admin.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {loadingRaw ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            ) : hasActiveApplication ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                ⏳ Ada pengajuan yang sedang berjalan. Tunggu hingga selesai, dibatalkan, atau mentor menolak untuk mengajukan lagi.
              </div>
            ) : (
              <Button onClick={() => setShowSubmitForm(true)}>
                + Ajukan Konsultasi Baru
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex items-center w-full sm:w-72">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari topik atau nama pemilik..."
            className="pl-9 pr-8 bg-white"
          />
          {searchInput && (
            <button type="button" onClick={handleClearSearch} className="absolute right-2 text-muted-foreground hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-52 bg-white">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-full sm:w-36 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / halaman</SelectItem>
            <SelectItem value="20">20 / halaman</SelectItem>
            <SelectItem value="50">50 / halaman</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        {isLoading && !data ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Topik</TableHead>
                <TableHead>Preferred Date</TableHead>
                <TableHead>Jadwal Final</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                    {search || statusFilter !== "all"
                      ? "Tidak ada pengajuan yang cocok."
                      : "Anda belum pernah mengajukan konsultasi."}
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="align-middle text-sm">{formatDate(app.createdAt)}</TableCell>
                    <TableCell className="align-middle max-w-56">
                      <div className="truncate" title={app.topikKonsultasi}>{app.topikKonsultasi}</div>
                    </TableCell>
                    <TableCell className="align-middle text-sm">{formatDate(app.preferredDate, true)}</TableCell>
                    <TableCell className="align-middle text-sm">{formatDate(app.confirmedDate, true)}</TableCell>
                    <TableCell className="align-middle">{app.assignedMentor?.name ?? "-"}</TableCell>
                    <TableCell className="align-middle">
                      <Badge className={getStatusBadgeClass(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/konsultasi/${app.id}`}>
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Pagination */}
      {(data?.total ?? 0) > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Menampilkan {applications.length > 0 ? (page - 1) * limit + 1 : 0} sampai{" "}
            {Math.min(page * limit, data?.total ?? 0)} dari {data?.total ?? 0} pengajuan
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Hal {page} dari {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page <= 1} className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-40" aria-label="First">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-40" aria-label="Prev">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-40" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-40" aria-label="Last">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
