import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCog, Shield, Pencil, UserPlus, Trash2, Link as LinkIcon, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type AppRole = 'super_admin' | 'admin' | 'treasurer' | 'coach' | 'member';

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  profile: {
    first_name: string;
    last_name: string;
  } | null;
  email: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

export default function Users() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unlinkedMembers, setUnlinkedMembers] = useState<Member[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'member' as AppRole,
  });
  const [addFormData, setAddFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'member' as AppRole,
    member_id: '',
  });
  const { toast } = useToast();
  const { isAdmin, user: currentUser, roles } = useAuth();
  const isSuperAdmin = roles.includes('super_admin');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUnlinkedMembers = async () => {
    try {
      const data = await api.get('/members.php?unlinked=true');
      setUnlinkedMembers(data || []);
    } catch (error) {
      console.error('Error fetching unlinked members:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users.php');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'member',
      member_id: '',
    });
    fetchUnlinkedMembers();
    setIsAddDialogOpen(true);
  };

  const handleMemberSelect = (memberId: string) => {
    if (memberId === 'new') {
      setAddFormData({ ...addFormData, member_id: '', first_name: '', last_name: '', email: '' });
      return;
    }
    const member = unlinkedMembers.find(m => m.id === memberId);
    if (member) {
      setAddFormData({
        ...addFormData,
        member_id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email || '',
      });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (addFormData.password.length < 6) {
        toast({
          title: 'Erreur',
          description: 'Le mot de passe doit faire au moins 6 caractères',
          variant: 'destructive',
        });
        return;
      }

      await api.post('/users.php', addFormData);
      toast({
        title: 'Succès',
        description: 'Utilisateur créé avec succès',
      });
      setIsAddDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (userRole: UserWithRole) => {
    setSelectedUser(userRole);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users.php?id=${selectedUser.user_id}`);
      toast({
        title: 'Succès',
        description: 'Utilisateur supprimé avec succès',
      });
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (userRole: UserWithRole) => {
    setSelectedUser(userRole);
    setEditFormData({
      first_name: userRole.profile?.first_name || '',
      last_name: userRole.profile?.last_name || '',
      role: userRole.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await api.put('/users.php', {
        id: selectedUser.id,
        user_id: selectedUser.user_id,
        role: editFormData.role,
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
      });

      toast({
        title: 'Succès',
        description: 'Utilisateur mis à jour avec succès',
      });

      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'utilisateur',
        variant: 'destructive',
      });
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
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
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
          <Button
            onClick={handleAddClick}
            className="bg-navy hover:bg-navy-light text-white font-display uppercase tracking-wide gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Utilisateurs et rôles
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
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle actuel</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">
                        {userRole.profile ? `${userRole.profile.first_name} ${userRole.profile.last_name}` : 'Sans profil'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{userRole.email}</TableCell>
                      <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-navy hover:text-navy hover:bg-navy/10"
                            onClick={() => handleEditClick(userRole)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          {isSuperAdmin && userRole.user_id !== currentUser?.id?.toString() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-martial hover:text-red-martial hover:bg-red-martial/10"
                              onClick={() => handleDeleteClick(userRole)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value as AppRole })}
                  disabled={selectedUser?.user_id === currentUser?.id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membre</SelectItem>
                    <SelectItem value="coach">Entraîneur</SelectItem>
                    <SelectItem value="treasurer">Trésorier</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
                {selectedUser?.user_id === currentUser?.id?.toString() && (
                  <p className="text-xs text-amber-600 italic">
                    Pour votre sécurité, vous ne pouvez pas modifier votre propre rôle.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-red-martial hover:bg-red-martial-light text-white">
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Source des données</Label>
                <Select onValueChange={handleMemberSelect} defaultValue="new">
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nouvel utilisateur indépendant
                      </div>
                    </SelectItem>
                    {unlinkedMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-blue-500" />
                          Pratiquant : {member.first_name} {member.last_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addFormData.member_id && (
                  <p className="text-xs text-blue-600 italic">
                    Ce compte sera lié au pratiquant sélectionné.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add_first_name">Prénom</Label>
                  <Input
                    id="add_first_name"
                    value={addFormData.first_name}
                    onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_last_name">Nom</Label>
                  <Input
                    id="add_last_name"
                    value={addFormData.last_name}
                    onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_email">Email</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_password">Mot de passe provisoire</Label>
                <Input
                  id="add_password"
                  type="password"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_role">Rôle initial</Label>
                <Select
                  value={addFormData.role}
                  onValueChange={(value) => setAddFormData({ ...addFormData, role: value as AppRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-navy hover:bg-navy-light text-white">
                  Créer le compte
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.profile?.first_name} {selectedUser?.profile?.last_name}</strong> ?</p>
              <p className="text-sm text-red-martial mt-2 font-medium">Cette action est irréversible et supprimera également les rôles associés.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
