"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Filter,
  Users,
  Mail,
  Linkedin,
  Instagram,
  GraduationCap,
  Building2,
  Eye,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
type TeamType = "LEADER" | "STAFF" | "MENTOR" | "MEMBER";

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
  title: string;
  type: TeamType;
  division: string;
  image: string;
  bio: string;
  email: string;
  linkedin: string;
  instagram: string;
  batch: string;
  prodi: string;
  order: string;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: "",
    title: "",
    type: "MEMBER",
    division: "",
    image: "",
    bio: "",
    email: "",
    linkedin: "",
    instagram: "",
    batch: "",
    prodi: "",
    order: "0",
    isActive: true,
  });

  // Fetch team members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/team`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.division?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || member.type === filterType;
    const matchesDivision = filterDivision === "all" || member.division === filterDivision;
    
    return matchesSearch && matchesType && matchesDivision;
  });

  // Get unique divisions
  const divisions = Array.from(new Set(members.map(m => m.division).filter(Boolean)));

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        title: formData.title || undefined,
        type: formData.type,
        division: formData.division || undefined,
        image: formData.image || undefined,
        bio: formData.bio || undefined,
        email: formData.email || undefined,
        linkedin: formData.linkedin || undefined,
        instagram: formData.instagram || undefined,
        batch: formData.batch ? parseInt(formData.batch) : undefined,
        prodi: formData.prodi || undefined,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      };

      const url = editingMember 
        ? `${API_URL}/team/${editingMember.id}`
        : `${API_URL}/team`;
      
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMembers();
        handleCloseDialog();
      } else {
        alert(data.error || "Failed to save team member");
      }
    } catch (error) {
      console.error("Failed to save team member:", error);
      alert("Failed to save team member");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingMember) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/team/${deletingMember.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMembers();
        setIsDeleteDialogOpen(false);
        setDeletingMember(null);
      } else {
        alert(data.error || "Failed to delete team member");
      }
    } catch (error) {
      console.error("Failed to delete team member:", error);
      alert("Failed to delete team member");
    }
  };

  // Handle open create dialog
  const handleOpenCreateDialog = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      title: "",
      type: "MEMBER",
      division: "",
      image: "",
      bio: "",
      email: "",
      linkedin: "",
      instagram: "",
      batch: "",
      prodi: "",
      order: "0",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  // Handle open edit dialog
  const handleOpenEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title || "",
      type: member.type,
      division: member.division || "",
      image: member.image || "",
      bio: member.bio || "",
      email: member.email || "",
      linkedin: member.linkedin || "",
      instagram: member.instagram || "",
      batch: member.batch?.toString() || "",
      prodi: member.prodi || "",
      order: member.order.toString(),
      isActive: member.isActive,
    });
    setIsDialogOpen(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMember(null);
  };

  // Handle open delete dialog
  const handleOpenDeleteDialog = (member: TeamMember) => {
    setDeletingMember(member);
    setIsDeleteDialogOpen(true);
  };

  // Handle open view dialog
  const handleOpenViewDialog = (member: TeamMember) => {
    setViewingMember(member);
  };

  // Get badge color based on type
  const getTypeBadgeColor = (type: TeamType) => {
    switch (type) {
      case "LEADER":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "STAFF":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "MENTOR":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "MEMBER":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Team Management
          </h2>
          <p className="text-gray-500 mt-2">
            Kelola semua anggota tim IBISTEK
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Leaders</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.type === "LEADER").length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-100">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.type === "STAFF").length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari nama, email, atau divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="LEADER">Leader</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDivision} onValueChange={setFilterDivision}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Divisi</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division!}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Division
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.title || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={cn("border", getTypeBadgeColor(member.type))}>
                        {member.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {member.division || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {member.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {member.linkedin && (
                            <a 
                              href={member.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {member.instagram && (
                            <a 
                              href={member.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.batch || member.prodi ? (
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <div>
                            {member.prodi && <div>{member.prodi}</div>}
                            {member.batch && <div className="text-xs text-gray-500">Batch {member.batch}</div>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={member.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenViewDialog(member)}
                          className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(member)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(member)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Team Member" : "Tambah Team Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember 
                ? "Update informasi team member" 
                : "Tambahkan team member baru ke dalam sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Jabatan</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., CEO, Head of Marketing"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value as TeamType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEADER">Leader</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MENTOR">Mentor</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Divisi</Label>
                <Input
                  id="division"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="e.g., Marketing, Development"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Deskripsi singkat tentang member..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Foto Profile</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          // Upload logic would go here
                          const formDataUpload = new FormData();
                          formDataUpload.append('file', file);
                          formDataUpload.append('folder', 'team');

                          const token = localStorage.getItem("token");
                          // Show loading state if needed
                          
                          const response = await fetch(`${API_URL}/upload`, {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formDataUpload,
                          });

                          const data = await response.json();
                          if (data.success) {
                            setFormData(prev => ({ ...prev, image: data.data.url }));
                          } else {
                            alert("Failed to upload image");
                          }
                        } catch (error) {
                          console.error("Upload error:", error);
                          alert("Error uploading image");
                        }
                      }}
                      accept="image/*"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                      </svg>
                    </Button>
                  </div>
                </div>
                {formData.image && (
                  <>
                    <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border bg-gray-50">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-center text-red-500 p-1">Failed to load</span>';
                        }}
                      />
                    </div>
                    <div className="mt-1">
                      <a 
                        href={formData.image} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Buka Gambar <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch (Angkatan)</Label>
                <Input
                  id="batch"
                  type="number"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prodi">Program Studi</Label>
                <Input
                  id="prodi"
                  value={formData.prodi}
                  onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                  placeholder="e.g., Teknik Informatika"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order">Order (Urutan)</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select 
                  value={formData.isActive ? "true" : "false"} 
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Batal
              </Button>
              <Button type="submit">
                {editingMember ? "Update" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!viewingMember} onOpenChange={(open) => !open && setViewingMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Team Member</DialogTitle>
          </DialogHeader>
          
          {viewingMember && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column: Image & Main Info */}
              <div className="md:col-span-1 space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border relative group">
                  {viewingMember.image ? (
                    <img 
                      src={viewingMember.image} 
                      alt={viewingMember.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/400?text=Error";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-purple-600">
                      <Users className="w-16 h-16" />
                    </div>
                  )}
                  {viewingMember.image && (
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={viewingMember.image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-gray-100 flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> Buka Full
                        </a>
                     </div>
                  )}
                </div>
                
                <div className="space-y-2 text-center">
                  <h3 className="font-bold text-xl text-gray-900">{viewingMember.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className={getTypeBadgeColor(viewingMember.type)}>
                      {viewingMember.type}
                    </Badge>
                    <Badge variant="outline" className={viewingMember.isActive ? "text-green-600 bg-green-50 border-green-200" : "text-gray-500 bg-gray-50"}>
                      {viewingMember.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  {viewingMember.linkedin && (
                    <a href={viewingMember.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {viewingMember.instagram && (
                    <a href={viewingMember.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {viewingMember.email && (
                    <a href={`mailto:${viewingMember.email}`} className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Jabatan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Jabatan</div>
                      <div className="font-medium">{viewingMember.title || "-"}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">Divisi</div>
                      <div className="font-medium">{viewingMember.division || "-"}</div>
                    </div>
                  </div>
                </div>

                {viewingMember.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Bio</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                      {viewingMember.bio}
                    </p>
                  </div>
                )}

                {(viewingMember.prodi || viewingMember.batch) && (
                   <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Akademik</h4>
                    <div className="flex gap-4">
                      {viewingMember.prodi && (
                        <div className="p-3 bg-gray-50 rounded-lg flex-1">
                          <div className="text-xs text-gray-500">Program Studi</div>
                          <div className="font-medium flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            {viewingMember.prodi}
                          </div>
                        </div>
                      )}
                      {viewingMember.batch && (
                        <div className="p-3 bg-gray-50 rounded-lg flex-1">
                          <div className="text-xs text-gray-500">Angkatan (Batch)</div>
                          <div className="font-medium">{viewingMember.batch}</div>
                        </div>
                      )}
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
             <Button onClick={() => setViewingMember(null)}>
               Tutup
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Team Member</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deletingMember?.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingMember(null);
              }}
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
