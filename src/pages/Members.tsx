import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { useTableResponsive } from '@/hooks/useTableResponsive';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, User, Pencil, Trash2, Printer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  member_number: string | null;
  created_at: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const isMobileView = useTableResponsive();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    status: 'active',
  });
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les pratiquants', variant: 'destructive' });
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ first_name: '', last_name: '', phone: '', email: '', status: 'active' });
    setSelectedMember(null);
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone || '',
      email: member.email || '',
      status: member.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({ title: 'Erreur', description: 'Le prénom et le nom sont obligatoires', variant: 'destructive' });
      return;
    }

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      status: formData.status,
    };

    if (selectedMember) {
      const { error } = await supabase.from('members').update(payload).eq('id', selectedMember.id);
      if (error) {
        console.error('Erreur update member:', error);
        toast({ title: 'Erreur', description: `Impossible de modifier le pratiquant: ${error.message}`, variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Pratiquant modifié avec succès' });
    } else {
      const { error } = await supabase.from('members').insert({ ...payload, id: crypto.randomUUID() });
      if (error) {
        console.error('Erreur insert member:', error);
        toast({ title: 'Erreur', description: `Impossible d'ajouter le pratiquant: ${error.message}`, variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Pratiquant ajouté avec succès' });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchMembers();
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    const { error } = await supabase.from('members').delete().eq('id', selectedMember.id);
    if (error) {
      console.error('Erreur delete member:', error);
      toast({ title: 'Erreur', description: `Impossible de supprimer le pratiquant: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Pratiquant supprimé avec succès' });
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      fetchMembers();
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.member_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      new: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
      suspended: 'bg-amber-100 text-amber-800',
      former: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      active: 'Actif',
      new: 'Nouveau',
      suspended: 'Suspendu',
      former: 'Ancien',
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{labels[status] || status}</Badge>;
  };

  // Mobile view - Card layout
  if (isMobileView) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-display font-bold text-navy">Pratiquants</h1>
              <p className="text-xs text-muted-foreground">Gérez les membres</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsDialogOpen(true)} size="sm" className="bg-navy hover:bg-navy-light">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* Mobile Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Filtrer..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="new">Nouveau</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
              <SelectItem value="former">Ancien</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Card List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Aucun pratiquant trouvé</p>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {member.first_name} {member.last_name}
                      </h3>

                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}

                      {member.phone && (
                        <p className="text-xs text-muted-foreground truncate">{member.phone}</p>
                      )}

                      {member.member_number && (
                        <p className="text-xs text-muted-foreground mt-1">#{member.member_number}</p>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {member.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(member.created_at).toLocaleDateString('fr-FR')}
                        </Badge>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(member)} className="h-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Dialog for Add/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedMember ? 'Modifier le pratiquant' : 'Ajouter un pratiquant'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-xs sm:text-sm">Prénom</Label>
                  <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required className="h-10 sm:h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-xs sm:text-sm">Nom</Label>
                  <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required className="h-10 sm:h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm">Téléphone</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-10 sm:h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 sm:h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs sm:text-sm">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="h-10 sm:h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="former">Ancien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-navy hover:bg-navy-light h-10 sm:h-11">
                {selectedMember ? 'Modifier' : 'Ajouter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedMember?.first_name} {selectedMember?.last_name} ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    );
  }

  // Desktop view - Table layout
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Pratiquants</h1>
            <p className="text-muted-foreground">Gérez les membres du club</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <div className="flex gap-2 no-print">
              <Button onClick={() => window.print()} variant="outline" className="border-navy text-navy hover:bg-navy/5">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer la liste
              </Button>
              {isAdmin && (
                <Button className="bg-navy hover:bg-navy-light" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau pratiquant
                </Button>
              )}
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedMember ? 'Modifier le pratiquant' : 'Ajouter un pratiquant'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="former">Ancien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-navy hover:bg-navy-light">
                  {selectedMember ? 'Modifier' : 'Ajouter'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="hidden print:block mb-8 text-center pt-4 border-b pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-navy">Vovinam UGB Sporting Club</h1>
          <p className="text-sm font-semibold mt-1">Liste des Pratiquants - {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <Card className="print:shadow-none print:border-none overflow-hidden">
          <CardHeader className="no-print pb-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un pratiquant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full" />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="new">Nouveaux</SelectItem>
                    <SelectItem value="active">Actifs uniquement</SelectItem>
                    <SelectItem value="suspended">Suspendus</SelectItem>
                    <SelectItem value="former">Anciens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des pratiquants...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun pratiquant trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">N° Adhérent</TableHead>
                      <TableHead className="whitespace-nowrap">Nom</TableHead>
                      <TableHead className="whitespace-nowrap">Téléphone</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Statut</TableHead>
                      {isAdmin && <TableHead className="text-right no-print whitespace-nowrap">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className={member.status !== 'active' ? 'no-print' : ''}>
                        <TableCell className="font-mono whitespace-nowrap">{member.member_number}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{member.first_name} {member.last_name}</TableCell>
                        <TableCell className="whitespace-nowrap">{member.phone || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap max-w-[200px] truncate">{member.email || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{getStatusBadge(member.status)}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right no-print">
                            <div className="flex justify-end gap-1 md:gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)} className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedMember(member); setIsDeleteDialogOpen(true); }} className="text-destructive hover:text-destructive h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer {selectedMember?.first_name} {selectedMember?.last_name} ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
