'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { usePrograms } from '@/hooks/usePrograms';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProgramsCMSPage() {
  const qc = useQueryClient();
  const { data: programsData, isLoading } = usePrograms({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('INKUBASI');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Daftar Sekarang');
  const [ctaUrl, setCtaUrl] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  const programs: any[] = (programsData as any)?.data || programsData || [];

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/programs', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program baru berhasil ditambahkan');
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menambahkan program');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const res = await apiClient.put(`/programs/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program berhasil diperbarui');
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui program');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/programs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program berhasil dihapus');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menghapus program');
    },
  });

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setTitle('');
    setSlug('');
    setType('INKUBASI');
    setDescription('');
    setCtaText('Daftar Sekarang');
    setCtaUrl('');
    setRequiresAuth(true);
    setIsActive(true);
    setOrder(0);
    setDialogOpen(true);
  };

  const handleOpenEdit = (prog: any) => {
    setEditingProgram(prog);
    setTitle(prog.title);
    setSlug(prog.slug);
    setType(prog.type || 'INKUBASI');
    setDescription(prog.description);
    setCtaText(prog.ctaText || 'Daftar Sekarang');
    setCtaUrl(prog.ctaUrl || '');
    setRequiresAuth(prog.requiresAuth ?? true);
    setIsActive(prog.isActive ?? true);
    setOrder(prog.order || 0);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !description) {
      toast.error('Mohon lengkapi judul, slug, dan deskripsi');
      return;
    }

    const payload = {
      title,
      slug,
      type,
      description,
      ctaText,
      ctaUrl: ctaUrl || undefined,
      requiresAuth,
      isActive,
      order,
    };

    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus program "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Manajemen Program (CMS)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola program utama IBISTEK UTY yang tampil di landing page dan sistem pendaftaran.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Program
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari program berdasarkan judul atau tipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 text-sm p-0 shadow-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            Tidak ada program yang ditemukan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Judul Program</TableHead>
                <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                <TableHead className="font-semibold text-gray-700">CTA Button</TableHead>
                <TableHead className="font-semibold text-gray-700">Akses Auth</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((prog) => (
                <TableRow key={prog.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-bold text-gray-900">{prog.title}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">/{prog.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-pink-100 text-pink-800 border-0 font-semibold text-xs">
                      {prog.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    <span className="font-medium text-gray-800">{prog.ctaText || 'Daftar Sekarang'}</span>
                    {prog.ctaUrl && <span className="text-gray-400 block text-[11px] truncate max-w-[150px]">{prog.ctaUrl}</span>}
                  </TableCell>
                  <TableCell>
                    {prog.requiresAuth ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                        <Lock className="w-3.5 h-3.5" /> Wajib Login
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Publik</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        prog.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-0'
                          : 'bg-gray-100 text-gray-600 border-0'
                      }
                    >
                      {prog.isActive ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(prog)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-pink-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prog.id, prog.title)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* MODAL CREATE / EDIT PROGRAM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? 'Edit Program IBISTEK' : 'Tambah Program Baru'}
              </DialogTitle>
              <DialogDescription>
                Isi konfigurasi program untuk ditampilkan di website IBISTEK.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="title" className="text-xs font-semibold">Judul Program *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingProgram) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  placeholder="e.g. Program Inkubasi Bisnis"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug" className="text-xs font-semibold">Slug URL *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. inkubasi-bisnis"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-xs font-semibold">Tipe Program *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INKUBASI">INKUBASI</SelectItem>
                      <SelectItem value="KONSULTASI">KONSULTASI</SelectItem>
                      <SelectItem value="KREDENSIAL">KREDENSIAL</SelectItem>
                      <SelectItem value="EVENT">EVENT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="desc" className="text-xs font-semibold">Deskripsi Program *</Label>
                <Textarea
                  id="desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan deskripsi lengkap program..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText" className="text-xs font-semibold">Teks Tombol (CTA)</Label>
                  <Input
                    id="ctaText"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Daftar Sekarang"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaUrl" className="text-xs font-semibold">Custom Redirect URL (Opsional)</Label>
                  <Input
                    id="ctaUrl"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="e.g. /dashboard/inkubasi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresAuth"
                    checked={requiresAuth}
                    onChange={(e) => setRequiresAuth(e.target.checked)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <Label htmlFor="requiresAuth" className="text-xs font-semibold cursor-pointer">
                    Wajib Login (Kunci Gembok)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="text-xs font-semibold cursor-pointer">
                    Aktifkan Program
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Simpan Program
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
