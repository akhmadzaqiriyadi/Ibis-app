"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  useKategoriUsahaList, useCreateKategoriUsaha, useUpdateKategoriUsaha, useDeleteKategoriUsaha,
  useProgramStudiList, useCreateProgramStudi, useUpdateProgramStudi, useDeleteProgramStudi 
} from "@/features/master-data/hooks";
import { 
  Loader2, Plus, Edit, Trash2, Database, AlertTriangle, 
  Check, X, Search, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight 
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KategoriUsaha, ProgramStudi } from "@/types";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("kategori");

  // Local Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Local Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination on tab change
  useEffect(() => {
    setPage(1);
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
  }, [activeTab]);

  // Kategori Usaha Hooks
  const { data: kategoriRes, isLoading: loadingKat } = useKategoriUsahaList();
  const createKatMut = useCreateKategoriUsaha();
  const updateKatMut = useUpdateKategoriUsaha();
  const deleteKatMut = useDeleteKategoriUsaha();

  // Program Studi Hooks
  const { data: prodiRes, isLoading: loadingProdi } = useProgramStudiList();
  const createProdiMut = useCreateProgramStudi();
  const updateProdiMut = useUpdateProgramStudi();
  const deleteProdiMut = useDeleteProgramStudi();

  const kategoris = (Array.isArray(kategoriRes) ? kategoriRes : (kategoriRes as any)?.data || []) as KategoriUsaha[];
  const prodis = (Array.isArray(prodiRes) ? prodiRes : (prodiRes as any)?.data || []) as ProgramStudi[];

  // ─── FILTERING & PAGINATION LOGIC ───────────────────────────────────────

  // Filter & Pagination for Kategori
  const filteredKategori = useMemo(() => {
    return kategoris.filter((k) => {
      const matchSearch = k.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : statusFilter === "active" ? k.isActive : !k.isActive;
      return matchSearch && matchStatus;
    });
  }, [kategoris, debouncedSearch, statusFilter]);

  const paginatedKategori = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredKategori.slice(start, start + pageSize);
  }, [filteredKategori, page, pageSize]);

  // Filter & Pagination for Prodi
  const filteredProdi = useMemo(() => {
    return prodis.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          (p.code?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                          (p.fakultas?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchStatus = statusFilter === "all" ? true : statusFilter === "active" ? p.isActive : !p.isActive;
      return matchSearch && matchStatus;
    });
  }, [prodis, debouncedSearch, statusFilter]);

  const paginatedProdi = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProdi.slice(start, start + pageSize);
  }, [filteredProdi, page, pageSize]);

  // Current Total calculations
  const totalItems = activeTab === "kategori" ? filteredKategori.length : filteredProdi.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // ─── FORM STATES ───────────────────────────────────────────────────────
  
  const [isKatDialogOpen, setIsKatDialogOpen] = useState(false);
  const [KatMode, setKatMode] = useState<"add"|"edit">("add");
  const [selKat, setSelKat] = useState<KategoriUsaha | null>(null);
  
  const [isProdiDialogOpen, setIsProdiDialogOpen] = useState(false);
  const [ProdiMode, setProdiMode] = useState<"add"|"edit">("add");
  const [selProdi, setSelProdi] = useState<ProgramStudi | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "kategori"|"prodi"; name: string } | null>(null);

  const [katName, setKatName] = useState("");
  const [katOrder, setKatOrder] = useState(0);
  const [katActive, setKatActive] = useState(true);

  const [prodiName, setProdiName] = useState("");
  const [prodiCode, setProdiCode] = useState("");
  const [prodiFakultas, setProdiFakultas] = useState("");
  const [prodiOrder, setProdiOrder] = useState(0);
  const [prodiActive, setProdiActive] = useState(true);

  const openAddKat = () => {
    setKatMode("add");
    setSelKat(null);
    setKatName("");
    setKatOrder(kategoris.length + 1); // Auto increment approach
    setKatActive(true);
    setIsKatDialogOpen(true);
  };

  const openEditKat = (k: KategoriUsaha) => {
    setKatMode("edit");
    setSelKat(k);
    setKatName(k.name);
    setKatOrder(k.order || 0);
    setKatActive(k.isActive);
    setIsKatDialogOpen(true);
  };

  const openAddProdi = () => {
    setProdiMode("add");
    setSelProdi(null);
    setProdiName("");
    setProdiCode("");
    setProdiFakultas("");
    setProdiOrder(prodis.length + 1); // Auto increment approach
    setProdiActive(true);
    setIsProdiDialogOpen(true);
  };

  const openEditProdi = (p: ProgramStudi) => {
    setProdiMode("edit");
    setSelProdi(p);
    setProdiName(p.name);
    setProdiCode(p.code || "");
    setProdiFakultas(p.fakultas || "");
    setProdiOrder(p.order || 0);
    setProdiActive(p.isActive);
    setIsProdiDialogOpen(true);
  };

  const handleSaveKat = () => {
    if (!katName.trim()) return toast.error("Nama kategori wajib diisi");
    
    if (KatMode === "add") {
      createKatMut.mutate({ name: katName, order: katOrder }, {
        onSuccess: () => {
           toast.success("Kategori berhasil ditambahkan");
           setIsKatDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal menambah kategori")
      });
    } else if (selKat) {
      updateKatMut.mutate({ id: selKat.id, name: katName, isActive: katActive, order: katOrder }, {
        onSuccess: () => {
           toast.success("Kategori berhasil diupdate");
           setIsKatDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal mengupdate kategori")
      });
    }
  };

  const handleSaveProdi = () => {
    if (!prodiName.trim()) return toast.error("Nama program studi wajib diisi");
    
    const payload = {
       name: prodiName,
       code: prodiCode || undefined,
       fakultas: prodiFakultas || undefined,
       order: prodiOrder
    };

    if (ProdiMode === "add") {
      createProdiMut.mutate(payload, {
        onSuccess: () => {
           toast.success("Program Studi berhasil ditambahkan");
           setIsProdiDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal menambah program studi")
      });
    } else if (selProdi) {
      updateProdiMut.mutate({ id: selProdi.id, isActive: prodiActive, ...payload }, {
        onSuccess: () => {
           toast.success("Program Studi berhasil diupdate");
           setIsProdiDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal mengupdate program studi")
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "kategori") {
      deleteKatMut.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success("Kategori berhasil dinonaktifkan");
          setIsDeleteDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal menghapus")
      });
    } else {
      deleteProdiMut.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success("Program Studi berhasil dinonaktifkan");
          setIsDeleteDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Gagal menghapus")
      });
    }
  };

  if (loadingKat && loadingProdi) {
    return <div className="flex h-[60vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 border-b pb-4 flex items-center gap-3">
          <Database className="w-6 h-6 text-slate-500" />
          Master Data
        </h2>
        <p className="text-muted-foreground mt-2">
            Kelola data master sistem seperti Kategori Usaha dan Program Studi dengan filter dan pencarian.
        </p>
      </div>

      <Tabs defaultValue="kategori" value={activeTab} onValueChange={setActiveTab}>
        {/* Navigation & Controls Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-4 rounded-md border shadow-sm mb-6">
          <div className="w-full md:w-auto">
            <Label className="mb-2 block text-xs text-muted-foreground uppercase font-semibold">Pilih Entitas Master Data</Label>
            <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-slate-100">
              <TabsTrigger value="kategori">Kategori Usaha</TabsTrigger>
              <TabsTrigger value="prodi">Program Studi</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex w-full md:w-auto flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white h-10 w-full"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white h-10">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Non-aktif</SelectItem>
              </SelectContent>
            </Select>

            {activeTab === "kategori" ? (
              <button onClick={openAddKat} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white h-10 px-4 rounded-md hover:bg-blue-700 w-full sm:w-auto font-medium text-sm transition whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Kategori Baru
              </button>
            ) : (
                <button onClick={openAddProdi} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white h-10 px-4 rounded-md hover:bg-blue-700 w-full sm:w-auto font-medium text-sm transition whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Prodi Baru
              </button>
            )}
          </div>
        </div>

        {/* TAB: KATEGORI USAHA */}
        <TabsContent value="kategori" className="space-y-4">
          <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead className="w-[80px]"># Order</TableHead>
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedKategori.length === 0 ? (
                       <TableRow>
                          <TableCell colSpan={4} className="h-40 text-center text-muted-foreground bg-slate-50/50">
                            {searchTerm || statusFilter !== "all" 
                              ? "Data tidak ditemukan berdasarkan filter/pencarian saat ini." 
                              : "Belum ada Kategori Usaha yang diinputkan."}
                          </TableCell>
                       </TableRow>
                    ) : (
                       paginatedKategori.map(item => (
                         <TableRow key={item.id}>
                            <TableCell className="font-mono text-slate-500 bg-slate-50 text-center">{item.order}</TableCell>
                            <TableCell className="font-medium align-middle">{item.name}</TableCell>
                            <TableCell className="align-middle">
                                {item.isActive ? (
                                    <span className="flex w-max items-center gap-1 text-xs text-green-700 font-semibold"><Check className="w-3 h-3" /> Aktif</span>
                                ) : (
                                    <span className="flex w-max items-center gap-1 text-xs text-red-500 font-semibold"><X className="w-3 h-3" /> Non-aktif</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right align-middle">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openEditKat(item)} className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition" title="Ubah"><Edit className="w-4 h-4" /></button>
                                  {item.isActive && (
                                    <button onClick={() => { setDeleteTarget({id: item.id, type: "kategori", name: item.name}); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition" title="Nonaktifkan"><Trash2 className="w-4 h-4" /></button>
                                  )}
                               </div>
                            </TableCell>
                         </TableRow>
                       ))
                    )}
                </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB: PROGRAM STUDI */}
        <TabsContent value="prodi" className="space-y-4">
          <div className="rounded-md border bg-white overflow-x-auto shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead className="w-[80px]"># Order</TableHead>
                        <TableHead>Nama Program Studi</TableHead>
                        <TableHead>Kode / Fakultas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedProdi.length === 0 ? (
                       <TableRow>
                          <TableCell colSpan={5} className="h-40 text-center text-muted-foreground bg-slate-50/50">
                             {searchTerm || statusFilter !== "all" 
                              ? "Data tidak ditemukan berdasarkan filter/pencarian saat ini." 
                              : "Belum ada Program Studi yang diinputkan."}
                          </TableCell>
                       </TableRow>
                    ) : (
                       paginatedProdi.map(item => (
                         <TableRow key={item.id}>
                            <TableCell className="font-mono text-slate-500 bg-slate-50 text-center">{item.order}</TableCell>
                            <TableCell className="font-medium align-middle">{item.name}</TableCell>
                            <TableCell className="align-middle">
                                <div className="text-sm">Kode: <span className="font-semibold text-slate-900">{item.code || '-'}</span></div>
                                <div className="text-xs text-muted-foreground mt-0.5">{item.fakultas || 'Fakultas tidak diset'}</div>
                            </TableCell>
                            <TableCell className="align-middle">
                                {item.isActive ? (
                                    <span className="flex w-max items-center gap-1 text-xs text-green-700 font-semibold"><Check className="w-3 h-3" /> Aktif</span>
                                ) : (
                                    <span className="flex w-max items-center gap-1 text-xs text-red-500 font-semibold"><X className="w-3 h-3" /> Non-aktif</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right align-middle">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openEditProdi(item)} className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition" title="Ubah"><Edit className="w-4 h-4" /></button>
                                  {item.isActive && (
                                    <button onClick={() => { setDeleteTarget({id: item.id, type: "prodi", name: item.name}); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition" title="Nonaktifkan"><Trash2 className="w-4 h-4" /></button>
                                  )}
                               </div>
                            </TableCell>
                         </TableRow>
                       ))
                    )}
                </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="text-sm text-gray-600 font-medium whitespace-nowrap text-center md:text-left w-full md:w-auto">
                Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} dari {totalItems} entri
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium text-slate-500 whitespace-nowrap hidden sm:block">Baris per halaman</Label>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px] bg-white border-slate-300" id="rows-per-page">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center justify-center text-sm font-medium text-slate-700 whitespace-nowrap">
                    Halaman {page} dari {totalPages}
                </div>
                
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(Math.max(1, totalPages), p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setPage(Math.max(1, totalPages))}
                        disabled={page === totalPages || totalPages === 0}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* DIALOG KATEGORI */}
      <Dialog open={isKatDialogOpen} onOpenChange={setIsKatDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
               <DialogTitle className="text-xl">{KatMode === "add" ? "Tambah" : "Edit"} Kategori Usaha</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <Label className="text-slate-700">Nama Kategori <span className="text-red-500">*</span></Label>
                    <Input value={katName} onChange={e => setKatName(e.target.value)} placeholder="Misal: Teknologi dan Digital" className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700">Urutan Tampil (Order)</Label>
                    <Input type="number" value={katOrder} onChange={e => setKatOrder(Number(e.target.value))} className="bg-slate-50" />
                    <p className="text-xs text-muted-foreground">Angka lebih kecil akan tampil lebih dulu di daftar form.</p>
                </div>
                {KatMode === "edit" && (
                   <div className="space-y-2 border-t pt-4 mt-2">
                       <Label className="text-slate-700">Status Aktif</Label>
                       <Select value={katActive ? "1" : "0"} onValueChange={v => setKatActive(v === "1")}>
                           <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                           <SelectContent>
                               <SelectItem value="1">Aktif (Muncul di Form)</SelectItem>
                               <SelectItem value="0">Non-aktif (Disembunyikan)</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>
                )}
            </div>
            <DialogFooter className="border-t pt-4 mt-2">
                <button onClick={() => setIsKatDialogOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 transition">Batal</button>
                <button 
                  onClick={handleSaveKat} 
                  disabled={createKatMut.isPending || updateKatMut.isPending || !katName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {(createKatMut.isPending || updateKatMut.isPending) && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Simpan Kategori
                </button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG PRODI */}
      <Dialog open={isProdiDialogOpen} onOpenChange={setIsProdiDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
               <DialogTitle className="text-xl">{ProdiMode === "add" ? "Tambah" : "Edit"} Program Studi</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <Label className="text-slate-700">Nama Program Studi <span className="text-red-500">*</span></Label>
                    <Input value={prodiName} onChange={e => setProdiName(e.target.value)} placeholder="Misal: Teknik Informatika" className="bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700">Kode Prodi</Label>
                        <Input value={prodiCode} onChange={e => setProdiCode(e.target.value)} placeholder="Misal: TI" className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-700">Order</Label>
                        <Input type="number" value={prodiOrder} onChange={e => setProdiOrder(Number(e.target.value))} className="bg-slate-50" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700">Fakultas</Label>
                    <Input value={prodiFakultas} onChange={e => setProdiFakultas(e.target.value)} placeholder="Misal: FST" className="bg-slate-50" />
                </div>
                {ProdiMode === "edit" && (
                   <div className="space-y-2 border-t pt-4 mt-2">
                       <Label className="text-slate-700">Status Aktif</Label>
                       <Select value={prodiActive ? "1" : "0"} onValueChange={v => setProdiActive(v === "1")}>
                           <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                           <SelectContent>
                               <SelectItem value="1">Aktif (Muncul di Form)</SelectItem>
                               <SelectItem value="0">Non-aktif (Disembunyikan)</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>
                )}
            </div>
            <DialogFooter className="border-t pt-4 mt-2">
                <button onClick={() => setIsProdiDialogOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 transition">Batal</button>
                <button 
                  onClick={handleSaveProdi} 
                  disabled={createProdiMut.isPending || updateProdiMut.isPending || !prodiName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {(createProdiMut.isPending || updateProdiMut.isPending) && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Simpan Program Studi
                </button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DELETE */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
               <AlertTriangle className="w-5 h-5" />
               Nonaktifkan Data
            </DialogTitle>
            <DialogDescription className="pt-3 text-slate-600">
              Apakah Anda yakin ingin menonaktifkan {deleteTarget?.type === "kategori" ? "Kategori" : "Program Studi"} <strong>{deleteTarget?.name}</strong>?
              <br/><br/>
              Data ini <strong>tidak akan dihapus permanen</strong> (karena mungkin terhubung dengan pendaftaran lama pengguna), tapi akan disembunyikan dari pilihan registrasi pengguna baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 border-t pt-4">
            <button 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-slate-300 text-sm font-medium hover:bg-slate-50 text-slate-700 transition"
            >Batal</button>
            <button
                onClick={confirmDelete}
                disabled={deleteKatMut.isPending || deleteProdiMut.isPending}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 gap-2 transition"
            >
                {(deleteKatMut.isPending || deleteProdiMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Nonaktifkan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
