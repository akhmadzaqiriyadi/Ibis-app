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
  Upload,
  ExternalLink,
  Users,
  Mail,
  Linkedin,
  Instagram,
  GraduationCap,
  Building2,
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

// Types
type TeamType = 'LEADER' | 'STAFF' | 'MENTOR' | 'MEMBER';

interface TeamMember {
  id: string;
  name: string;
  title?: string;
  type: TeamType;
  division?: string;
  image?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  batch?: number;
  prodi?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamMemberFormData {
  name: string;
  title?: string;
  type: TeamType;
  division?: string;
  image?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  batch?: number;
  prodi?: string;
  order: number;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const getTypeBadgeStyle = (type: TeamType) => {
  const styles = {
    LEADER: 'bg-purple-100 text-purple-700 border-purple-300',
    STAFF: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    MENTOR: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    MEMBER: 'bg-blue-100 text-blue-700 border-blue-300',
  };
  return styles[type] || 'bg-blue-100 text-blue-700 border-blue-300';
};

const getStatusBadgeStyle = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-700 border-green-300'
    : 'bg-red-100 text-red-700 border-red-300';
};

export default function TeamManagementPage() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formType, setFormType] = useState<TeamType>('MEMBER');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/team`, { headers });
      const result = await response.json();
      return result.data;
    },
  });

  const members: TeamMember[] = membersData || [];
  const divisions = Array.from(new Set(members.map(m => m.division).filter(Boolean))) as string[];

  const saveMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const url = editingMember ? `${API_URL}/team/${editingMember.id}` : `${API_URL}/team`;
      const method = editingMember ? 'PUT' : 'POST';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(url, { method, headers, body: JSON.stringify(data) });
      const responseData = await response.json();
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setIsDialogOpen(false);
      setEditingMember(null);
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/team/${id}`, { method: 'DELETE', headers });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setIsDeleteDialogOpen(false);
      setDeletingMember(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const getStringValue = (key: string) => {
      const value = formData.get(key) as string;
      return value && value.trim() !== '' ? value : undefined;
    };
    const data: TeamMemberFormData = {
      name: formData.get('name') as string,
      title: getStringValue('title'),
      type: formType,
      division: getStringValue('division'),
      image: getStringValue('image'),
      bio: getStringValue('bio'),
      email: getStringValue('email'),
      linkedin: getStringValue('linkedin'),
      instagram: getStringValue('instagram'),
      batch: formData.get('batch') ? parseInt(formData.get('batch') as string) : undefined,
      prodi: getStringValue('prodi'),
      order: formData.get('order') ? parseInt(formData.get('order') as string) : 0,
      isActive: formIsActive,
    };
    saveMutation.mutate(data);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'team');
      
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_URL}/upload`, { 
        method: 'POST', 
        headers, 
        body: formDataUpload 
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setImageUrl(data.data.url);
      } else {
        console.error('Upload response:', data);
        alert(data.error || data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.division?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || member.type === typeFilter;
    const matchesDivision = divisionFilter === 'all' || member.division === divisionFilter;
    return matchesSearch && matchesType && matchesDivision;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Team Management</h2>
        <p className="text-muted-foreground mt-2">Kelola semua anggota tim IBISTEK</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Cari nama, email, atau divisi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="LEADER">Leader</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="MENTOR">Mentor</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Divisi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Divisi</SelectItem>
            {divisions.map((division) => (<SelectItem key={division} value={division}>{division}</SelectItem>))}
          </SelectContent>
        </Select>
        <button onClick={() => { setEditingMember(null); setFormType('MEMBER'); setFormIsActive(true); setImageUrl(''); setIsDialogOpen(true); }} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-linear-3 text-white hover:scale-105 h-9 px-4 py-2 transition-all duration-1200 ease-in-out">
          <Plus className="h-4 w-4" /><span>Tambah Member</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-x-auto">
        <Table>
          <TableHeader className="bg-linear-2">
            <TableRow>
              <TableHead className="w-20 text-light">Image</TableHead>
              <TableHead className="min-w-[200px] text-light">Member</TableHead>
              <TableHead className="min-w-[100px] text-light">Type</TableHead>
              <TableHead className="min-w-[140px] text-light">Division</TableHead>
              <TableHead className="min-w-[200px] text-light">Contact</TableHead>
              <TableHead className="min-w-[160px] text-light">Student Info</TableHead>
              <TableHead className="min-w-[100px] text-light">Status</TableHead>
              <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center"><div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></TableCell></TableRow>
            ) : paginatedMembers.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Tidak ada data team member.</TableCell></TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-slate-100">
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-linear-2 flex-shrink-0">
                      {member.image && member.image.trim() !== '' ? (
                        <img src={member.image} alt={member.name} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">{member.name.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium min-w-[200px]">
                    <div><div className="font-medium text-gray-900">{member.name}</div><div className="text-sm text-gray-500">{member.title || '-'}</div></div>
                  </TableCell>
                  <TableCell><Badge className={`${getTypeBadgeStyle(member.type)} px-2 py-1 font-medium border`}>{member.type}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-2 text-sm text-dark font-medium">{member.division || '-'}</div></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {member.linkedin && (<a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"><Linkedin className="w-3.5 h-3.5" /></a>)}
                      {member.instagram && (<a href={member.instagram} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"><Instagram className="w-3.5 h-3.5" /></a>)}
                      {member.email && (<a href={`mailto:${member.email}`} className="w-7 h-7 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"><Mail className="w-3.5 h-3.5" /></a>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.batch || member.prodi ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-dark">
                      <div>{member.prodi && <div className="text-sm">{member.prodi}</div>}{member.batch && <div className="text-xs text-gray-500">Batch {member.batch}</div>}</div>
                      </div>
                    ) : (<span className="text-gray-400">-</span>)}
                  </TableCell>
                  <TableCell><Badge className={`${getStatusBadgeStyle(member.isActive)} px-2 py-1 font-medium border`}>{member.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 data-[state=open]:bg-muted text-muted-foreground"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Open menu</span></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => { setViewingMember(member); setIsViewDialogOpen(true); }} className="cursor-pointer hover:bg-slate-100">View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingMember(member); setFormType(member.type); setFormIsActive(member.isActive); setImageUrl(member.image || ''); setIsDialogOpen(true); }} className="cursor-pointer hover:bg-slate-100">Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-slate-100" onClick={() => { setDeletingMember(member); setIsDeleteDialogOpen(true); }}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-gray-600">Menampilkan {paginatedMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} sampai {Math.min(currentPage * pageSize, filteredMembers.length)} dari {filteredMembers.length} data</div>
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
            <Select value={`${pageSize}`} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-20" id="rows-per-page"><SelectValue placeholder={pageSize} /></SelectTrigger>
              <SelectContent side="top">{[10, 20, 30, 40, 50].map((size) => (<SelectItem key={size} value={`${size}`}>{size}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">Page {currentPage} of {totalPages || 1}</div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="hidden h-8 w-8 p-0 lg:flex inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"><span className="sr-only">Go to first page</span><ChevronsLeft className="h-4 w-4" /></button>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"><span className="sr-only">Go to previous page</span><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"><span className="sr-only">Go to next page</span><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="hidden h-8 w-8 lg:flex inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"><span className="sr-only">Go to last page</span><ChevronsRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Team Member' : 'Tambah Team Member'}</DialogTitle>
            <DialogDescription>{editingMember ? 'Update informasi team member' : 'Tambahkan team member baru ke dalam sistem'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama *</Label>
                <Input id="name" name="name" defaultValue={editingMember?.name} required placeholder="Nama lengkap" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Jabatan</Label>
                <Input id="title" name="title" defaultValue={editingMember?.title || ''} placeholder="e.g., CEO, Head of Marketing" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipe *</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as TeamType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEADER">Leader</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MENTOR">Mentor</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="division">Divisi</Label>
                <Input id="division" name="division" defaultValue={editingMember?.division || ''} placeholder="e.g., Marketing, Development" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={editingMember?.bio || ''} rows={3} placeholder="Deskripsi singkat tentang member..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingMember?.email || ''} placeholder="email@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Foto Profile</Label>
                <div className="flex gap-2">
                  <Input id="image" name="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <div className="relative">
                    <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} accept="image/*" />
                    <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onLoad={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onError={(e) => { 
                          console.error('Image failed to load:', imageUrl);
                          e.currentTarget.style.display = 'none'; 
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.2s' }}
                      />
                      <span className="absolute text-xs text-gray-400 pointer-events-none">Loading...</span>
                    </div>
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">Buka Gambar <ExternalLink className="w-3 h-3" /></a>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input id="linkedin" name="linkedin" defaultValue={editingMember?.linkedin || ''} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input id="instagram" name="instagram" defaultValue={editingMember?.instagram || ''} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch">Batch (Angkatan)</Label>
                <Input id="batch" name="batch" type="number" defaultValue={editingMember?.batch || ''} placeholder="2024" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prodi">Program Studi</Label>
                <Input id="prodi" name="prodi" defaultValue={editingMember?.prodi || ''} placeholder="e.g., Teknik Informatika" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="order">Order (Urutan)</Label>
                <Input id="order" name="order" type="number" defaultValue={editingMember?.order || 0} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formIsActive ? 'true' : 'false'} onValueChange={(v) => setFormIsActive(v === 'true')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMember ? 'Update' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto left-[55%] md:left-[60%]">
          <DialogHeader>
            <DialogTitle>Detail Team Member</DialogTitle>
          </DialogHeader>
          {viewingMember && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-linear-2 border relative group">
                  {viewingMember.image ? (
                    <img src={viewingMember.image} alt={viewingMember.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-purple-600">
                      <Users className="w-16 h-16" />
                    </div>
                  )}
                  {viewingMember.image && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={viewingMember.image} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" /> Buka Full
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-bold text-xl text-gray-900">{viewingMember.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className={getTypeBadgeStyle(viewingMember.type)}>{viewingMember.type}</Badge>
                    <Badge className={getStatusBadgeStyle(viewingMember.isActive)}>{viewingMember.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  {viewingMember.linkedin && (<a href={viewingMember.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"><Linkedin className="w-4 h-4" /></a>)}
                  {viewingMember.instagram && (<a href={viewingMember.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"><Instagram className="w-4 h-4" /></a>)}
                  {viewingMember.email && (<a href={`mailto:${viewingMember.email}`} className="w-9 h-9 rounded-full bg-linear-2 flex items-center justify-center text-light hover:scale-110 transition-all"><Mail className="w-4 h-4" /></a>)}
                </div>
              </div>
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Detail Biodata Member</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Jabatan</div><div className="font-medium text-sm">{viewingMember.title || '-'}</div></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Divisi</div><div className="font-medium text-sm">{viewingMember.division || '-'}</div></div>
                  </div>
                </div>
                {viewingMember.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Bio</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">{viewingMember.bio}</p>
                  </div>
                )}
                {(viewingMember.prodi || viewingMember.batch) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Akademik</h4>
                    <div className="flex gap-4">
                      {viewingMember.prodi && (<div className="p-3 bg-gray-50 rounded-lg flex-1"><div className="text-xs text-gray-500">Program Studi</div><div className="font-medium text-sm flex items-center gap-2">{viewingMember.prodi}</div></div>)}
                      {viewingMember.batch && (<div className="p-3 bg-gray-50 rounded-lg flex-1"><div className="text-xs text-gray-500">Angkatan (Batch)</div><div className="font-medium text-sm">{viewingMember.batch}</div></div>)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-4 border-t">
                  <div>Created: {new Date(viewingMember.createdAt).toLocaleDateString()}</div>
                  <div className="text-right">Last Updated: {new Date(viewingMember.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Team Member</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus <strong>{deletingMember?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setDeletingMember(null); }}>Batal</Button>
            <Button variant="primary" onClick={() => deletingMember && deleteMutation.mutate(deletingMember.id)} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}