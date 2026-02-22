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
  activeSeason: string | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    totalPayments: 0,
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
      const [membersRes, paymentsRes, seasonRes] = await Promise.all([
        supabase.from('members').select('id, status'),
        supabase.from('payments').select('amount').eq('status', 'VALIDATED'),
        supabase.from('seasons').select('name').eq('is_active', true).maybeSingle(),
      ]);

      const members = membersRes.data || [];
      const payments = paymentsRes.data || [];

      setStats({
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        totalPayments: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
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
      color: 'bg-red-martial',
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.filter(s => s.show).map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-10 rounded-bl-full`}></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Aucune alerte pour le moment
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isMember && (
                <a
                  href="/dashboard/payments"
                  className="block p-3 rounded-lg bg-red-martial/10 hover:bg-red-martial/20 transition-colors border border-red-martial/20"
                >
                  <div className="font-bold text-red-martial flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Payer ma cotisation
                  </div>
                  <div className="text-sm text-red-martial/80">Effectuer un paiement via Wave</div>
                </a>
              )}

              {isStaff && (
                <>
                  {isAdmin && (
                    <a
                      href="/dashboard/members"
                      className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="font-medium">Ajouter un pratiquant</div>
                      <div className="text-sm text-muted-foreground">Inscrire un nouveau membre</div>
                    </a>
                  )}
                  {canManagePayments && (
                    <a
                      href="/dashboard/payments"
                      className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="font-medium">Enregistrer un paiement</div>
                      <div className="text-sm text-muted-foreground">Ajouter une nouvelle transaction</div>
                    </a>
                  )}
                  <a
                    href="/dashboard/seasons"
                    className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="font-medium">Gérer les saisons</div>
                    <div className="text-sm text-muted-foreground">Configurer les tarifs</div>
                  </a>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
