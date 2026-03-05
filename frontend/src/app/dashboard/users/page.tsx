"use client";

import { useEffect, useState } from "react";
import { useUsers, useUpdateUser, useDeleteUser } from "@/features/auth/hooks";
import { Loader2, Check, X, AlertTriangle, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgramStudiList } from "@/features/master-data/hooks";
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
import { User, Role } from "@/types";

export default function ManageUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading, isError } = useUsers({ 
    page, 
    limit: pageSize,
    search: debouncedSearch || undefined,
    roleFilter: roleFilter === "all" ? undefined : roleFilter,
    statusFilter: statusFilter === "all" ? undefined : statusFilter
  });
  
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Dialog States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: prodiData } = useProgramStudiList();
  const prodis = Array.isArray(prodiData) ? prodiData : (prodiData as any)?.data || [];

  // Edit Form States
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  
  // Profile Form States
  const [editUserType, setEditUserType] = useState<"MAHASISWA"|"UMKM"|"">("");
  const [editNoWhatsApp, setEditNoWhatsApp] = useState("");
  const [editNpm, setEditNpm] = useState("");
  const [editProdiId, setEditProdiId] = useState("");
  const [editAlamatUsaha, setEditAlamatUsaha] = useState("");

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setEditPassword(""); // always reset password field
    
    if (user.profile) {
       setEditUserType(user.profile.userType as any || "");
       setEditNoWhatsApp(user.profile.noWhatsApp || "");
       setEditNpm(user.profile.npm || "");
       setEditProdiId(user.profile.programStudiId || "");
       setEditAlamatUsaha(user.profile.alamatUsaha || "");
    } else {
       setEditUserType("");
       setEditNoWhatsApp("");
       setEditNpm("");
       setEditProdiId("");
       setEditAlamatUsaha("");
    }
    
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedUser) return;
    
    let profileData: any = undefined;
    if (editUserType) {
       profileData = {
          userType: editUserType,
          noWhatsApp: editNoWhatsApp,
          npm: editUserType === "MAHASISWA" ? editNpm : undefined,
          programStudiId: editUserType === "MAHASISWA" ? editProdiId : undefined,
          alamatUsaha: editUserType === "UMKM" ? editAlamatUsaha : undefined,
       };
    }

    updateMutation.mutate({
        id: selectedUser.id,
        data: {
            name: editName,
            role: editRole as Role,
            isActive: editIsActive,
            ...(editPassword ? { password: editPassword } : {}),
            ...(profileData ? { profile: profileData } : {})
        } as any
    }, {
        onSuccess: () => {
            setIsEditDialogOpen(false);
            toast.success(`Data ${selectedUser.name} berhasil diperbarui!`);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal memperbarui pengguna.");
        }
    });
  };

  const openDeleteDialog = (user: User) => {
      setSelectedUser(user);
      setIsDeleteDialogOpen(true);
  }

  const handleConfirmDelete = () => {
      if (!selectedUser) return;
      deleteMutation.mutate(selectedUser.id, {
          onSuccess: () => {
              setIsDeleteDialogOpen(false);
              toast.success(`Pengguna ${selectedUser.name} telah dihapus.`);
          },
          onError: (error: Error) => {
              toast.error(error.message || "Gagal menghapus pengguna.");
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
        <p>Gagal memuat data pengguna.</p>
      </div>
    );
  }

  const users = response?.data || [];
  const pagination = response?.pagination;

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4 flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          Manajemen User
        </h2>
        <p className="text-muted-foreground mt-2">
            Kelola data dan hak akses para pengguna sistem IBISTEK.
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
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="MEMBER">Member Umum</SelectItem>
            <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
            <SelectItem value="UMKM">UMKM</SelectItem>
            <SelectItem value="MENTOR">Mentor</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Non-aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
        <Table>
            <TableHeader>
                <TableRow className="bg-slate-50">
                    <TableHead>Nama Pengguna</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-[60vh] text-center text-muted-foreground">
                            Data pengguna tidak ditemukan.
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium align-middle">
                                {user.name}
                                <br />
                                <span className="text-xs text-muted-foreground">Terdaftar: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </TableCell>
                            <TableCell className="align-middle">
                                <div><a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a></div>
                            </TableCell>
                            <TableCell className="align-middle">
                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold
                                    ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 
                                      user.role === 'STAFF' ? 'bg-purple-100 text-purple-700' :
                                      user.role === 'MENTOR' ? 'bg-green-100 text-green-700' :
                                      user.role === 'MAHASISWA' ? 'bg-blue-100 text-blue-700' :
                                      user.role === 'UMKM' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                    {user.role}
                                </span>
                            </TableCell>
                            <TableCell className="align-middle">
                                {user.isActive ? (
                                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                        <Check className="w-4 h-4" /> Aktif
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                                        <X className="w-4 h-4" /> Non-aktif
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right align-middle">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => openEditDialog(user)}
                                        disabled={updateMutation.isPending || deleteMutation.isPending}
                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                                        title="Ubah"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                         onClick={() => openDeleteDialog(user)}
                                         disabled={updateMutation.isPending || deleteMutation.isPending}
                                         className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
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

      {/* Edit Sheet */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto bg-white w-full">
          <SheetHeader>
            <SheetTitle>Detail & Edit Pengguna</SheetTitle>
            <SheetDescription>
              Ubah rincian profil <strong>{selectedUser?.email}</strong>.
            </SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="account" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100">
              <TabsTrigger value="account">Akun Utama</TabsTrigger>
              <TabsTrigger value="profile">Profil Tambahan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-4 py-4">
              <div className="grid gap-2">
                  <Label>Nama Pengguna</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>

              <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={selectedUser?.email || ""} disabled className="bg-slate-100 placeholder:text-slate-500" />
              </div>

              <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={editRole} onValueChange={setEditRole}>
                      <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member Umum</SelectItem>
                        <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
                        <SelectItem value="UMKM">UMKM</SelectItem>
                        <SelectItem value="MENTOR">Mentor</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <div className="grid gap-2">
                  <Label>Status Akun</Label>
                  <Select value={editIsActive ? "active" : "inactive"} onValueChange={(val) => setEditIsActive(val === "active")}>
                      <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Status Aktif" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif (Dapat Login)</SelectItem>
                        <SelectItem value="inactive">Non-aktif / Banned</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <div className="grid gap-2 pt-4 mt-6 border-t border-slate-200">
                  <Label className="text-red-500">Ganti Password (Opsional)</Label>
                  <Input 
                    type="password" 
                    placeholder="Ketik password baru jika ingin mereset"
                    value={editPassword} 
                    onChange={(e) => setEditPassword(e.target.value)} 
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak ingin mengubah password akun ini.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-4 py-4">
              <div className="grid gap-2">
                  <Label>Tipe Akun Profil</Label>
                  <Select value={editUserType} onValueChange={(val: any) => setEditUserType(val)}>
                      <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Pilih Tipe User..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAHASISWA">Mahasiswa UTY</SelectItem>
                        <SelectItem value="UMKM">UMKM</SelectItem>
                      </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Tipe profil untuk pendaftaran program</p>
              </div>

              {editUserType && (
                 <div className="grid gap-2 mt-4">
                     <Label>Nomor WhatsApp</Label>
                     <Input 
                        value={editNoWhatsApp} 
                        onChange={(e) => setEditNoWhatsApp(e.target.value)} 
                        placeholder="Contoh: 081234567890"
                        className="bg-white"
                     />
                 </div>
              )}

              {editUserType === "MAHASISWA" && (
                <>
                  <div className="grid gap-2">
                      <Label>NPM</Label>
                      <Input 
                         value={editNpm} 
                         onChange={(e) => setEditNpm(e.target.value)} 
                         placeholder="Nomor Pokok Mahasiswa"
                         className="bg-white"
                      />
                  </div>
                  <div className="grid gap-2">
                      <Label>Program Studi</Label>
                      <Select value={editProdiId || "unselected"} onValueChange={(v) => setEditProdiId(v === "unselected" ? "" : v)}>
                          <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Pilih Program Studi" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="unselected">Pilih Program Studi...</SelectItem>
                              {prodis.map((p: any) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                </>
              )}

              {editUserType === "UMKM" && (
                 <div className="grid gap-2">
                    <Label>Alamat Usaha</Label>
                    <Input 
                       value={editAlamatUsaha} 
                       onChange={(e) => setEditAlamatUsaha(e.target.value)} 
                       placeholder="Alamat lengkap usaha"
                       className="bg-white"
                    />
                 </div>
              )}
              
              {!editUserType && (
                  <div className="py-8 mt-4 text-center text-sm text-muted-foreground bg-slate-50 border border-dashed rounded-md">
                      Pilih tipe profil untuk melihat rincian tambahan.
                  </div>
              )}
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-8 pt-4 flex sm:justify-end gap-2 border-t">
            <button
               onClick={() => setIsEditDialogOpen(false)}
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
               Batal
            </button>
            <button
               onClick={handleConfirmEdit}
               disabled={updateMutation.isPending || !editName.trim()}
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 gap-2"
            >
               {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
               Simpan Perubahan
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedUser?.name}</strong> secara permanen?
              Seluruh data relasional pengguna ini juga kemungkinan akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <button 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
                Batal
            </button>
            <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 gap-2"
            >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Hapus Permanen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
