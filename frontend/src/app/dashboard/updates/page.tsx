'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useUpdates, Update } from '@/hooks/useUpdates';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { getSafeImageUrl } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import Link from 'next/link';

export default function UpdatesCMSPage() {
  const qc = useQueryClient();
  const { data: updatesResponse, isLoading } = useUpdates({ limit: 50 });
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Update | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Berita');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const updatesData: Update[] =
    (updatesResponse as any)?.data ||
    (updatesResponse as any)?.items ||
    updatesResponse ||
    [];

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/updates', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      toast.success('Berita baru berhasil diterbitkan');
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal membuat berita');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const res = await apiClient.put(`/updates/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      toast.success('Berita berhasil diperbarui');
      setDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui berita');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/updates/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      toast.success('Berita berhasil dihapus');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menghapus berita');
    },
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setSlug('');
    setCategory('Berita');
    setSummary('');
    setContent('');
    setImage('');
    setIsPublished(true);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: Update) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setCategory(item.category || 'Berita');
    setSummary(item.summary);
    setContent(item.content || '');
    setImage(item.image || '');
    setIsPublished(item.isPublished);
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'updates');

    setUploadingImage(true);
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        setImage(uploadedUrl);
        toast.success('Gambar berhasil diunggah');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !summary) {
      toast.error('Mohon lengkapi judul, slug, dan ringkasan');
      return;
    }

    const payload = {
      title,
      slug,
      category,
      summary,
      content,
      image: image || undefined,
      isPublished,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus artikel "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  const filteredUpdates = updatesData.filter(
    (u) =>
      u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.category && u.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Manajemen Berita &amp; Updates (CMS)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola publikasi berita kegiatan, sosialisasi lomba/hibah, dan agenda IBISTEK UTY.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tulis Berita Baru
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari berita berdasarkan judul atau kategori..."
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
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            Tidak ada berita yang ditemukan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Judul &amp; Ringkasan</TableHead>
                <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
                <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUpdates.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50">
                  <TableCell className="max-w-md">
                    <div className="font-bold text-gray-900 line-clamp-1">{item.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.summary}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">/{item.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.category || 'Berita'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.isPublished
                          ? 'bg-emerald-100 text-emerald-800 border-0'
                          : 'bg-gray-100 text-gray-600 border-0'
                      }
                    >
                      {item.isPublished ? 'Tayang' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/updates/${item.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-emerald-600"
                          title="Lihat Halaman Publik"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-amber-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
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

      {/* MODAL CREATE / EDIT UPDATE */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Berita / Kegiatan' : 'Tulis Berita Baru'}
              </DialogTitle>
              <DialogDescription>
                Informasi ini akan langsung tampil di halaman landing page IBISTEK.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="title" className="text-xs font-semibold">Judul Berita *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingItem) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  placeholder="e.g. IBISTEK Sukses Gelar Sosialisasi P2MW 2026"
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
                    placeholder="e.g. sosialisasi-p2mw-2026"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-xs font-semibold">Kategori *</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Berita, Lomba, Seminar, P2MW"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="summary" className="text-xs font-semibold">Ringkasan Singkat (Summary) *</Label>
                <Textarea
                  id="summary"
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="1-2 kalimat pengantar untuk kartu berita..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-xs font-semibold">Isi Artikel Lengkap</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi berita atau narasi kegiatan secara lengkap di sini..."
                />
              </div>

              {/* Upload Gambar */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Poster / Foto Berita</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <div className="flex items-center text-xs text-amber-600 gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </div>
                  )}
                </div>
                {image && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center shrink-0">
                      <img
                        src={getSafeImageUrl(image, 'Thumbnail', 'cover')}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-emerald-600 flex items-center gap-1 truncate max-w-md">
                      <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{image}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <Label htmlFor="isPublished" className="text-xs font-semibold cursor-pointer">
                  Publikasikan artikel (Tayang untuk umum)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Simpan Berita
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
