import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Calendar, AlertTriangle, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalPayments: number;
  totalExpenses: number;
  netBalance: number;
  activeSeason: string | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    totalPayments: 0,
    totalExpenses: 0,
    netBalance: 0,
    activeSeason: null,
  });
  const [loading, setLoading] = useState(true);
  const { isStaff, isAdmin, roles } = useAuth();
  const isMember = roles.includes('member');
  const canManagePayments = roles.some(r => ['super_admin', 'admin', 'treasurer'].includes(r));

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [membersRes, paymentsRes, expensesRes, seasonRes] = await Promise.all([
        supabase.from('members').select('id, status'),
        supabase.from('payments').select('amount').eq('status', 'VALIDATED'),
        supabase.from('expenses').select('amount'),
        supabase.from('seasons').select('name').eq('is_active', true).maybeSingle(),
      ]);

      const members = membersRes.data || [];
      const payments = paymentsRes.data || [];
      const expenses = expensesRes.data || [];

      const totalEncaissé = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const totalDépensé = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      setStats({
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        totalPayments: totalEncaissé,
        totalExpenses: totalDépensé,
        netBalance: totalEncaissé - totalDépensé,
        activeSeason: seasonRes.data?.name || null,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Pratiquants',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-navy',
      show: isStaff,
    },
    {
      title: 'Pratiquants Actifs',
      value: stats.activeMembers,
      icon: Users,
      color: 'bg-green-600',
      show: isStaff,
    },
    {
      title: 'Total Encaissé',
      value: `${stats.totalPayments.toLocaleString()} FCFA`,
      icon: CreditCard,
      color: 'bg-green-600',
      show: isStaff,
    },
    {
      title: 'Total Dépenses',
      value: `${stats.totalExpenses.toLocaleString()} FCFA`,
      icon: Wallet,
      color: 'bg-red-martial',
      show: isStaff,
    },
    {
      title: 'Solde Net',
      value: `${stats.netBalance.toLocaleString()} FCFA`,
      icon: Wallet,
      color: stats.netBalance >= 0 ? 'bg-navy' : 'bg-red-600',
      show: isStaff,
    },
    {
      title: 'Saison Active',
      value: stats.activeSeason || 'Aucune',
      icon: Calendar,
      color: 'bg-gold-accent',
      show: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Tableau de bord</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {statCards.filter(s => s.show).map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 ${stat.color} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`}></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color.replace('bg-', 'text-')}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold font-display truncate">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                Aucune alerte pour le moment
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMember && (
                <a
                  href="/dashboard/payments"
                  className="group block p-4 rounded-xl bg-red-martial/5 hover:bg-red-martial/10 transition-all border border-red-martial/20 hover:border-red-martial/40"
                >
                  <div className="font-bold text-red-martial flex items-center gap-2 mb-1">
                    <Wallet className="h-5 w-5" />
                    Payer ma cotisation
                  </div>
                  <div className="text-sm text-red-martial/80">Effectuer un paiement sécurisé via Wave</div>
                </a>
              )}

              <div className="grid grid-cols-1 gap-2">
                {isStaff && (
                  <>
                    {isAdmin && (
                      <a
                        href="/dashboard/members"
                        className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-all sm:p-4"
                      >
                        <Users className="h-5 w-5 text-navy shrink-0" />
                        <div>
                          <div className="font-semibold text-sm md:text-base">Ajouter un pratiquant</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">Inscrire un nouveau membre</div>
                        </div>
                      </a>
                    )}
                    {canManagePayments && (
                      <a
                        href="/dashboard/payments"
                        className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-all sm:p-4"
                      >
                        <CreditCard className="h-5 w-5 text-navy shrink-0" />
                        <div>
                          <div className="font-semibold text-sm md:text-base">Enregistrer un paiement</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">Ajouter une nouvelle transaction</div>
                        </div>
                      </a>
                    )}
                    <a
                      href="/dashboard/seasons"
                      className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-all sm:p-4"
                    >
                      <Calendar className="h-5 w-5 text-navy shrink-0" />
                      <div>
                        <div className="font-semibold text-sm md:text-base">Gérer les saisons</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Configurer les tarifs et périodes</div>
                      </div>
                    </a>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
