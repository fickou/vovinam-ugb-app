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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, CreditCard, Pencil, Trash2, ExternalLink, Check, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import WavePayment from '@/components/WavePayment';

interface Season {
  id: string;
  name: string;
  monthly_fee: number;
  registration_fee: number;
  annual_total: number;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  member_number: string | null;
}

interface Payment {
  id: string;
  member_id: string;
  season_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_date: string;
  month_number: number | null;
  proof_url: string | null;
  status: string;
  notes: string | null;
  members: Member | null;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showWavePayment, setShowWavePayment] = useState(false);
  const { toast } = useToast();
  const { user, isStaff, roles } = useAuth();
  const isAdmin = roles.some(r => ['super_admin', 'admin'].includes(r));
  const canManage = roles.some(r => ['super_admin', 'admin', 'treasurer'].includes(r));
  const isMemberOnly = !isStaff;

  const [formData, setFormData] = useState({
    member_id: '',
    season_id: '',
    amount: '',
    payment_type: 'monthly',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    month_number: '',
    notes: '',
    status: 'VALIDATED',
  });
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);

    const [paymentsRes, membersRes, seasonsRes] = await Promise.all([
      supabase
        .from('payments')
        .select('*, members(id, first_name, last_name, member_number)')
        .order('created_at', { ascending: false }),
      supabase.from('members').select('id, first_name, last_name, member_number').order('last_name'),
      supabase.from('seasons').select('*').order('start_date', { ascending: false }),
    ]);

    setPayments((paymentsRes.data as Payment[]) || []);
    setMembers(membersRes.data || []);
    setSeasons(seasonsRes.data || []);
    const active = seasonsRes.data?.find(s => s.is_active) || null;
    setActiveSeason(active);
    if (active) setFormData(f => ({ ...f, season_id: active.id }));

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      season_id: activeSeason?.id || '',
      amount: '',
      payment_type: 'monthly',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      month_number: '',
      notes: '',
      status: 'VALIDATED',
    });
    setSelectedMonths([]);
    setSelectedPayment(null);
    setShowWavePayment(false);
  };

  const openEditDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormData({
      member_id: payment.member_id,
      season_id: payment.season_id,
      amount: String(payment.amount),
      payment_type: payment.payment_type,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      month_number: payment.month_number !== null ? String(payment.month_number) : '',
      notes: payment.notes || '',
      status: payment.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.member_id || !formData.season_id || !formData.amount) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    // If Wave and new payment, show the Wave component
    if (!selectedPayment && formData.payment_method === 'wave') {
      setShowWavePayment(true);
      return;
    }

    // Multi-month insert (only for new monthly payments)
    if (!selectedPayment && formData.payment_type === 'monthly') {
      if (selectedMonths.length === 0) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner au moins un mois', variant: 'destructive' });
        return;
      }
      const rows = selectedMonths.map(m => ({
        id: crypto.randomUUID(),
        member_id: formData.member_id,
        season_id: formData.season_id,
        amount: parseInt(formData.amount),
        payment_type: 'monthly',
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        month_number: m,
        notes: formData.notes || null,
        status: formData.status,
        recorded_by: user?.id,
      }));
      const { error } = await supabase.from('payments').insert(rows);
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: `${selectedMonths.length} paiement(s) enregistré(s)` });
      setIsDialogOpen(false);
      resetForm();
      fetchAll();
      return;
    }

    const payload = {
      member_id: formData.member_id,
      season_id: formData.season_id,
      amount: parseInt(formData.amount),
      payment_type: formData.payment_type,
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      month_number: formData.month_number ? parseInt(formData.month_number) : null,
      notes: formData.notes || null,
      status: formData.status,
    };

    if (selectedPayment) {
      const { error } = await supabase.from('payments').update(payload).eq('id', selectedPayment.id);
      if (error) {
        console.error('Erreur update payment:', error);
        toast({ title: 'Erreur', description: `Impossible de modifier le paiement: ${error.message}`, variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Paiement modifié' });
    } else {
      const { error } = await supabase.from('payments').insert({ ...payload, id: crypto.randomUUID(), recorded_by: user?.id });
      if (error) {
        console.error('Erreur insert payment:', error);
        toast({ title: 'Erreur', description: `Impossible d'ajouter le paiement: ${error.message}`, variant: 'destructive' });
        return;
      }
      toast({ title: 'Succès', description: 'Paiement enregistré' });
    }

    setIsDialogOpen(false);
    resetForm();
    fetchAll();
  };

  const handleValidate = async (payment: Payment) => {
    const newStatus = payment.status === 'VALIDATED' ? 'PENDING' : 'VALIDATED';
    const { error } = await supabase.from('payments').update({ status: newStatus }).eq('id', payment.id);
    if (error) {
      console.error('Erreur update status:', error);
      toast({ title: 'Erreur', description: `Impossible de modifier le statut: ${error.message}`, variant: 'destructive' });
    } else {
      fetchAll();
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;
    const { error } = await supabase.from('payments').delete().eq('id', selectedPayment.id);
    if (error) {
      console.error('Erreur delete payment:', error);
      toast({ title: 'Erreur', description: `Impossible de supprimer: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Paiement supprimé' });
      setIsDeleteDialogOpen(false);
      fetchAll();
    }
  };

  const getAmountForType = (type: string, months = 1) => {
    if (!activeSeason) return '';
    if (type === 'registration') return String(activeSeason.registration_fee);
    if (type === 'monthly') return String(activeSeason.monthly_fee * months);
    if (type === 'annual') return String(activeSeason.annual_total);
    return '';
  };

  const toggleMonth = (m: number) => {
    const next = selectedMonths.includes(m)
      ? selectedMonths.filter(x => x !== m)
      : [...selectedMonths, m];
    setSelectedMonths(next);
    if (formData.payment_type === 'monthly' && activeSeason) {
      setFormData(f => ({ ...f, amount: String(activeSeason.monthly_fee * next.length) }));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'VALIDATED') return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Validé</Badge>;
    return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = { registration: 'Inscription', monthly: 'Mensualité', annual: 'Annuel', other: 'Autre' };
    return labels[type] || type;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = { cash: 'Espèces', wave: 'Wave', transfer: 'Virement', other: 'Autre' };
    return labels[method] || method;
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Paiements</h1>
            <p className="text-muted-foreground">Historique des transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 bg-white border-green-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Encaissé (Validé)</Label>
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 truncate">
                {payments
                  .filter(p => p.status === 'VALIDATED')
                  .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                  .toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </Card>

          <div className="flex items-stretch no-print">
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="w-full h-full min-h-[50px] bg-navy hover:bg-navy-light text-base rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Nouveau paiement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[95vw] rounded-xl overflow-hidden p-0">
                <div className="p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle>{selectedPayment ? 'Modifier le paiement' : showWavePayment ? 'Paiement Wave' : 'Nouveau paiement'}</DialogTitle>
                  </DialogHeader>
                  {showWavePayment ? (
                    <WavePayment
                      amount={parseInt(formData.amount) || 0}
                      memberId={formData.member_id}
                      seasonId={formData.season_id}
                      paymentType={formData.payment_type}
                      monthNumber={formData.month_number}
                      onSuccess={() => { setIsDialogOpen(false); resetForm(); fetchAll(); toast({ title: 'Succès', description: 'Paiement Wave enregistré' }); }}
                      onCancel={() => setShowWavePayment(false)}
                    />
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                      {!isMemberOnly && (
                        <div className="space-y-2">
                          <Label>Pratiquant</Label>
                          <Select value={formData.member_id} onValueChange={(v) => setFormData({ ...formData, member_id: v })}>
                            <SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner un pratiquant" /></SelectTrigger>
                            <SelectContent>
                              {members.map(m => <SelectItem key={m.id} value={m.id}>{m.last_name} {m.first_name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Saison</Label>
                        <Select value={formData.season_id} onValueChange={(v) => setFormData({ ...formData, season_id: v })}>
                          <SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner une saison" /></SelectTrigger>
                          <SelectContent>
                            {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={formData.payment_type} onValueChange={(v) => {
                            const amount = getAmountForType(v);
                            setFormData({ ...formData, payment_type: v, amount });
                          }}>
                            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Mensualité</SelectItem>
                              <SelectItem value="registration">Inscription</SelectItem>
                              <SelectItem value="annual">Annuel</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Méthode</Label>
                          <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Espèces</SelectItem>
                              <SelectItem value="wave">Wave</SelectItem>
                              <SelectItem value="transfer">Virement</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {formData.payment_type === 'monthly' && !selectedPayment && (
                        <div className="space-y-2">
                          <Label>
                            Mois
                            {selectedMonths.length > 0 && (
                              <span className="ml-2 text-xs font-normal text-navy bg-navy/10 px-2 py-0.5 rounded-full">
                                {selectedMonths.length} sélectionné(s)
                              </span>
                            )}
                          </Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {monthNames.map((name, i) => {
                              const m = i + 1;
                              const active = selectedMonths.includes(m);
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => toggleMonth(m)}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${active
                                    ? 'bg-navy text-white border-navy'
                                    : 'bg-white text-navy border-navy/20 hover:border-navy hover:bg-navy/5'
                                    }`}
                                >
                                  {name.slice(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {formData.payment_type === 'monthly' && !selectedPayment && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Montant total (FCFA)</Label>
                            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="rounded-lg" placeholder="Calculé automatiquement" />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} required className="rounded-lg" />
                          </div>
                        </div>
                      )}
                      {formData.payment_type === 'monthly' && selectedPayment && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Montant (FCFA)</Label>
                            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="rounded-lg" />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} required className="rounded-lg" />
                          </div>
                        </div>
                      )}
                      {!selectedPayment && formData.payment_type !== 'monthly' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Montant (FCFA)</Label>
                            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="rounded-lg" />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} required className="rounded-lg" />
                          </div>
                        </div>
                      )}
                      {canManage && (
                        <div className="space-y-2">
                          <Label>Statut</Label>
                          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VALIDATED">Validé</SelectItem>
                              <SelectItem value="PENDING">En attente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optionnel" className="rounded-lg" />
                      </div>
                      <Button type="submit" className="w-full bg-navy hover:bg-navy-light py-6 text-lg rounded-xl mt-2">
                        {selectedPayment ? 'Modifier' : 'Enregistrer'}
                      </Button>
                    </form>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des paiements...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun paiement enregistré</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap font-bold">Pratiquant</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Type</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Mois</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Méthode</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Montant</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Date</TableHead>
                      <TableHead className="whitespace-nowrap font-bold">Statut</TableHead>
                      <TableHead className="text-right whitespace-nowrap font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap">
                          {payment.members ? `${payment.members.last_name} ${payment.members.first_name}` : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{getPaymentTypeLabel(payment.payment_type)}</TableCell>
                        <TableCell className="whitespace-nowrap">{payment.month_number ? monthNames[payment.month_number - 1] : '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{getMethodLabel(payment.payment_method)}</TableCell>
                        <TableCell className="font-bold whitespace-nowrap text-navy">{payment.amount.toLocaleString()} F</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground font-mono text-xs">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="whitespace-nowrap">{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            {payment.proof_url && (
                              <Button variant="ghost" size="icon" onClick={() => window.open(payment.proof_url!, '_blank')} className="h-8 w-8 hover:bg-navy/10 hover:text-navy transition-colors" title="Voir la preuve">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => handleValidate(payment)}
                                  title={payment.status === 'VALIDATED' ? 'Mettre en attente' : 'Valider'}
                                  className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors"
                                >
                                  <Check className={`h-4 w-4 ${payment.status === 'VALIDATED' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(payment)} className="h-8 w-8 hover:bg-navy/10 hover:text-navy transition-colors">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedPayment(payment); setIsDeleteDialogOpen(true); }} className="text-destructive h-8 w-8 hover:bg-destructive/10 transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-lg">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}