"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCreatePeriod,
  useDeletePeriod,
  useGetAllApplications,
  useGetPeriods,
  useReviewApplication,
  useUpdatePeriod,
} from "@/features/inkubasi/hooks";
import { InkubasiApplication, InkubasiPeriod, InkubasiStatus } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import InkubasiMahasiswaView from "./student-view";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  Briefcase,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PeriodFormState = {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
};

const toDateTimeLocal = (isoDate?: string) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoOrNull = (value: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

export default function InkubasiAdminPage() {
  const { user } = useAuthStore();
  const isAdminOrStaff = user?.role === "ADMIN" || user?.role === "STAFF";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | InkubasiStatus>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const { data: periodsData, isLoading: loadingPeriods, isError: errorPeriods } = useGetPeriods();
  const periods = useMemo(() => {
    const raw = (periodsData as unknown as InkubasiPeriod[]) || [];
    return Array.isArray(raw) ? raw : [];
  }, [periodsData]);

  const { data: appsData, isLoading: loadingApps, isError: errorApps } = useGetAllApplications({
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
    periodId: periodFilter === "all" ? undefined : periodFilter,
  });

  const applications = appsData?.items ?? [];
  const total = appsData?.total ?? 0;
  const totalPages = Math.max(1, appsData?.totalPages ?? 1);

  const createPeriodMut = useCreatePeriod();
  const updatePeriodMut = useUpdatePeriod();
  const deletePeriodMut = useDeletePeriod();
  const reviewMut = useReviewApplication();

  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<"create" | "edit">("create");
  const [selectedPeriod, setSelectedPeriod] = useState<InkubasiPeriod | null>(null);
  const [periodForm, setPeriodForm] = useState<PeriodFormState>({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    isActive: true,
  });

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<InkubasiApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewNote, setReviewNote] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<InkubasiApplication | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, periodFilter, limit]);

  if (!user) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (user.role === "MAHASISWA") {
    return <InkubasiMahasiswaView />;
  }

  if (!isAdminOrStaff) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Halaman Admin Inkubasi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman ini khusus role ADMIN/STAFF untuk manajemen periode dan review pengajuan inkubasi.
        </p>
      </div>
    );
  }

  const activePeriod = periods.find((p) => p.isActive) || null;

  const openCreatePeriod = () => {
    setPeriodMode("create");
    setSelectedPeriod(null);
    setPeriodForm({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      isActive: true,
    });
    setPeriodDialogOpen(true);
  };

  const openEditPeriod = (period: InkubasiPeriod) => {
    setPeriodMode("edit");
    setSelectedPeriod(period);
    setPeriodForm({
      name: period.name,
      startDate: toDateTimeLocal(period.startDate),
      endDate: toDateTimeLocal(period.endDate),
      description: period.description || "",
      isActive: !!period.isActive,
    });
    setPeriodDialogOpen(true);
  };

  const handleSubmitPeriod = () => {
    const startIso = toIsoOrNull(periodForm.startDate);
    const endIso = toIsoOrNull(periodForm.endDate);

    if (!periodForm.name.trim()) {
      toast.error("Nama periode wajib diisi");
      return;
    }
    if (!startIso || !endIso) {
      toast.error("Tanggal mulai dan tanggal selesai wajib valid");
      return;
    }

    if (periodMode === "create") {
      createPeriodMut.mutate(
        {
          name: periodForm.name.trim(),
          startDate: startIso,
          endDate: endIso,
          description: periodForm.description.trim() || undefined,
        },
        {
          onSuccess: () => {
            setPeriodDialogOpen(false);
            toast.success("Periode inkubasi berhasil dibuat");
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.error || err?.message || "Gagal membuat periode");
          },
        }
      );
      return;
    }

    if (!selectedPeriod) return;

    updatePeriodMut.mutate(
      {
        id: selectedPeriod.id,
        name: periodForm.name.trim(),
        startDate: startIso,
        endDate: endIso,
        description: periodForm.description.trim() || undefined,
        isActive: periodForm.isActive,
      },
      {
        onSuccess: () => {
          setPeriodDialogOpen(false);
          toast.success("Periode inkubasi berhasil diperbarui");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || err?.message || "Gagal memperbarui periode");
        },
      }
    );
  };

  const openDeletePeriod = (period: InkubasiPeriod) => {
    setSelectedPeriod(period);
    setDeleteDialogOpen(true);
  };

  const handleDeletePeriod = () => {
    if (!selectedPeriod) return;
    deletePeriodMut.mutate(selectedPeriod.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        toast.success("Periode inkubasi berhasil dihapus");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || err?.message || "Gagal menghapus periode");
      },
    });
  };

  const openReviewDialog = (app: InkubasiApplication, status: "APPROVED" | "REJECTED") => {
    setSelectedApp(app);
    setReviewStatus(status);
    setReviewNote("");
    setReviewDialogOpen(true);
  };

  const openDetailDialog = (app: InkubasiApplication) => {
    setDetailApp(app);
    setDetailDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedApp) return;

    reviewMut.mutate(
      {
        id: selectedApp.id,
        status: reviewStatus,
        reviewNote: reviewNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReviewDialogOpen(false);
          toast.success(reviewStatus === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || err?.message || "Gagal memproses review");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4 flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-orange-500" />
          Manajemen Inkubasi Bisnis
        </h2>
        <p className="text-muted-foreground mt-2">
          Kelola periode inkubasi dan lakukan review pengajuan peserta dari dashboard admin.
        </p>
      </div>

      <section className="rounded-md border bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-blue-600" />
            {activePeriod ? (
              <span>
                Periode aktif: <strong>{activePeriod.name}</strong>
              </span>
            ) : (
              <span>Belum ada periode yang aktif</span>
            )}
          </div>
          <button
            onClick={openCreatePeriod}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white h-10 px-4 rounded-md hover:bg-blue-700 font-medium text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Buat Periode
          </button>
        </div>

        {loadingPeriods ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : errorPeriods ? (
          <div className="flex items-center justify-center py-10 text-red-500 gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Gagal memuat periode inkubasi.</span>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Periode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Belum ada periode inkubasi.
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.description || "Tanpa deskripsi"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{new Date(p.startDate).toLocaleString("id-ID")}</div>
                        <div className="text-sm text-slate-700">s/d {new Date(p.endDate).toLocaleString("id-ID")}</div>
                      </TableCell>
                      <TableCell>
                        {p.isActive ? (
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">AKTIF</span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">NONAKTIF</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditPeriod(p)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeletePeriod(p)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="rounded-md border bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 className="font-semibold text-gray-900">Pengajuan Inkubasi</h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-55 bg-white">
                <SelectValue placeholder="Filter periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | InkubasiStatus)}>
              <SelectTrigger className="w-full sm:w-45 bg-white">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="APPROVED">APPROVED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loadingApps ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : errorApps ? (
          <div className="flex items-center justify-center py-10 text-red-500 gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Gagal memuat pengajuan inkubasi.</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Bisnis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keputusan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Tidak ada pengajuan pada filter ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="align-top">
                          <div className="font-medium text-slate-900">{app.user?.name || "-"}</div>
                          <div className="text-xs text-blue-600">{app.user?.email || "-"}</div>
                          <div className="text-xs text-muted-foreground mt-1">Dikirim: {new Date(app.createdAt).toLocaleString("id-ID")}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-sm text-slate-800">{app.period?.name || "-"}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-sm text-slate-800">Pemilik: {app.namaPemilik}</div>
                          <div className="text-xs text-muted-foreground">Kategori: {app.kategoriUsaha?.name || "-"}</div>
                          <div className="text-xs text-muted-foreground">Omset: {app.rataOmsetPerBulan}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          {app.status === "PENDING" && (
                            <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">PENDING</span>
                          )}
                          {app.status === "APPROVED" && (
                            <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">APPROVED</span>
                          )}
                          {app.status === "REJECTED" && (
                            <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">REJECTED</span>
                          )}
                          {app.reviewNote && (
                            <div className="text-xs text-muted-foreground mt-2 max-w-62.5 line-clamp-3">Catatan: {app.reviewNote}</div>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {app.status === "PENDING" ? (
                            <span className="text-xs text-muted-foreground">Belum ada keputusan</span>
                          ) : (
                            <div className="text-xs text-slate-600 space-y-1">
                              <div className="font-medium text-slate-800">{app.status === "APPROVED" ? "DITERIMA" : "DITOLAK"}</div>
                              {app.reviewedAt && <div>{new Date(app.reviewedAt).toLocaleString("id-ID")}</div>}
                              {app.reviewedBy?.name && <div>oleh {app.reviewedBy.name}</div>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDetailDialog(app)}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                              title="Detail"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {app.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => openReviewDialog(app, "APPROVED")}
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openReviewDialog(app, "REJECTED")}
                                  className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-sm text-gray-600">
                Menampilkan {applications.length > 0 ? (page - 1) * limit + 1 : 0} sampai {Math.min(page * limit, total)} dari {total} data
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
                  <Select
                    value={`${limit}`}
                    onValueChange={(value) => setLimit(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-17.5" id="rows-per-page">
                      <SelectValue placeholder={limit} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((size) => (
                        <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex w-30 items-center justify-center text-sm font-medium">
                  Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{periodMode === "create" ? "Buat Periode Inkubasi" : "Edit Periode Inkubasi"}</DialogTitle>
            <DialogDescription>
              Atur tanggal pembukaan dan penutupan pendaftaran inkubasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Nama Periode</Label>
              <Input
                value={periodForm.name}
                onChange={(e) => setPeriodForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Contoh: Periode 1 Tahun 2026"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tanggal Mulai</Label>
                <Input
                  type="datetime-local"
                  value={periodForm.startDate}
                  onChange={(e) => setPeriodForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tanggal Selesai</Label>
                <Input
                  type="datetime-local"
                  value={periodForm.endDate}
                  onChange={(e) => setPeriodForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Deskripsi</Label>
              <textarea
                rows={3}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={periodForm.description}
                onChange={(e) => setPeriodForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Opsional"
              />
            </div>

            {periodMode === "edit" && (
              <div className="grid gap-2">
                <Label>Status Periode</Label>
                <Select
                  value={periodForm.isActive ? "active" : "inactive"}
                  onValueChange={(v) => setPeriodForm((p) => ({ ...p, isActive: v === "active" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setPeriodDialogOpen(false)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitPeriod}
              disabled={createPeriodMut.isPending || updatePeriodMut.isPending}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 gap-2"
            >
              {(createPeriodMut.isPending || updatePeriodMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Periode</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus periode <strong>{selectedPeriod?.name}</strong>? Tindakan ini hanya bisa dilakukan jika belum ada pengajuan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handleDeletePeriod}
              disabled={deletePeriodMut.isPending}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 gap-2"
            >
              {deletePeriodMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Ya, Hapus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{reviewStatus === "APPROVED" ? "Setujui Pengajuan" : "Tolak Pengajuan"}</DialogTitle>
            <DialogDescription>
              {reviewStatus === "APPROVED"
                ? "Konfirmasi persetujuan pengajuan inkubasi."
                : "Berikan catatan penolakan agar peserta mendapatkan feedback yang jelas."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md border bg-slate-50 p-3 text-sm">
              <div><strong>Pemohon:</strong> {selectedApp?.user?.name || "-"}</div>
              <div><strong>Email:</strong> {selectedApp?.user?.email || "-"}</div>
              <div><strong>Periode:</strong> {selectedApp?.period?.name || "-"}</div>
            </div>

            <div className="grid gap-2">
              <Label>Catatan Review {reviewStatus === "REJECTED" ? "(Disarankan diisi)" : "(Opsional)"}</Label>
              <textarea
                rows={4}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={reviewStatus === "REJECTED" ? "Contoh: proposal perlu diperjelas di bagian validasi pasar" : "Catatan internal/admin"}
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setReviewDialogOpen(false)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={reviewMut.isPending}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 text-white disabled:opacity-50 gap-2 ${
                reviewStatus === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {reviewMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {reviewStatus === "APPROVED" ? "Ya, Setujui" : "Ya, Tolak"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Inkubasi</DialogTitle>
            <DialogDescription>
              Lihat data pengajuan lengkap untuk validasi dan pengambilan keputusan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <div className="rounded-md border bg-slate-50 p-4 grid gap-2 md:grid-cols-2">
              <div><strong>Nama Pemohon:</strong> {detailApp?.user?.name || "-"}</div>
              <div><strong>Email:</strong> {detailApp?.user?.email || "-"}</div>
              <div><strong>Periode:</strong> {detailApp?.period?.name || "-"}</div>
              <div><strong>Tanggal Submit:</strong> {detailApp?.createdAt ? new Date(detailApp.createdAt).toLocaleString("id-ID") : "-"}</div>
            </div>

            <div className="rounded-md border p-4 space-y-3">
              <h4 className="font-semibold text-slate-900">Data Usaha</h4>
              <div><strong>Nama Pemilik:</strong> {detailApp?.namaPemilik || "-"}</div>
              <div><strong>Tahun Berdiri:</strong> {detailApp?.tahunBerdiri || "-"}</div>
              <div><strong>Kategori Usaha:</strong> {detailApp?.kategoriUsaha?.name || "-"}</div>
              <div><strong>Rata Omset/Bulan:</strong> {detailApp?.rataOmsetPerBulan || "-"}</div>
              <div><strong>Platform Penjualan:</strong> {detailApp?.platformPenjualan || "-"}</div>
              <div><strong>Uraian Produk:</strong> {detailApp?.uraianProduk || "-"}</div>
              <div><strong>Kendala:</strong> {detailApp?.kendala || "-"}</div>
              <div><strong>Harapan:</strong> {detailApp?.harapan || "-"}</div>
            </div>

            <div className="rounded-md border p-4 space-y-2">
              <h4 className="font-semibold text-slate-900">Hasil Keputusan</h4>
              <div>
                <strong>Status:</strong>{" "}
                {detailApp?.status === "PENDING" ? "Belum diputuskan" : detailApp?.status === "APPROVED" ? "DITERIMA" : "DITOLAK"}
              </div>
              {detailApp?.reviewedAt && <div><strong>Waktu Review:</strong> {new Date(detailApp.reviewedAt).toLocaleString("id-ID")}</div>}
              {detailApp?.reviewedBy?.name && <div><strong>Reviewer:</strong> {detailApp.reviewedBy.name}</div>}
              {detailApp?.reviewNote && <div><strong>Catatan Review:</strong> {detailApp.reviewNote}</div>}
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDetailDialogOpen(false)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Tutup
            </button>
            {detailApp?.status === "PENDING" && (
              <>
                <button
                  onClick={() => {
                    if (!detailApp) return;
                    setDetailDialogOpen(false);
                    openReviewDialog(detailApp, "REJECTED");
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Tolak
                </button>
                <button
                  onClick={() => {
                    if (!detailApp) return;
                    setDetailDialogOpen(false);
                    openReviewDialog(detailApp, "APPROVED");
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                >
                  Setujui
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
