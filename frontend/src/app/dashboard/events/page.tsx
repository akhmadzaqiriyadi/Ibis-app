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
  CircleCheck,
  Loader2,
  Upload,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  endDate?: string | null;
  location?: string | null;
  image?: string | null;
  category: string;
  status: EventStatus;
  maxParticipants?: number | null;
  registrationUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  image?: string;
  category: string;
  status: EventStatus;
  maxParticipants?: number;
  registrationUrl?: string;
  isPublished: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Helper function to get status badge styling
const getStatusBadgeStyle = (status: EventStatus) => {
  const styles = {
    UPCOMING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    ONGOING: 'bg-primary/90 text-primary-foreground border-primary',
    COMPLETED: 'bg-green-100 text-green-700 border-green-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  };
  return styles[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};

// Helper function to get category badge styling
const getCategoryBadgeStyle = (category: string) => {
  const styles: Record<string, string> = {
    workshop: 'bg-purple-100 text-purple-700 border-purple-300',
    seminar: 'bg-orange-100 text-orange-700 border-orange-300',
    networking: 'bg-pink-100 text-pink-700 border-pink-300',
    sosialisasi: 'bg-teal-100 text-teal-700 border-teal-300',
  };
  return styles[category.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
};

export default function EventsPage() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore(); // Get token from auth store
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Form states for controlled Select components
  const [formCategory, setFormCategory] = useState<string>('workshop');
  const [formStatus, setFormStatus] = useState<EventStatus>('UPCOMING');
  const [formIsPublished, setFormIsPublished] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Fetch events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const result = await response.json();
      return result.data;
    },
  });

  const events = eventsData?.data || [];

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      console.log('=== MUTATION START ===');
      console.log('editingEvent:', editingEvent);
      console.log('Data to send:', data);
      console.log('Token:', token);
      
      const url = editingEvent 
        ? `${API_URL}/events/${editingEvent.id}`
        : `${API_URL}/events`;
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      console.log('URL:', url);
      console.log('Method:', method);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.message || 'Failed to save event');
      }
      
      return responseData;
    },
    onSuccess: (data) => {
      console.log('=== MUTATION SUCCESS ===');
      console.log('Success data:', data);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsDialogOpen(false);
      setEditingEvent(null);
    },
    onError: (error) => {
      console.error('=== MUTATION ERROR ===');
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Helper to convert empty string to undefined
    const getStringValue = (key: string) => {
      const value = formData.get(key) as string;
      return value && value.trim() !== '' ? value : undefined;
    };
    
    const data: EventFormData = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      endDate: getStringValue('endDate'),
      location: getStringValue('location'),
      image: getStringValue('image'),
      category: formCategory, // Use state value
      status: formStatus, // Use state value
      maxParticipants: formData.get('maxParticipants') ? parseInt(formData.get('maxParticipants') as string) : undefined,
      registrationUrl: getStringValue('registrationUrl'),
      isPublished: formIsPublished, // Use state value
    };

    console.log('Submitting data:', data); // Debug log
    saveMutation.mutate(data);
  };

  // Filter events - FIXED
  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );



  // Count events by status
  const upcomingCount = events.filter((e: Event) => e.status === 'UPCOMING').length;
  const completedCount = events.filter((e: Event) => e.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Events</h2>
        <p className="text-muted-foreground mt-2">
          Kelola event-event di bagian ini
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="ONGOING">Ongoing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="sosialisasi">Sosialisasi</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormCategory('workshop');
            setFormStatus('UPCOMING');
            setFormIsPublished(false);
            setImageUrl('');
            setIsDialogOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-linear-3 text-white hover:scale-105 h-9 px-4 py-2 transition-all duration-1200 ease-in-out"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Event</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-x-auto">
        <Table>
          <TableHeader className="bg-linear-2">
            <TableRow>
              <TableHead className="w-20 text-light">Image</TableHead>
              <TableHead className="min-w-[200px] text-light">Title</TableHead>
              <TableHead className="min-w-[300px] text-light">Description</TableHead>
              <TableHead className="min-w-[140px] text-light">Date</TableHead>
              <TableHead className="min-w-[120px] text-light">Category</TableHead>
              <TableHead className="min-w-[140px] text-light">Status</TableHead>
              <TableHead className="min-w-[180px] text-light">Location</TableHead>
              <TableHead className="text-right min-w-[120px] text-light">Participants</TableHead>
              <TableHead className="min-w-[100px] text-light">Published</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event: Event) => (
                <TableRow
                  key={event.id}
                  className="hover:bg-slate-100"
                >
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {event.image && event.image.trim() !== '' ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src="/images/logos/brand-raw.webp"
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium min-w-[200px]">
                    {event.title}
                  </TableCell>
                  <TableCell className="min-w-[300px]">
                    <span className="text-sm text-slate-600 line-clamp-2">
                      {event.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {event.endDate && (
                        <span className="text-xs text-muted-foreground">
                          sampai {new Date(event.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryBadgeStyle(event.category)} px-2 py-1 capitalize font-medium border`}>
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeStyle(event.status)} px-2 py-1 gap-1.5 font-medium border`}>
                      {event.status === 'COMPLETED' ? (
                        <CircleCheck className="h-3.5 w-3.5" />
                      ) : event.status === 'ONGOING' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-dark font-semibold">
                    {event.location || 'Online'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {event.maxParticipants || '∞'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {event.isPublished ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 data-[state=open]:bg-muted text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingEvent(event);
                            setFormCategory(event.category);
                            setFormStatus(event.status);
                            setFormIsPublished(event.isPublished);
                            setImageUrl(event.image || '');
                            setIsDialogOpen(true);
                          }}
                          className="cursor-pointer hover:bg-slate-100"
                        >
                          Edit
                        </DropdownMenuItem>
                        {event.registrationUrl && (
                          <DropdownMenuItem asChild>
                            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:bg-slate-100">
                              Registration
                            </a>
                          </DropdownMenuItem>
                        )}
                        {/* <DropdownMenuSeparator /> */}
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer hover:bg-slate-100"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this event?')) {
                              deleteMutation.mutate(event.id);
                            }
                          }}
                        >
                          Delete
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
        {/* Data Count Info */}
        <div className="text-sm text-gray-600">
          Menampilkan {paginatedEvents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} sampai {Math.min(currentPage * pageSize, filteredEvents.length)} dari {filteredEvents.length} data
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20" id="rows-per-page">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
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
              className="hidden h-8 w-8 p-0 lg:flex inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden h-8 w-8 lg:flex inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingEvent?.title}
                required
                placeholder="Workshop Digital Marketing"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={editingEvent?.slug}
                required
                placeholder="workshop-digital-marketing-2026"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingEvent?.description}
                required
                rows={4}
                placeholder="Event description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Start Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  defaultValue={editingEvent?.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ''}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  defaultValue={editingEvent?.endDate ? new Date(editingEvent.endDate).toISOString().slice(0, 16) : ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingEvent?.location || ''}
                  placeholder="Gedung UTY Creative Hub"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="sosialisasi">Sosialisasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formStatus} onValueChange={(value) => setFormStatus(value as EventStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  defaultValue={editingEvent?.maxParticipants || ''}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  name="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
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
                        setIsUploading(true);
                        const formDataUpload = new FormData();
                        formDataUpload.append('file', file);
                        formDataUpload.append('folder', 'events');
                        
                        const response = await fetch(`${API_URL}/upload`, {
                          method: 'POST',
                          headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                          },
                          body: formDataUpload,
                        });

                        const data = await response.json();
                        
                        if (data.success && data.data) {
                          setImageUrl(data.data.url);
                        } else {
                          alert(data.error || 'Failed to upload image');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Error uploading image');
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    accept="image/*"
                    disabled={isUploading}
                  />
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                     {isUploading ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       <Upload className="h-4 w-4" />
                     )}
                  </div>
                </div>
              </div>
              {imageUrl && (
                <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border bg-gray-50 group">
                   <div className="absolute inset-0 z-0">
                     <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                     />
                   </div>
                   
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white text-sm font-medium flex items-center gap-2 hover:underline"
                      >
                        Buka Gambar <ExternalLink className="h-4 w-4" />
                      </a>
                   </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registrationUrl">Registration Link</Label>
              <Input
                id="registrationUrl"
                name="registrationUrl"
                defaultValue={editingEvent?.registrationUrl || ''}
                placeholder="https://forms.gle/..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isPublished">Publication Status</Label>
              <Select value={formIsPublished ? 'true' : 'false'} onValueChange={(value) => setFormIsPublished(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-white text-dark border border-dark hover:bg-dark hover:text-light transition-all duration-200 h-10 px-4 py-2 cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-linear-3 text-light h-10 px-4 py-2 cursor-pointer"
              >
                {saveMutation.isPending ? 'Saving...' : editingEvent ? 'Edit Event' : 'Tambah Event'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
