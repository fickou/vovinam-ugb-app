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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle } from 'lucide-react';

type AppRole = 'super_admin' | 'admin' | 'treasurer' | 'coach' | 'member';

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  email?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
}

export interface Demande {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
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
    
    // Fetch user_roles and profiles for Active users
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, user_id, role');

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name');

    // Fetch pending demandes
    const { data: demandesData, error: demandesError } = await supabase
      .from('demandes')
      .select('*')
      .eq('status', 'pending');

    if (rolesError || profilesError || demandesError) {
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
      console.error(rolesError || profilesError || demandesError);
    } else {
      const mapped = (userRoles || []).map((ur: any) => {
        const userProfile = profiles?.find((p: any) => p.user_id === ur.user_id);
        return {
          id: ur.id,
          user_id: ur.user_id,
          role: ur.role,
          first_name: userProfile?.first_name || '',
          last_name: userProfile?.last_name || '',
        };
      });
      setUsers(mapped);
      setDemandes((demandesData as Demande[]) || []);
    }
    setLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addFormData.password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit faire au moins 6 caractères', variant: 'destructive' });
      return;
    }

    // Creation de l'utilisateur dans Supabase Auth (users table)
    const { data, error } = await supabase.auth.signUp({
      email: addFormData.email,
      password: addFormData.password,
    });

    if (error || !data.user) {
      toast({ title: 'Erreur', description: error?.message || 'Impossible de créer l\'utilisateur', variant: 'destructive' });
      return;
    }

    // Creation du profil dans la table profiles
    await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      user_id: data.user.id,
      first_name: addFormData.first_name,
      last_name: addFormData.last_name,
    });

    // Set role
    await supabase.from('user_roles').upsert({
      id: crypto.randomUUID(),
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

  const handleApproveDemande = async (d: Demande) => {
  setLoading(true);
  try {
    console.log('[ADMIN] Appel de l\'Edge Function pour valider:', d.email);

    // ✅ Récupère le token actif
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Session expirée, veuillez vous reconnecter.');

    const { data, error } = await supabase.functions.invoke('approve-demande', {
      body: { demandeId: d.id },
      headers: {
        Authorization: `Bearer ${session.access_token}`, // ✅ ligne ajoutée
      }
    });

    if (error) {
      // Extraire le message précis du corps de la réponse HTTP de l'Edge Function
      try {
        const errorBody = await (error as any).context?.json();
        throw new Error(errorBody?.error || error.message || 'Erreur de la fonction');
      } catch (parseErr: any) {
        if (parseErr.message && parseErr.message !== 'Erreur de la fonction') throw parseErr;
        throw new Error(error.message || 'Erreur inconnue');
      }
    }

    if (data?.error) throw new Error(data.error);

    toast({ 
      title: 'Validation réussie ! ✅', 
      description: `Le compte de ${d.first_name} a été créé et activé.` 
    });
    
    fetchUsers();
  } catch (e: any) {
    console.error('[ADMIN] Erreur lors de l\'approbation:', e);
    toast({ 
      title: 'Échec de validation ❌', 
      description: e.message || 'Une erreur est survenue lors de la création du compte.', 
      variant: 'destructive' 
    });
  } finally {
    setLoading(false);
  }
};


  const handleRejectDemande = async (d: Demande) => {
    try {
      const { error } = await supabase.from('demandes').update({ status: 'rejected' }).eq('id', d.id);
      if (error) throw error;
      toast({ title: 'Demande refusée', description: 'La demande a été rejetée.' });
      fetchUsers();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message || 'Impossible de refuser.', variant: 'destructive' });
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

  const activeUsers = users;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les rôles et permissions</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto bg-navy hover:bg-navy-light text-white h-12 rounded-xl gap-2 shadow-lg shadow-navy/20">
            <UserPlus className="h-5 w-5" />
            <span className="font-semibold">Ajouter un compte</span>
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="active">Comptes Actifs</TabsTrigger>
            <TabsTrigger value="pending">
              Demandes
              {demandes.length > 0 && (
                <span className="ml-2 bg-red-martial text-white text-xs px-2 py-0.5 rounded-full">
                  {demandes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card className="border-none shadow-md overflow-hidden rounded-xl">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-navy">
              <UserCog className="h-5 w-5" />
              <span>Comptes et privilèges</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des utilisateurs...</p>
              </div>
            ) : activeUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">
                <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun utilisateur actif trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap font-bold">Utilisateur</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Rôle actuel</TableHead>
                      <TableHead className="text-right whitespace-nowrap font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((userRole) => (
                      <TableRow key={userRole.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold text-navy">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-xs">
                              {userRole.first_name?.[0] || userRole.last_name?.[0] || '?'}
                            </div>
                            <div className="flex flex-col leading-tight">
                              <span>
                                {userRole.first_name || userRole.last_name
                                  ? `${userRole.first_name} ${userRole.last_name}`
                                  : <span className="text-muted-foreground italic">Sans profil</span>}
                              </span>
                              {userRole.user_id === currentUser?.id && (
                                <span className="text-[10px] text-navy-light font-bold flex items-center gap-1">
                                  <Shield className="h-2 w-2" /> (C'est vous)
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-navy hover:text-navy hover:bg-navy/10 font-bold"
                              onClick={() => { setSelectedUser(userRole); setEditFormData({ role: userRole.role }); setIsEditDialogOpen(true); }}
                            >
                              <Pencil className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Modifier</span>
                            </Button>
                            {isSuperAdmin && userRole.user_id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-red-martial hover:bg-red-martial/10 font-bold"
                                onClick={() => handleDeleteUser(userRole)}
                              >
                                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Révoquer</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-none shadow-md overflow-hidden rounded-xl">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-navy">
                <UserPlus className="h-5 w-5" />
                <span>Demandes d'inscription ({demandes.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des demandes...</p>
                </div>
              ) : demandes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande en attente</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="whitespace-nowrap font-bold">Email</TableHead>
                        <TableHead className="whitespace-nowrap font-bold">Profil</TableHead>
                        <TableHead className="text-right whitespace-nowrap font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demandes.map((d) => (
                        <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold text-navy">
                            {d.email}
                          </TableCell>
                          <TableCell className="font-semibold text-navy">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                                {d.first_name?.[0] || d.last_name?.[0] || '?'}
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span>{d.first_name} {d.last_name}</span>
                                <span className="text-xs font-normal text-muted-foreground text-amber-600">En attente</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-green-600 border-green-200 hover:bg-green-50 font-bold"
                                onClick={() => handleApproveDemande(d)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Valider</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-red-600 border-red-200 hover:bg-red-50 font-bold"
                                onClick={() => handleRejectDemande(d)}
                              >
                                <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Refuser</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md w-[95vw] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-display font-bold text-navy flex items-center gap-2">
                  <UserCog className="h-6 w-6" />
                  Modifier les accès
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateRole} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Utilisateur</Label>
                  <div className="p-4 bg-navy/5 border border-navy/10 rounded-xl text-lg font-display font-bold text-navy flex items-center gap-3">
                    <User className="h-5 w-5 text-navy-light" />
                    {selectedUser?.first_name} {selectedUser?.last_name}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sélectionner un rôle</Label>
                  <Select value={editFormData.role} onValueChange={(v) => setEditFormData({ role: v as AppRole })}
                    disabled={selectedUser?.user_id === currentUser?.id}>
                    <SelectTrigger className="h-12 rounded-xl focus:ring-navy border-navy/20"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl font-medium">
                      <SelectItem value="member">Membre (Accès limité)</SelectItem>
                      <SelectItem value="coach">Entraîneur (Suivi cours)</SelectItem>
                      <SelectItem value="treasurer">Trésorier (Paiements)</SelectItem>
                      <SelectItem value="admin">Administrateur (Gestion totale)</SelectItem>
                      {isSuperAdmin && <SelectItem value="super_admin">Super Admin (Système)</SelectItem>}
                    </SelectContent>
                  </Select>
                  {selectedUser?.user_id === currentUser?.id && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic flex gap-2 items-start mt-2">
                      <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Par mesure de sécurité, vous ne pouvez pas modifier votre propre rôle pour éviter de perdre vos accès administrateur.</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Annuler</Button>
                  <Button type="submit" className="flex-1 bg-red-martial hover:bg-black text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-red-martial/20">
                    Mettre à jour
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md w-[95vw] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-display font-bold text-navy flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Nouveau compte
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add_first_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prénom</Label>
                    <Input id="add_first_name" value={addFormData.first_name} onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_last_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom</Label>
                    <Input id="add_last_name" value={addFormData.last_name} onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })} required className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email de connexion</Label>
                  <Input id="add_email" type="email" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mot de passe provisoire</Label>
                  <Input id="add_password" type="password" value={addFormData.password} onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add_role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rôle initial</Label>
                  <Select value={addFormData.role} onValueChange={(v) => setAddFormData({ ...addFormData, role: v as AppRole })}>
                    <SelectTrigger className="h-11 rounded-xl focus:ring-navy border-navy/20"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl font-medium">
                      <SelectItem value="member">Membre</SelectItem>
                      <SelectItem value="coach">Entraîneur</SelectItem>
                      <SelectItem value="treasurer">Trésorier</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Annuler</Button>
                  <Button type="submit" className="flex-1 bg-navy hover:bg-navy-light text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-navy/20">
                    Créer le compte
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
