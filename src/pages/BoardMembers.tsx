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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users2, Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BoardMember {
    id: string;
    member_id: string;
    season_id: string;
    position: string;
    members: { first_name: string; last_name: string; email: string | null; phone: string | null; member_number: string | null } | null;
}

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    member_number: string | null;
}

interface Season {
    id: string;
    name: string;
    is_active: boolean;
}

export default function BoardMembers() {
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedBoardMember, setSelectedBoardMember] = useState<BoardMember | null>(null);
    const [addFormData, setAddFormData] = useState({ member_id: '', position: '' });
    const [editFormData, setEditFormData] = useState({ position: '' });
    const { toast } = useToast();
    const { isAdmin } = useAuth();

    useEffect(() => {
        Promise.all([
            supabase.from('seasons').select('*').order('start_date', { ascending: false }),
            supabase.from('members').select('id, first_name, last_name, member_number').eq('status', 'active').order('last_name'),
        ]).then(([seasonsRes, membersRes]) => {
            const seasonsData = seasonsRes.data || [];
            setSeasons(seasonsData);
            setMembers(membersRes.data || []);
            const active = seasonsData.find(s => s.is_active);
            if (active) setSelectedSeasonId(active.id);
            else if (seasonsData.length > 0) setSelectedSeasonId(seasonsData[0].id);
        });
    }, []);

    useEffect(() => {
        if (selectedSeasonId) fetchBoardMembers();
    }, [selectedSeasonId]);

    const fetchBoardMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('board_members')
            .select('*, members(first_name, last_name, email, phone, member_number)')
            .eq('season_id', selectedSeasonId)
            .order('position');

        if (error) {
            toast({ title: 'Erreur', description: 'Impossible de charger les membres du bureau', variant: 'destructive' });
        } else {
            setBoardMembers((data as BoardMember[]) || []);
        }
        setLoading(false);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('board_members').insert({
            member_id: addFormData.member_id,
            position: addFormData.position,
            season_id: selectedSeasonId,
        });

        if (error) {
            toast({ title: 'Erreur', description: 'Impossible d\'ajouter ce membre', variant: 'destructive' });
        } else {
            toast({ title: 'Succès', description: 'Membre ajouté au bureau' });
            setIsAddDialogOpen(false);
            setAddFormData({ member_id: '', position: '' });
            fetchBoardMembers();
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBoardMember) return;
        const { error } = await supabase.from('board_members').update({ position: editFormData.position }).eq('id', selectedBoardMember.id);

        if (error) {
            toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
        } else {
            toast({ title: 'Succès', description: 'Position mise à jour' });
            setIsEditDialogOpen(false);
            fetchBoardMembers();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('board_members').delete().eq('id', id);
        if (error) {
            toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'destructive' });
        } else {
            toast({ title: 'Succès', description: 'Membre retiré du bureau' });
            fetchBoardMembers();
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Le Bureau</h1>
                        <p className="text-muted-foreground">Membres du comité directeur par saison</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Saison" /></SelectTrigger>
                            <SelectContent>
                                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}{s.is_active && ' (Actuelle)'}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {isAdmin && (
                            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-navy hover:bg-navy-light text-white gap-2">
                                <Plus className="h-4 w-4" />Nommer
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users2 className="h-5 w-5" />Composition du bureau
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Chargement...</div>
                        ) : boardMembers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground italic">Aucun membre enregistré pour cette saison.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Poste / Fonction</TableHead>
                                        <TableHead>Pratiquant</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {boardMembers.map((bm) => (
                                        <TableRow key={bm.id}>
                                            <TableCell className="font-bold text-navy">{bm.position}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{bm.members?.first_name} {bm.members?.last_name}</div>
                                                <div className="text-xs text-muted-foreground">{bm.members?.member_number}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{bm.members?.email || '-'}</TableCell>
                                            <TableCell className="text-sm">{bm.members?.phone || '-'}</TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => { setSelectedBoardMember(bm); setEditFormData({ position: bm.position }); setIsEditDialogOpen(true); }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-martial hover:bg-red-martial/10" onClick={() => handleDelete(bm.id)}>
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

                {/* Add Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Nommer un membre au bureau</DialogTitle></DialogHeader>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Pratiquant</Label>
                                <Select value={addFormData.member_id} onValueChange={(val) => setAddFormData({ ...addFormData, member_id: val })} required>
                                    <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                                    <SelectContent>
                                        {members.map(m => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.member_number})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Poste / Fonction</Label>
                                <Input id="position" placeholder="ex: Président, Trésorier Adjoint..." value={addFormData.position} onChange={(e) => setAddFormData({ ...addFormData, position: e.target.value })} required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-navy text-white">Confirmer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Modifier la fonction</DialogTitle></DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Membre</Label>
                                <div className="p-2 bg-muted rounded text-sm font-medium">{selectedBoardMember?.members?.first_name} {selectedBoardMember?.members?.last_name}</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_position">Poste / Fonction</Label>
                                <Input id="edit_position" value={editFormData.position} onChange={(e) => setEditFormData({ position: e.target.value })} required />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-navy text-white">Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
