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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Le Bureau</h1>
                        <p className="text-muted-foreground">Membres du comité directeur par saison</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 no-print w-full lg:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                                <SelectTrigger className="w-full sm:w-[220px] rounded-xl h-12 bg-white border-navy/10 shadow-sm focus:ring-navy">
                                    <SelectValue placeholder="Choisir une saison" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    {seasons.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="py-3">
                                            {s.name} {s.is_active && ' (Actuelle)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isAdmin && (
                            <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="w-full sm:w-auto bg-navy hover:bg-navy-light text-white h-12 rounded-xl px-6 gap-2 shadow-lg shadow-navy/20 transition-all active:scale-95"
                            >
                                <Plus className="h-5 w-5" />
                                <span className="font-bold">Nommer un membre</span>
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="border-none shadow-xl shadow-navy/5 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="flex items-center gap-2 text-navy text-lg font-display">
                            <Users2 className="h-5 w-5 text-navy-light" />
                            <span>Composition du bureau</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin h-10 w-10 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-muted-foreground font-medium">Chargement des membres...</p>
                            </div>
                        ) : boardMembers.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
                                <div className="p-4 bg-muted/50 rounded-full">
                                    <Users2 className="h-10 w-10 opacity-20" />
                                </div>
                                <p className="italic font-medium">Aucun membre enregistré pour cette saison.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 border-none">
                                            <TableHead className="font-bold whitespace-nowrap px-6 py-4">Poste / Fonction</TableHead>
                                            <TableHead className="font-bold whitespace-nowrap px-6 py-4">Pratiquant</TableHead>
                                            <TableHead className="font-bold whitespace-nowrap px-6 py-4">Contact (Email / Tél)</TableHead>
                                            {isAdmin && <TableHead className="text-right font-bold whitespace-nowrap px-6 py-4">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {boardMembers.map((bm) => (
                                            <TableRow key={bm.id} className="hover:bg-navy/5 transition-colors border-b border-navy/5 last:border-none">
                                                <TableCell className="px-6 py-4">
                                                    <Badge className="bg-navy/10 text-navy hover:bg-navy/10 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                                        {bm.position}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-display font-bold text-navy leading-tight">
                                                            {bm.members?.first_name} {bm.members?.last_name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-tighter uppercase mt-0.5">
                                                            N° {bm.members?.member_number || '---'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]">{bm.members?.email || '-'}</span>
                                                        <span className="text-xs font-bold text-navy-light">{bm.members?.phone || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1 sm:gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-xl hover:bg-navy/10 hover:text-navy transition-all"
                                                                onClick={() => { setSelectedBoardMember(bm); setEditFormData({ position: bm.position }); setIsEditDialogOpen(true); }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-xl text-red-martial hover:bg-red-martial/10 transition-all font-bold"
                                                                onClick={() => handleDelete(bm.id)}
                                                            >
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

                {/* Add Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="max-w-md w-[95vw] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="p-6">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-2xl font-display font-bold text-navy flex items-center gap-2">
                                    <Plus className="h-6 w-6" />
                                    Nommer un membre
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Choisir un membre actif</Label>
                                    <Select value={addFormData.member_id} onValueChange={(val) => setAddFormData({ ...addFormData, member_id: val })} required>
                                        <SelectTrigger className="h-12 rounded-xl focus:ring-navy border-navy/20">
                                            <SelectValue placeholder="Rechercher un membre..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] rounded-xl shadow-xl border-none">
                                            {members.map(m => (
                                                <SelectItem key={m.id} value={m.id} className="py-3">
                                                    <span className="font-semibold">{m.first_name} {m.last_name}</span>
                                                    <span className="ml-2 text-[10px] text-muted-foreground">({m.member_number})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poste / Fonction</Label>
                                    <Input
                                        id="position"
                                        placeholder="ex: Président, Trésorier Adjoint..."
                                        value={addFormData.position}
                                        onChange={(e) => setAddFormData({ ...addFormData, position: e.target.value })}
                                        required
                                        className="h-12 rounded-xl focus:ring-navy border-navy/20 text-lg font-medium"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Annuler</Button>
                                    <Button type="submit" className="flex-1 bg-navy hover:bg-black text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-navy/20">
                                        Confirmer la nomination
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-md w-[95vw] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="p-6">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-2xl font-display font-bold text-navy flex items-center gap-2">
                                    <Pencil className="h-6 w-6" />
                                    Modifier la fonction
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Membre</Label>
                                    <div className="p-4 bg-navy/5 border border-navy/10 rounded-xl flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-bold font-display">
                                            {selectedBoardMember?.members?.first_name?.[0]}{selectedBoardMember?.members?.last_name?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-display font-bold text-navy">{selectedBoardMember?.members?.first_name} {selectedBoardMember?.members?.last_name}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{selectedBoardMember?.members?.member_number}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="edit_position" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Poste / Fonction</Label>
                                    <Input
                                        id="edit_position"
                                        value={editFormData.position}
                                        onChange={(e) => setEditFormData({ position: e.target.value })}
                                        required
                                        className="h-12 rounded-xl focus:ring-navy border-navy/20 text-lg font-medium"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Annuler</Button>
                                    <Button type="submit" className="flex-1 bg-navy hover:bg-black text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-navy/20">
                                        Enregistrer
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
