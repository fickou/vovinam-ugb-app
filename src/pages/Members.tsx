import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
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
        toast({ title: 'Erreur', description: 'Impossible de modifier le pratiquant', variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Pratiquant modifié avec succès' });
    } else {
      const { error } = await supabase.from('members').insert(payload);
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter le pratiquant', variant: 'destructive' });
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
      toast({ title: 'Erreur', description: 'Impossible de supprimer le pratiquant. Il a peut-être des paiements associés.', variant: 'destructive' });
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
                <DialogTrigger asChild>
                  <Button className="bg-navy hover:bg-navy-light">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau pratiquant
                  </Button>
                </DialogTrigger>
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

        <Card className="print:shadow-none print:border-none">
          <CardHeader className="no-print">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un pratiquant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
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
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun pratiquant trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Adhérent</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    {isAdmin && <TableHead className="text-right no-print">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className={member.status !== 'active' ? 'no-print' : ''}>
                      <TableCell className="font-mono">{member.member_number}</TableCell>
                      <TableCell className="font-medium">{member.first_name} {member.last_name}</TableCell>
                      <TableCell>{member.phone || '-'}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right no-print">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedMember(member); setIsDeleteDialogOpen(true); }} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
