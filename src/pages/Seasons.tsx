import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Pencil, CheckCircle2, Circle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  registration_fee: number;
  monthly_fee: number;
  annual_total: number;
  is_active: boolean;
}

export default function Seasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    registration_fee: 2000,
    monthly_fee: 1000,
    annual_total: 10000,
    is_active: false,
  });
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les saisons', variant: 'destructive' });
    } else {
      setSeasons(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: '', start_date: '', end_date: '', registration_fee: 2000, monthly_fee: 1000, annual_total: 10000, is_active: false });
    setSelectedSeason(null);
  };

  const openEditDialog = (season: Season) => {
    setSelectedSeason(season);
    setFormData({
      name: season.name,
      start_date: season.start_date,
      end_date: season.end_date,
      registration_fee: season.registration_fee,
      monthly_fee: season.monthly_fee,
      annual_total: season.annual_total,
      is_active: season.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSeason) {
      const { error } = await supabase.from('seasons').update(formData).eq('id', selectedSeason.id);
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de modifier la saison', variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Saison modifiée avec succès' });
    } else {
      const { error } = await supabase.from('seasons').insert(formData);
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'ajouter la saison', variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Saison ajoutée avec succès' });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchSeasons();
  };

  const toggleActive = async (season: Season) => {
    const { error } = await supabase.from('seasons').update({ is_active: !season.is_active }).eq('id', season.id);
    if (!error) fetchSeasons();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Saisons</h1>
            <p className="text-muted-foreground">Gérez les périodes sportives et les tarifs</p>
          </div>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-navy hover:bg-navy-light h-12 rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Nouvelle saison
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[95vw] rounded-xl overflow-hidden p-0">
                <div className="p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle>{selectedSeason ? 'Modifier la saison' : 'Ajouter une saison'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la saison (ex: 2023-2024)</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="2023-2024" required className="rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Début</Label>
                        <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required className="rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">Fin</Label>
                        <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required className="rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg_fee">Inscription (FCFA)</Label>
                        <Input id="reg_fee" type="number" value={formData.registration_fee} onChange={(e) => setFormData({ ...formData, registration_fee: parseInt(e.target.value) })} required className="rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthly_fee">Mensuel (FCFA)</Label>
                        <Input id="monthly_fee" type="number" value={formData.monthly_fee} onChange={(e) => setFormData({ ...formData, monthly_fee: parseInt(e.target.value) })} required className="rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annual_total">Forfait annuel (FCFA)</Label>
                      <Input id="annual_total" type="number" value={formData.annual_total} onChange={(e) => setFormData({ ...formData, annual_total: parseInt(e.target.value) })} required className="rounded-lg" />
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                      <Label htmlFor="is_active" className="font-semibold cursor-pointer">Saison active</Label>
                    </div>
                    <Button type="submit" className="w-full bg-navy hover:bg-navy-light text-white py-6 text-lg rounded-xl mt-2">
                      {selectedSeason ? 'Modifier' : 'Ajouter'}
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des saisons...</p>
              </div>
            ) : seasons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune saison configurée</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap font-bold">Saison</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Période</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Tarifs (Insc. / Mens.)</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Statut</TableHead>
                      {isAdmin && <TableHead className="text-right whitespace-nowrap font-bold">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasons.map((season) => (
                      <TableRow key={season.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-bold text-navy">{season.name}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-xs font-mono">
                          {new Date(season.start_date).toLocaleDateString('fr-FR')} → {new Date(season.end_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="font-semibold text-navy-light">{season.registration_fee.toLocaleString()}</span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span className="font-semibold text-navy-light">{season.monthly_fee.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">FCFA</span>
                        </TableCell>
                        <TableCell>
                          {season.is_active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-slate-200">
                              <Circle className="h-3 w-3 mr-1" />Inactive
                            </Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleActive(season)}
                                className={`h-8 rounded-lg text-xs font-semibold transition-all ${season.is_active ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                              >
                                {season.is_active ? 'Suspendre' : 'Activer'}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(season)} className="h-8 w-8 rounded-lg hover:bg-navy/10 hover:text-navy transition-colors">
                                <Pencil className="h-4 w-4" />
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
      </div>
    </DashboardLayout>
  );
}
