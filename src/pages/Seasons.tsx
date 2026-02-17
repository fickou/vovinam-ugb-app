import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Pencil, CheckCircle2, Circle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

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

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const data = await api.get('/seasons.php');
      setSeasons(data || []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les saisons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      registration_fee: 2000,
      monthly_fee: 1000,
      annual_total: 10000,
      is_active: false,
    });
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

    try {
      if (selectedSeason) {
        await api.put('/seasons.php', {
          ...formData,
          id: selectedSeason.id,
        });

        toast({
          title: 'Succès',
          description: 'Saison modifiée avec succès',
        });
      } else {
        await api.post('/seasons.php', formData);

        toast({
          title: 'Succès',
          description: 'Saison ajoutée avec succès',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSeasons();
    } catch (error) {
      console.error('Error saving season:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la saison',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (season: Season) => {
    try {
      await api.put('/seasons.php', {
        ...season,
        is_active: !season.is_active,
      });
      fetchSeasons();
    } catch (error) {
      console.error('Error toggling season status:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Saisons</h1>
            <p className="text-muted-foreground">Gérez les périodes sportives et les tarifs</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy-light">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle saison
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedSeason ? 'Modifier la saison' : 'Ajouter une saison'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la saison (ex: 2023-2024)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="2023-2024"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Date de début</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Date de fin</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg_fee">Frais d'inscription (FCFA)</Label>
                    <Input
                      id="reg_fee"
                      type="number"
                      value={formData.registration_fee}
                      onChange={(e) => setFormData({ ...formData, registration_fee: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_fee">Mensualité (FCFA)</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      value={formData.monthly_fee}
                      onChange={(e) => setFormData({ ...formData, monthly_fee: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_total">Total annuel (forfait)</Label>
                  <Input
                    id="annual_total"
                    type="number"
                    value={formData.annual_total}
                    onChange={(e) => setFormData({ ...formData, annual_total: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Saison active</Label>
                </div>
                <Button type="submit" className="w-full bg-navy hover:bg-navy-light">
                  {selectedSeason ? 'Modifier' : 'Ajouter'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : seasons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune saison configurée</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Saison</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Tarifs (Insc. / Mens.)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasons.map((season) => (
                    <TableRow key={season.id}>
                      <TableCell className="font-bold">{season.name}</TableCell>
                      <TableCell>
                        Du {new Date(season.start_date).toLocaleDateString()} au {new Date(season.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {season.registration_fee.toLocaleString()} / {season.monthly_fee.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {season.is_active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Circle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(season)}
                          >
                            {season.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(season)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
