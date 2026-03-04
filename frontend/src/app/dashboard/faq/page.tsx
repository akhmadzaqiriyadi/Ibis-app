'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Loader2,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/stores/auth-store';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const FAQ_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'program', label: 'Program' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryBadgeStyle = (category: string) => {
  const styles: Record<string, string> = {
    general: 'bg-slate-100 text-slate-700 border-slate-300',
    program: 'bg-purple-100 text-purple-700 border-purple-300',
  };
  return styles[category?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  // Filter & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [viewingFaq, setViewingFaq] = useState<FAQ | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);

  // Form controlled selects
  const [formCategory, setFormCategory] = useState<string>('general');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/faq`);
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      const result = await response.json();
      return result.data as FAQ[];
    },
  });

  const faqs: FAQ[] = faqsData || [];

  // ── Mutations ────────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (data: FAQFormData) => {
      const url = editingFaq ? `${API_URL}/faq/${editingFaq.id}` : `${API_URL}/faq`;
      const method = editingFaq ? 'PUT' : 'POST';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(url, { method, headers, body: JSON.stringify(data) });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Failed to save FAQ');
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsDialogOpen(false);
      setEditingFaq(null);
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/faq/${id}`, { method: 'DELETE', headers });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsDeleteDialogOpen(false);
      setDeletingFaq(null);
    },
  });

  // ── Form submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: FAQFormData = {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      category: formCategory,
      order: formData.get('order') ? parseInt(formData.get('order') as string) : 0,
      isActive: formIsActive,
    };
    saveMutation.mutate(data);
  };

  const openAdd = () => {
    setEditingFaq(null);
    setFormCategory('general');
    setFormIsActive(true);
    setIsDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormCategory(faq.category);
    setFormIsActive(faq.isActive);
    setIsDialogOpen(true);
  };

  // ── Filter & Pagination ───────────────────────────────────────────────────────
  const filtered = faqs.filter((faq) => {
    const matchSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? faq.isActive : !faq.isActive);
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = faqs.filter((f) => f.isActive).length;
  const inactiveCount = faqs.filter((f) => !f.isActive).length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">FAQ (Frequently Asked Questions)</h2>
        <p className="text-muted-foreground mt-2">Kelola pertanyaan yang sering diajukan di halaman utama disini</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari pertanyaan atau jawaban..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-8"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {FAQ_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-linear-3 text-white hover:scale-105 h-9 px-4 py-2 transition-all duration-200 ease-in-out"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah FAQ</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-x-auto">
        <Table>
          <TableHeader className="bg-linear-2">
            <TableRow>
              <TableHead className="w-10 text-light">#</TableHead>
              <TableHead className="min-w-[280px] text-light">Pertanyaan</TableHead>
              <TableHead className="min-w-[350px] text-light">Jawaban</TableHead>
              <TableHead className="min-w-[130px] text-light">Kategori</TableHead>
              <TableHead className="min-w-[80px] text-light text-center">Order</TableHead>
              <TableHead className="min-w-[90px] text-light text-center">Status</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Tidak ada FAQ ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((faq, idx) => (
                <TableRow key={faq.id} className="hover:bg-slate-50">
                  <TableCell className="text-sm text-gray-400 font-medium">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium min-w-[280px]">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-900 line-clamp-2 text-sm font-semibold leading-relaxed">
                        {faq.question}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[350px]">
                    <span className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {faq.answer}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryBadgeStyle(faq.category)} px-2 py-1 capitalize font-medium border text-xs`}>
                      {FAQ_CATEGORIES.find((c) => c.value === faq.category)?.label || faq.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium text-gray-700">
                    {faq.order}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {faq.isActive ? (
                        <Badge className="bg-green-100 text-green-700 border border-green-300 px-2 py-1 text-xs font-medium">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border border-red-300 px-2 py-1 text-xs font-medium">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 data-[state=open]:bg-muted text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={() => { setViewingFaq(faq); setIsViewDialogOpen(true); }}
                          className="cursor-pointer hover:bg-slate-100"
                        >
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEdit(faq)}
                          className="cursor-pointer hover:bg-slate-100"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer hover:bg-slate-100"
                          onClick={() => { setDeletingFaq(faq); setIsDeleteDialogOpen(true); }}
                        >
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-gray-600">
          Menampilkan {paginated.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} sampai{' '}
          {Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} data
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}
            >
              <SelectTrigger className="h-8 w-20" id="rows-per-page">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="hidden h-8 w-8 p-0 lg:flex inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <span className="sr-only">First page</span>
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <span className="sr-only">Next page</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="hidden h-8 w-8 lg:flex inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <span className="sr-only">Last page</span>
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); setEditingFaq(null); } }}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}</DialogTitle>
            <DialogDescription>
              {/* {editingFaq ? 'Perbarui pertanyaan dan jawaban yang ingin diubah.' : 'Isi pertanyaan dan jawaban untuk FAQ baru.'} */}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-5 py-4">
            {/* Question */}
            <div className="grid gap-2">
              <Label htmlFor="question">Pertanyaan *</Label>
              <Textarea
                id="question"
                name="question"
                defaultValue={editingFaq?.question || ''}
                required
                rows={3}
                placeholder="Tulis pertanyaan yang sering diajukan..."
              />
            </div>

            {/* Answer */}
            <div className="grid gap-2">
              <Label htmlFor="answer">Jawaban *</Label>
              <Textarea
                id="answer"
                name="answer"
                defaultValue={editingFaq?.answer || ''}
                required
                rows={5}
                placeholder="Tulis jawaban yang jelas dan informatif..."
              />
            </div>

            {/* Category & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order (Urutan)</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={editingFaq?.order ?? 0}
                  min={0}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="isActive">Status Publikasi</Label>
              <Select value={formIsActive ? 'true' : 'false'} onValueChange={(v) => setFormIsActive(v === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active (Tampil di landing page)</SelectItem>
                  <SelectItem value="false">Inactive (Tersembunyi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsDialogOpen(false); setEditingFaq(null); }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-linear-3 text-white hover:opacity-90">
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFaq ? 'Update FAQ' : 'Tambah FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── View Detail Dialog ────────────────────────────────────────────────── */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail FAQ</DialogTitle>
          </DialogHeader>
          {viewingFaq && (
            <div className="space-y-5">
              {/* Category & Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getCategoryBadgeStyle(viewingFaq.category)} px-3 py-1 capitalize font-medium border`}>
                  {FAQ_CATEGORIES.find((c) => c.value === viewingFaq.category)?.label || viewingFaq.category}
                </Badge>
                {viewingFaq.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border border-green-300 px-3 py-1 font-medium">Active</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border border-red-300 px-3 py-1 font-medium">Inactive</Badge>
                )}
                <span className="ml-auto text-xs text-gray-400">Order: {viewingFaq.order}</span>
              </div>

              {/* Question */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Pertanyaan</div>
                    <p className="text-gray-900 font-medium leading-relaxed">{viewingFaq.question}</p>
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ChevronDown className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Jawaban</div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{viewingFaq.answer}</p>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-2 border-t">
                <div>Dibuat: {new Date(viewingFaq.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="text-right">Diperbarui: {new Date(viewingFaq.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
            {viewingFaq && (
              <Button
                onClick={() => { setIsViewDialogOpen(false); openEdit(viewingFaq); }}
                className="bg-linear-3 text-white hover:opacity-90"
              >
                Edit FAQ Ini
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus FAQ</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus FAQ ini?
              <br />
              <span className="font-semibold text-gray-800 mt-2 block line-clamp-2">
                &quot;{deletingFaq?.question}&quot;
              </span>
              <br />
              Tindakan ini <span className="text-red-600 font-semibold">tidak dapat dibatalkan</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setIsDeleteDialogOpen(false); setDeletingFaq(null); }}
            >
              Batal
            </Button>
            <Button
              onClick={() => deletingFaq && deleteMutation.mutate(deletingFaq.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
