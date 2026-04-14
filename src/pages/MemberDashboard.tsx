import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  CreditCard,
  Trophy,
  Calendar,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_date: string;
  month_number: number | null;
  status: string;
}

interface Season {
  id: string;
  name: string;
  monthly_fee: number;
  registration_fee: number;
  is_active: boolean;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  member_number: string | null;
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WAVE_NUMBER = '75 557 55 51';
const WAVE_NAME = 'Kadia Ba';

export default function MemberDashboard() {
  const { user, profile, roles } = useAuth() as any;
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isMember = roles?.includes('member');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer la saison active
      const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      setActiveSeason(seasons);

      // 2. Trouver le membre lié à ce profil
      if (profile) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id, first_name, last_name, member_number')
          .ilike('first_name', profile.first_name || '')
          .ilike('last_name', profile.last_name || '')
          .maybeSingle();

        setMember(memberData);

        // 3. Si on a trouvé le membre, charger ses paiements de la saison active
        if (memberData && seasons) {
          const { data: paymentsData } = await supabase
            .from('payments')
            .select('*')
            .eq('member_id', memberData.id)
            .eq('season_id', seasons.id)
            .order('month_number');

          setPayments((paymentsData as Payment[]) || []);
        }
      }
    } catch (err) {
      console.error('Erreur chargement dashboard membre:', err);
    } finally {
      setLoading(false);
    }
  };

  const isMonthPaid = (monthNum: number): Payment | undefined => {
    return payments.find(
      (p) => p.month_number === monthNum && p.payment_type === 'monthly' && p.status === 'VALIDATED'
    );
  };

  const isMonthPending = (monthNum: number): Payment | undefined => {
    return payments.find(
      (p) => p.month_number === monthNum && p.payment_type === 'monthly' && p.status === 'PENDING'
    );
  };

  const hasRegistrationFee = payments.some(
    (p) => p.payment_type === 'registration' && p.status === 'VALIDATED'
  );

  const paidMonthsCount = payments.filter(
    (p) => p.payment_type === 'monthly' && p.status === 'VALIDATED' && p.month_number
  ).length;

  const totalPaid = payments
    .filter((p) => p.status === 'VALIDATED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const copyNumber = () => {
    navigator.clipboard.writeText(WAVE_NUMBER.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-navy border-t-transparent rounded-full" />
            <p className="text-muted-foreground text-sm">Chargement de votre espace…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        {/* ── Welcome Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-light p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-martial/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">
                  {greeting()},
                </p>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">
                  {profile?.first_name || 'Membre'} {profile?.last_name || ''}
                </h1>
                {member?.member_number && (
                  <p className="text-white/60 text-xs mt-1 font-mono">
                    N° {member.member_number}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                  <Trophy className="h-4 w-4 text-amber-300" />
                  <span className="text-sm font-semibold">
                    {activeSeason?.name || 'Saison en cours'}
                  </span>
                </div>
                {hasRegistrationFee ? (
                  <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 text-green-300" />
                    <span className="text-sm font-medium text-green-200">Inscription validée</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-2">
                    <Clock className="h-4 w-4 text-amber-300" />
                    <span className="text-sm font-medium text-amber-200">Inscription en attente</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-green-700/70">Mois payés</span>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700">{paidMonthsCount}</p>
              <p className="text-xs text-green-600/70 mt-1">sur {monthNames.length} mois</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-sky-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700/70">Total payé</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700">{totalPaid.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-blue-600/70 mt-1">FCFA cette saison</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-violet-50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700/70">Frais mensuels</span>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {activeSeason?.monthly_fee?.toLocaleString('fr-FR') || '—'}
              </p>
              <p className="text-xs text-purple-600/70 mt-1">FCFA / mois</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Monthly Grid ── */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/40 border-b px-6 py-4">
            <CardTitle className="text-navy flex items-center gap-2 text-base font-bold">
              <Calendar className="h-5 w-5" />
              Suivi des mensualités — {activeSeason?.name || ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!member ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucun dossier membre associé à votre compte.</p>
                <p className="text-xs mt-1">Contactez l'administrateur pour lier votre compte.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {monthNames.map((name, i) => {
                  const monthNum = i + 1;
                  const paid = isMonthPaid(monthNum);
                  const pending = isMonthPending(monthNum);

                  return (
                    <div
                      key={monthNum}
                      className={`relative rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all
                        ${paid
                          ? 'bg-green-50 border-green-200 shadow-sm'
                          : pending
                            ? 'bg-amber-50 border-amber-200 shadow-sm'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                    >
                      <span className={`text-xs font-bold uppercase tracking-wide
                        ${paid ? 'text-green-700' : pending ? 'text-amber-700' : 'text-gray-400'}`}>
                        {name.slice(0, 3)}
                      </span>
                      <span className="text-sm font-bold text-gray-500">{name.slice(3)}</span>

                      {paid ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <span className="text-[10px] text-green-600 font-semibold">Payé</span>
                          <span className="text-[10px] text-green-500/70">
                            {paid.amount.toLocaleString()} F
                          </span>
                        </div>
                      ) : pending ? (
                        <div className="flex flex-col items-center gap-1">
                          <Clock className="h-6 w-6 text-amber-500" />
                          <span className="text-[10px] text-amber-600 font-semibold">En attente</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <XCircle className="h-6 w-6 text-gray-300" />
                          <span className="text-[10px] text-gray-400 font-semibold">Non payé</span>
                          {activeSeason && (
                            <span className="text-[10px] text-gray-400">
                              {activeSeason.monthly_fee.toLocaleString()} F
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Wave Payment Section ── */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="border-b px-6 py-4 bg-gradient-to-r from-[#1a73e8]/5 to-transparent">
            <CardTitle className="text-navy flex items-center gap-2 text-base font-bold">
              <Smartphone className="h-5 w-5 text-[#1a73e8]" />
              Payer par Wave
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">

              {/* Left — Info */}
              <div className="flex-1 space-y-5">
                <div className="bg-[#1a73e8]/5 border border-[#1a73e8]/20 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-navy">Effectuez votre paiement Wave :</p>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1a73e8]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-[#1a73e8]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Numéro de compte</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold font-mono text-navy tracking-widest">
                          {WAVE_NUMBER}
                        </p>
                        <button
                          onClick={copyNumber}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-navy/10 transition-colors"
                          title="Copier le numéro"
                        >
                          {copied
                            ? <Check className="h-4 w-4 text-green-500" />
                            : <Copy className="h-4 w-4 text-navy/50" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white/60 border border-[#1a73e8]/10 rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground">Nom :</span>
                    <span className="text-sm font-semibold text-navy">{WAVE_NAME}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">📋 Étapes à suivre</p>
                  <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                    <li>Ouvrez Wave et envoyez le montant exact au numéro ci-dessus</li>
                    <li>Faites une capture d'écran du message de confirmation</li>
                    <li>
                      Partagez cette capture au 78 282 96 73
                    </li>
                  </ol>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
                  <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-navy/40" />
                  <span>
                    Le paiement sera enregistré après validation par l'administrateur.
                    <strong className="text-navy"> L'intégration automatique Wave est en cours de déploiement.</strong>
                  </span>
                </div>
              </div>

              {/* Right — QR Code placeholder */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="p-3 bg-white border-2 border-[#1a73e8]/20 rounded-2xl shadow-md">
                  <div className="w-40 h-40 bg-gradient-to-br from-[#1a73e8]/10 to-[#1a73e8]/5 rounded-xl flex flex-col items-center justify-center gap-2">
                    <Smartphone className="h-12 w-12 text-[#1a73e8]/40" />
                    <p className="text-[10px] text-center text-[#1a73e8]/50 font-medium px-2">
                      QR Code Wave<br />disponible bientôt
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center max-w-[160px]">
                  Scannez ou utilisez le numéro directement dans votre app Wave
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
