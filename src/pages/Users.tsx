import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Shield, Pencil, UserPlus, Trash2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type AppRole = 'super_admin' | 'admin' | 'treasurer' | 'coach' | 'member';

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [editFormData, setEditFormData] = useState({ role: 'member' as AppRole });
  const [addFormData, setAddFormData] = useState({
    email: '', password: '', first_name: '', last_name: '', role: 'member' as AppRole,
  });
  const { toast } = useToast();
  const { isAdmin, user: currentUser, roles } = useAuth();
  const isSuperAdmin = roles.includes('super_admin');

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch user_roles and join with profiles
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('id, user_id, role, profiles(first_name, last_name)');

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs', variant: 'destructive' });
    } else {
      const mapped = (userRoles || []).map((ur: any) => ({
        id: ur.id,
        user_id: ur.user_id,
        role: ur.role,
        first_name: ur.profiles?.first_name || '',
        last_name: ur.profiles?.last_name || '',
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addFormData.password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit faire au moins 6 caractères', variant: 'destructive' });
      return;
    }

    // Use Supabase admin API via signUp (creates in auth.users)
    const { data, error } = await supabase.auth.signUp({
      email: addFormData.email,
      password: addFormData.password,
    });

    if (error || !data.user) {
      toast({ title: 'Erreur', description: error?.message || 'Impossible de créer l\'utilisateur', variant: 'destructive' });
      return;
    }

    // Create profile
    await supabase.from('profiles').insert({
      user_id: data.user.id,
      first_name: addFormData.first_name,
      last_name: addFormData.last_name,
    });

    // Set role
    await supabase.from('user_roles').upsert({
      user_id: data.user.id,
      role: addFormData.role,
    }, { onConflict: 'user_id' });

    toast({ title: 'Succès', description: 'Utilisateur créé avec succès' });
    setIsAddDialogOpen(false);
    setAddFormData({ email: '', password: '', first_name: '', last_name: '', role: 'member' });
    fetchUsers();
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const { error } = await supabase.from('user_roles').update({ role: editFormData.role }).eq('id', selectedUser.id);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de modifier le rôle', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Rôle mis à jour avec succès' });
      setIsEditDialogOpen(false);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userRole: UserWithRole) => {
    const { error } = await supabase.from('user_roles').delete().eq('id', userRole.id);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'utilisateur', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Accès utilisateur révoqué' });
      fetchUsers();
    }
  };

  const getRoleBadge = (role: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      super_admin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Administrateur', className: 'bg-red-100 text-red-800' },
      treasurer: { label: 'Trésorier', className: 'bg-blue-100 text-blue-800' },
      coach: { label: 'Entraîneur', className: 'bg-green-100 text-green-800' },
      member: { label: 'Membre', className: 'bg-gray-100 text-gray-800' },
    };
    const config = configs[role] || { label: role, className: 'bg-gray-100' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Accès réservé aux administrateurs</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les rôles et permissions</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-navy hover:bg-navy-light text-white gap-2">
            <UserPlus className="h-4 w-4" />Ajouter un utilisateur
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />Utilisateurs et rôles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle actuel</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">
                        {userRole.first_name || userRole.last_name
                          ? `${userRole.first_name} ${userRole.last_name}`
                          : <span className="text-muted-foreground italic">Sans profil</span>}
                      </TableCell>
                      <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-navy hover:text-navy hover:bg-navy/10"
                            onClick={() => { setSelectedUser(userRole); setEditFormData({ role: userRole.role }); setIsEditDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" />Modifier
                          </Button>
                          {isSuperAdmin && userRole.user_id !== currentUser?.id && (
                            <Button variant="ghost" size="sm" className="text-red-martial hover:bg-red-martial/10"
                              onClick={() => handleDeleteUser(userRole)}>
                              <Trash2 className="h-4 w-4 mr-2" />Révoquer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Modifier le rôle</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="space-y-2">
                <Label>Utilisateur</Label>
                <div className="p-2 bg-muted rounded text-sm font-medium">
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={editFormData.role} onValueChange={(v) => setEditFormData({ role: v as AppRole })}
                  disabled={selectedUser?.user_id === currentUser?.id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membre</SelectItem>
                    <SelectItem value="coach">Entraîneur</SelectItem>
                    <SelectItem value="treasurer">Trésorier</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
                {selectedUser?.user_id === currentUser?.id && (
                  <p className="text-xs text-amber-600 italic">Pour votre sécurité, vous ne pouvez pas modifier votre propre rôle.</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-red-martial hover:bg-red-martial-light text-white">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Ajouter un utilisateur</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_first_name">Prénom</Label>
                  <Input id="add_first_name" value={addFormData.first_name} onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_last_name">Nom</Label>
                  <Input id="add_last_name" value={addFormData.last_name} onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_email">Email</Label>
                <Input id="add_email" type="email" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_password">Mot de passe provisoire</Label>
                <Input id="add_password" type="password" value={addFormData.password} onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_role">Rôle initial</Label>
                <Select value={addFormData.role} onValueChange={(v) => setAddFormData({ ...addFormData, role: v as AppRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membre</SelectItem>
                    <SelectItem value="coach">Entraîneur</SelectItem>
                    <SelectItem value="treasurer">Trésorier</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-navy hover:bg-navy-light text-white">Créer le compte</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
