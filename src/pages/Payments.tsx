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
import { Plus, CreditCard, Search, Pencil, Trash2, CheckCircle, XCircle, Eye, Printer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import WavePayment from '@/components/WavePayment';
import waveQrCode from '@/assets/wave-qr-code.png';
import { QrCode, Info } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_date: string;
  month_number: number | null;
  notes: string | null;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  proof_url: string | null;
  created_at: string;
  member_id: string;
  season_id: string;
  member: {
    first_name: string;
    last_name: string;
    member_number: string | null;
  };
  season: {
    name: string;
  };
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  member_number: string | null;
  status: string;
}

interface Season {
  id: string;
  name: string;
  registration_fee: number;
  monthly_fee: number;
  is_active?: boolean;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showWavePayment, setShowWavePayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    member_id: '',
    season_id: '',
    amount: 0,
    payment_type: 'monthly',
    payment_method: 'wave',
    payment_date: new Date().toISOString().split('T')[0],
    month_number: '',
    notes: '',
  });
  const { toast } = useToast();
  const { user, isStaff, roles } = useAuth();
  const isOnlyMember = roles.length === 1 && roles[0] === 'member';
  const canManagePayments = roles.some(r => ['super_admin', 'admin', 'treasurer'].includes(r));

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [paymentsRes, membersRes, seasonsRes] = await Promise.all([
        api.get('/payments.php?with_relations=true'),
        api.get('/members.php'),
        api.get('/seasons.php')
      ]);

      // If user is only a member, fetch their member details
      let memberData = null;
      if (user && isOnlyMember) {
        memberData = await api.get(`/members.php?user_id=${user.id}`);
        setCurrentMember(memberData);
        if (memberData) {
          setFormData(prev => ({ ...prev, member_id: memberData.id }));
        }
      }

      // Filter payments if user is only a member
      let filteredRes = paymentsRes || [];
      if (user && isOnlyMember && memberData) {
        filteredRes = filteredRes.filter((p: Payment) => p.member_id === memberData.id);
      }

      setPayments(filteredRes);
      setMembers(membersRes || []);

      const seasonsData = seasonsRes || [];
      setSeasons(seasonsData);

      const activeSeason = seasonsData.find((s: Season) => s.is_active);
      if (activeSeason) {
        setFormData(prev => ({ ...prev, season_id: activeSeason.id }));
        // Set default amount
        if (formData.payment_type === 'registration') {
          setFormData(prev => ({ ...prev, amount: activeSeason.registration_fee }));
        } else if (formData.payment_type === 'monthly') {
          setFormData(prev => ({ ...prev, amount: activeSeason.monthly_fee }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const activeSeason = seasons.find(s => s.is_active);
    setFormData({
      member_id: currentMember?.id || '',
      season_id: activeSeason?.id || '',
      amount: activeSeason ? (formData.payment_type === 'registration' ? activeSeason.registration_fee : activeSeason.monthly_fee) : 0,
      payment_type: 'monthly',
      payment_method: 'wave',
      payment_date: new Date().toISOString().split('T')[0],
      month_number: '',
      notes: '',
    });
    setSelectedPayment(null);
    setShowWavePayment(false);
  };

  const openEditDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormData({
      member_id: payment.member_id,
      season_id: payment.season_id,
      amount: payment.amount,
      payment_type: payment.payment_type,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date.split('T')[0],
      month_number: payment.month_number?.toString() || '',
      notes: payment.notes || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.member_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un pratiquant',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.season_id) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une saison',
        variant: 'destructive',
      });
      return;
    }

    if (formData.payment_type === 'monthly' && !formData.month_number) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner le mois concerné',
        variant: 'destructive',
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant doit être supérieur à 0',
        variant: 'destructive',
      });
      return;
    }

    // If Wave is selected and it's a new payment, show WavePayment component
    if (!selectedPayment && formData.payment_method === 'wave') {
      setShowWavePayment(true);
      return;
    }

    try {
      if (selectedPayment) {
        await api.put('/payments.php', {
          id: selectedPayment.id,
          ...formData,
          month_number: formData.month_number ? parseInt(formData.month_number) : null,
          recorded_by: user?.id
        });

        toast({
          title: 'Succès',
          description: 'Paiement modifié avec succès',
        });
      } else {
        await api.post('/payments.php', {
          ...formData,
          month_number: formData.month_number ? parseInt(formData.month_number) : null,
          recorded_by: user?.id,
          status: 'VALIDATED' // Manual payments are validated by default
        });

        toast({
          title: 'Succès',
          description: 'Paiement enregistré avec succès',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: 'Erreur',
        description: selectedPayment ? 'Impossible de modifier le paiement' : 'Impossible d\'enregistrer le paiement',
        variant: 'destructive',
      });
    }
  };

  const updateStatus = async (paymentId: string, newStatus: 'VALIDATED' | 'REJECTED') => {
    try {
      await api.put('/payments.php', {
        id: paymentId,
        status: newStatus,
        recorded_by: user?.id
      });

      toast({
        title: 'Succès',
        description: `Paiement ${newStatus === 'VALIDATED' ? 'validé' : 'refusé'} avec succès`,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      await api.delete(`/payments.php?id=${selectedPayment.id}`);

      toast({
        title: 'Succès',
        description: 'Paiement supprimé avec succès',
      });

      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le paiement',
        variant: 'destructive',
      });
    }
  };

  const updateAmountBasedOnType = (type: string) => {
    const selectedSeason = seasons.find(s => s.id === formData.season_id);
    if (selectedSeason) {
      if (type === 'registration') {
        setFormData(prev => ({ ...prev, payment_type: type, amount: selectedSeason.registration_fee }));
      } else if (type === 'monthly') {
        setFormData(prev => ({ ...prev, payment_type: type, amount: selectedSeason.monthly_fee }));
      } else {
        setFormData(prev => ({ ...prev, payment_type: type }));
      }
    } else {
      setFormData(prev => ({ ...prev, payment_type: type }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPayments = payments.filter(
    (p) => {
      const matchesSearch =
        p.member?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.member?.member_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || p.payment_type === typeFilter;

      return matchesSearch && matchesType;
    }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const resolveProofUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // The path from API is like "/uploads/proofs/filename.jpg"
    // We need to prepend the project root.
    // In many local setups, the project is at http://localhost/vovinam
    const projectRoot = 'http://localhost/vovinam';

    // Remove leading slash from path to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${projectRoot}/${cleanPath}`;
  };

  const getPaymentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      registration: 'bg-blue-100 text-blue-800',
      monthly: 'bg-green-100 text-green-800',
      annual: 'bg-purple-100 text-purple-800',
      other: 'bg-slate-100 text-slate-800',
    };
    const labels: Record<string, string> = {
      registration: 'Inscription',
      monthly: 'Mensualité',
      annual: 'Annuel',
      other: 'Autre',
    };
    return (
      <Badge className={colors[type] || 'bg-gray-100'}>
        {labels[type] || type}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      wave: 'bg-orange-100 text-orange-800',
      cash: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800',
    };
    const labels: Record<string, string> = {
      wave: 'Wave',
      cash: 'Espèces',
      other: 'Autre',
    };
    return (
      <Badge variant="outline" className={colors[method]}>
        {labels[method] || method}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'En attente', className: 'bg-amber-100 text-amber-800 border-amber-200' },
      VALIDATED: { label: 'Validé', className: 'bg-green-100 text-green-800 border-green-200' },
      REJECTED: { label: 'Refusé', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    const config = configs[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Paiements</h1>
            <p className="text-muted-foreground">Gérez les paiements et mensualités</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-[#1cbcfc]/30 shadow-sm border-l-4 border-l-[#1cbcfc]">
            <div className="bg-[#1cbcfc]/10 p-1.5 rounded-lg border border-[#1cbcfc]/20">
              <img
                src={waveQrCode}
                alt="Wave QR Code"
                className="h-16 w-16 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#1cbcfc] font-bold mb-1">
                <QrCode className="h-4 w-4" />
                <span>Wave : Daouda fickou</span>
              </div>
              <p className="text-xs text-navy/70 leading-tight">
                Scannez le code marchand officiel<br />
                ou envoyez au <strong>75 557 55 51</strong>
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <div className="flex gap-2 no-print">
              <Button onClick={handlePrint} variant="outline" className="border-navy text-navy hover:bg-navy/5">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer la liste
              </Button>
              {(canManagePayments || isOnlyMember) && (
                <DialogTrigger asChild>
                  <Button className="bg-red-martial hover:bg-red-martial-light">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau paiement
                  </Button>
                </DialogTrigger>
              )}
            </div>
            <DialogContent className={`${showWavePayment ? 'max-w-sm' : 'max-w-md'} max-h-[85vh] overflow-y-auto`}>
              {!showWavePayment ? (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedPayment ? 'Modifier le paiement' : 'Enregistrer un paiement'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="member_id">Pratiquant</Label>
                      <Select
                        value={formData.member_id}
                        onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                        disabled={isOnlyMember && !!currentMember}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un pratiquant" />
                        </SelectTrigger>
                        <SelectContent>
                          {isOnlyMember && currentMember ? (
                            <SelectItem value={currentMember.id}>
                              {currentMember.first_name} {currentMember.last_name} ({currentMember.member_number})
                            </SelectItem>
                          ) : (
                            members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.first_name} {member.last_name} ({member.member_number})
                                {member.status !== 'active' && ` - [${member.status.toUpperCase()}]`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="season_id">Saison</Label>
                      <Select
                        value={formData.season_id}
                        onValueChange={(value) => setFormData({ ...formData, season_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une saison" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((season) => (
                            <SelectItem key={season.id} value={season.id}>
                              {season.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_type">Type de paiement</Label>
                      <Select
                        value={formData.payment_type}
                        onValueChange={updateAmountBasedOnType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registration">Inscription</SelectItem>
                          <SelectItem value="monthly">Mensualité</SelectItem>
                          <SelectItem value="annual">Annuel</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.payment_type === 'monthly' && (
                      <div className="space-y-2">
                        <Label htmlFor="month_number">Mois concerné</Label>
                        <Select
                          value={formData.month_number}
                          onValueChange={(value) => setFormData({ ...formData, month_number: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le mois" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant (FCFA)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Mode de paiement</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wave">Wave</SelectItem>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_date">Date du paiement</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Remarques..."
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-martial hover:bg-red-martial-light">
                      {selectedPayment ? 'Modifier' : formData.payment_method === 'wave' ? 'Continuer vers Wave' : 'Enregistrer le paiement'}
                    </Button>
                  </form>
                </>
              ) : (
                <WavePayment
                  amount={formData.amount}
                  memberId={formData.member_id}
                  seasonId={formData.season_id}
                  paymentType={formData.payment_type}
                  monthNumber={formData.month_number}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    resetForm();
                    fetchData();
                  }}
                  onCancel={() => setShowWavePayment(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="hidden print:block mb-8 text-center pt-4 border-b pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1cbcfc]">Vovinam UGB Sporting Club</h1>
          <p className="text-sm font-semibold mt-1">Liste des Paiements Effectués - {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <Card className="print:shadow-none print:border-none">
          <CardHeader className="no-print">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un paiement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Type de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="registration">Inscriptions</SelectItem>
                  <SelectItem value="monthly">Mensualités</SelectItem>
                  <SelectItem value="annual">Annuels</SelectItem>
                  <SelectItem value="other">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun paiement trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pratiquant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right no-print">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell className="font-medium">
                        <div>{payment.member?.first_name} {payment.member?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{payment.season?.name}</div>
                      </TableCell>
                      <TableCell>{getPaymentTypeBadge(payment.payment_type)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {payment.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right no-print">
                        <div className="flex justify-end gap-1">
                          {payment.proof_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Voir la preuve"
                              onClick={() => setPreviewUrl(resolveProofUrl(payment.proof_url!))}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}

                          {canManagePayments && payment.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateStatus(payment.id, 'VALIDATED')}
                                title="Valider"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateStatus(payment.id, 'REJECTED')}
                                title="Refuser"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {canManagePayments && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(payment)}
                                title="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(payment)}
                                className="text-destructive hover:text-destructive"
                                title="Supprimer"
                              >
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
            )}
          </CardContent>
        </Card>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce paiement de {selectedPayment?.amount.toLocaleString()} FCFA pour {selectedPayment?.member?.first_name} {selectedPayment?.member?.last_name} ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Preuve de paiement</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto bg-slate-50 rounded-lg flex items-center justify-center p-4">
              {previewUrl?.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-full border-none" />
              ) : (
                <img src={previewUrl || ''} alt="Preuve" className="max-w-full max-h-full object-contain shadow-md" />
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => window.open(previewUrl!, '_blank')} variant="outline" size="sm">
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}