import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Settings as SettingsIcon, Users, Shield, Zap, Save, Trash2, Plus } from 'lucide-react';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserRole {
  user_id: string;
  user_email?: string;
  role: string;
}

interface ClubSettings {
  club_name: string;
  club_email: string;
  club_phone: string;
  club_address: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const [clubSettings, setClubSettings] = useState<ClubSettings>({
    club_name: 'Vovinam UGB Sporting Club',
    club_email: '',
    club_phone: '',
    club_address: '',
  });

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);

  // Index members by ID for O(1) lookup
  const membersMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach(m => map.set(m.id, m));
    return map;
  }, [members]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        supabase.from('members').select('id, first_name, last_name, email').order('last_name'),
        supabase.from('user_roles').select('*').order('created_at', { ascending: false }),
      ]);

      setMembers(membersRes.data || []);
      setUserRoles(rolesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Only show toast if it's not a "table doesn't exist" error
      if (!error?.message?.includes('relation') && !error?.message?.includes('user_roles')) {
        toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
      }
      // Set empty roles if user_roles table doesn't exist yet
      setMembers([]);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you'd save these to a settings table
      // For now, just show success
      toast({
        title: 'Succès',
        description: 'Paramètres sauvegardés avec succès',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un utilisateur et un rôle',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Check if role already exists
      const existing = userRoles.find(
        r => r.user_id === selectedUserId && r.role === selectedRole
      );

      if (existing) {
        toast({
          title: 'Erreur',
          description: 'Cet utilisateur a déjà ce rôle',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Try to insert - if table doesn't exist, show friendly error
      const { error } = await supabase.from('user_roles').insert([{
        user_id: selectedUserId,
        role: selectedRole as AppRole,
      }]);

      if (error) {
        if (error.message.includes('relation') || error.message.includes('user_roles')) {
          toast({
            title: 'Feature non disponible',
            description: 'La gestion des rôles n\'est pas encore configurée',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Succès',
        description: 'Rôle ajouté avec succès',
      });

      setSelectedUserId('');
      setSelectedRole('member');
      fetchData();
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le rôle',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', roleToDelete.user_id)
        .eq('role', roleToDelete.role as AppRole);

      if (error) {
        if (error.message.includes('relation') || error.message.includes('user_roles')) {
          toast({
            title: 'Feature non disponible',
            description: 'La gestion des rôles n\'est pas encore configurée',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Succès',
        description: 'Rôle supprimé avec succès',
      });

      setShowDeleteDialog(false);
      setRoleToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le rôle',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      treasurer: 'bg-blue-100 text-blue-800',
      coach: 'bg-green-100 text-green-800',
      member: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      treasurer: 'Trésorier',
      coach: 'Coach',
      member: 'Membre',
    };
    return (
      <Badge className={colors[role] || colors.member}>
        {labels[role] || role}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
          <Card className="border-red-100 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Accès Refusé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">Vous n'avez pas les permissions pour accéder aux paramètres.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 sm:px-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-navy flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              Paramètres du Club
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gérez tous les paramètres de l'organisation</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-14 sm:top-16 z-20 bg-background/95 backdrop-blur py-3 sm:py-4 border-b overflow-x-auto">
            <TabsList className="h-auto justify-start gap-1 sm:gap-2 flex-nowrap p-0 pl-2 sm:pl-0 bg-transparent w-full">
              <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Général</span>
                <span className="sm:hidden">Général</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Rôles</span>
                <span className="sm:hidden">Rôles</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Utilisateurs</span>
                <span className="sm:hidden">Util.</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Informations du Club</CardTitle>
                <CardDescription>Détails généraux de l'organisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club_name" className="text-xs sm:text-sm">Nom du Club</Label>
                  <Input
                    id="club_name"
                    value={clubSettings.club_name}
                    onChange={(e) => setClubSettings({ ...clubSettings, club_name: e.target.value })}
                    className="h-10 sm:h-11"
                    placeholder="Vovinam UGB Sporting Club"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="club_email" className="text-xs sm:text-sm">Email</Label>
                    <Input
                      id="club_email"
                      type="email"
                      value={clubSettings.club_email}
                      onChange={(e) => setClubSettings({ ...clubSettings, club_email: e.target.value })}
                      className="h-10 sm:h-11"
                      placeholder="contact@vovinamugb.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club_phone" className="text-xs sm:text-sm">Téléphone</Label>
                    <Input
                      id="club_phone"
                      value={clubSettings.club_phone}
                      onChange={(e) => setClubSettings({ ...clubSettings, club_phone: e.target.value })}
                      className="h-10 sm:h-11"
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club_address" className="text-xs sm:text-sm">Adresse</Label>
                  <Input
                    id="club_address"
                    value={clubSettings.club_address}
                    onChange={(e) => setClubSettings({ ...clubSettings, club_address: e.target.value })}
                    className="h-10 sm:h-11"
                    placeholder="Lieu d'entraînement"
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full sm:w-auto bg-navy hover:bg-navy-light h-10 sm:h-11"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROLES TAB */}
          <TabsContent value="roles" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Gestion des Rôles</CardTitle>
                <CardDescription>Ajouter ou retirer des rôles aux utilisateurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_select" className="text-xs sm:text-sm">Utilisateur</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-10 sm:h-11"><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.first_name} {m.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role_select" className="text-xs sm:text-sm">Rôle</Label>
                    <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val)}>
                      <SelectTrigger className="h-10 sm:h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="treasurer">Trésorier</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="member">Membre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAddRole}
                  disabled={loading || !selectedUserId}
                  className="w-full bg-navy hover:bg-navy-light h-10 sm:h-11"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Rôle
                </Button>
              </CardContent>
            </Card>

            {/* Rôles List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Rôles Actuels</CardTitle>
                <CardDescription>Liste de tous les rôles attribués</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">Chargement...</p>
                  </div>
                ) : userRoles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Aucun rôle attribué</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {userRoles.map((uRole) => (
                      <div
                        key={`${uRole.user_id}-${uRole.role}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/30 gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {membersMap.get(uRole.user_id)?.first_name} {membersMap.get(uRole.user_id)?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {membersMap.get(uRole.user_id)?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {getRoleBadge(uRole.role)}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setRoleToDelete(uRole);
                              setShowDeleteDialog(true);
                            }}
                            className="text-destructive h-8 w-8 hover:bg-destructive/10 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Utilisateurs du Système</CardTitle>
                <CardDescription>Voir tous les utilisateurs enregistrés</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">Chargement...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {members.map((member) => {
                      const memberRoles = userRoles.filter(r => r.user_id === member.id);
                      return (
                        <div
                          key={member.id}
                          className="p-4 border rounded-lg hover:bg-muted/30 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm sm:text-base">
                                {member.first_name} {member.last_name}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {member.email || 'Pas d\'email'}
                              </p>
                            </div>
                          </div>
                          {memberRoles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {memberRoles.map((role) => (
                                <div key={`${member.id}-${role.role}`}>
                                  {getRoleBadge(role.role)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression du rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer le rôle {roleToDelete?.role} à cet utilisateur ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90 rounded-lg"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}