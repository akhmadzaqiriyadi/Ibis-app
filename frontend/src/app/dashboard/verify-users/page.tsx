"use client";

import { useEffect, useState } from "react";
import { usePendingUsers, useVerifyUser } from "@/features/auth/hooks";
import { Loader2, Check, X, ShieldAlert, AlertTriangle, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/types";

export default function VerifyUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading, isError } = usePendingUsers({ 
    page, 
    limit: pageSize,
    search: debouncedSearch || undefined,
    userType: userTypeFilter === "all" ? undefined : userTypeFilter
  });
  
  const verifyMutation = useVerifyUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Dialog States
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const openApproveDialog = (user: User) => {
    setSelectedUser(user);
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedUser) return;
    verifyMutation.mutate({
        id: selectedUser.id,
        status: 'APPROVED',
    }, {
        onSuccess: () => {
            setIsApproveDialogOpen(false);
            toast.success(`Akun ${selectedUser.name} berhasil disetujui!`);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menyetujui akun.");
        }
    });
  };

  const openRejectDialog = (user: User) => {
      setSelectedUser(user);
      setRejectionReason("");
      setIsRejectDialogOpen(true);
  }

  const handleConfirmReject = () => {
      if (!selectedUser) return;
      verifyMutation.mutate({
          id: selectedUser.id,
          status: 'REJECTED',
          rejectionReason
      }, {
          onSuccess: () => {
              setIsRejectDialogOpen(false);
              toast.success(`Akun ${selectedUser.name} telah ditolak.`);
          },
          onError: (error: Error) => {
              toast.error(error.message || "Gagal menolak akun.");
          }
      });
  }

  if (isLoading && !response) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center text-red-500 gap-4">
        <AlertTriangle className="h-10 w-10" />
        <p>Gagal memuat data pengguna tertunda.</p>
      </div>
    );
  }

  const users = response?.data || [];
  const pagination = response?.pagination;

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Verifikasi Akun Pengguna Tertunda
        </h2>
        <p className="text-muted-foreground mt-2">
            Kelola dan setujui pendaftaran mahasiswa atau UMKM ke sistem IBISTEK.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-white"
          />
        </div>
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Jenis Akun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis Akun</SelectItem>
            <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
            <SelectItem value="UMKM">UMKM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
        <Table>
            <TableHeader>
                <TableRow className="bg-slate-50">
                    <TableHead>Nama Pengguna</TableHead>
                    <TableHead>Email / No.WA</TableHead>
                    <TableHead>Jenis Akun / Profil</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-[60vh] text-center text-muted-foreground">
                            Tidak ada antrian pengguna yang perlu diverifikasi. Semua akun sudah bersih! 🎉
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium align-top">
                                {user.name}
                                <br />
                                <span className="text-xs text-muted-foreground">Terdaftar: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </TableCell>
                            <TableCell className="align-top">
                                <div><a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a></div>
                                <div className="text-xs mt-1 text-green-700">{user.profile?.noWhatsApp || '-'}</div>
                            </TableCell>
                            <TableCell className="align-top">
                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold mb-2 ${user.profile?.userType === 'MAHASISWA' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {user.profile?.userType}
                                </span>
                                {user.profile?.userType === 'MAHASISWA' && (
                                    <div className="text-xs space-y-1 text-slate-600">
                                        <p><strong>NPM:</strong> {user.profile.npm}</p>
                                        <p><strong>Prodi:</strong> {user.profile.programStudi?.name}</p>
                                    </div>
                                )}
                                {user.profile?.userType === 'UMKM' && (
                                    <div className="text-xs space-y-1 text-slate-600">
                                        <p><strong>Alamat Usaha:</strong> {user.profile.alamatUsaha}</p>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => openApproveDialog(user)}
                                        disabled={verifyMutation.isPending}
                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
                                        title="Setujui (Approve)"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                         onClick={() => openRejectDialog(user)}
                                         disabled={verifyMutation.isPending}
                                         className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
                                         title="Tolak (Reject)"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col md:flex-row items-center justify-between px-4 gap-4">
            <div className="text-sm text-gray-600">
                Menampilkan {users.length > 0 ? (page - 1) * pageSize + 1 : 0} sampai {Math.min(page * pageSize, pagination.total)} dari {pagination.total} data
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]" id="rows-per-page">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {page} of {pagination.totalPages || 1}
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
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(Math.max(1, pagination.totalPages), p + 1))}
                        disabled={page === Math.max(1, pagination.totalPages) || pagination.totalPages === 0}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPage(Math.max(1, pagination.totalPages))}
                        disabled={page === Math.max(1, pagination.totalPages) || pagination.totalPages === 0}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-white hover:bg-slate-100 disabled:opacity-50"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Setujui Akun</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui akun <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
              Akun ini akan langsung mendapatkan akses ke ekosistem IBISTEK.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
               onClick={() => setIsApproveDialogOpen(false)}
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
               Batal
            </button>
            <button
               onClick={handleConfirmApprove}
               disabled={verifyMutation.isPending}
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 gap-2"
            >
               {verifyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
               Ya, Setujui Akun
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tolak Akun Pengguna</DialogTitle>
            <DialogDescription>
              Silakan masukkan alasan kenapa pendaftaran akun ini ditolak (Mendapat email notifikasi):
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <textarea
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 outline-none text-sm"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: NPM yang dilampirkan tidak sesuai, atau belum melengkapi syarat administrasi."
            />
          </div>

          <DialogFooter>
            <button 
                onClick={() => setIsRejectDialogOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
                Batal
            </button>
            <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || verifyMutation.isPending}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 gap-2"
            >
                {verifyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Konfirmasi Penolakan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
