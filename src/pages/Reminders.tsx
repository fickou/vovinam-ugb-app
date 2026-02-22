import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCircle2, AlertCircle, History, Clock, UserX, UserCheck, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReminderHistory {
    id: string;
    member_id: string;
    type: string;
    month_number: number | null;
    status: string;
    sent_at: string | null;
    created_at: string;
    members: { first_name: string; last_name: string } | null;
    seasons: { name: string } | null;
}

interface DelinquentMember {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    member_number: string | null;
    owes_registration: boolean;
    unpaid_months: number[];
}

export default function Reminders() {
    const [history, setHistory] = useState<ReminderHistory[]>([]);
    const [delinquents, setDelinquents] = useState<DelinquentMember[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Fetch reminder history
            const { data: historyData } = await supabase
                .from('reminders')
                .select('*, members(first_name, last_name), seasons(name)')
                .order('created_at', { ascending: false })
                .limit(100);

            setHistory((historyData as ReminderHistory[]) || []);

            // Calculate delinquents from Supabase data
            const { data: activeSeason } = await supabase.from('seasons').select('*').eq('is_active', true).maybeSingle();
            if (!activeSeason) {
                setDelinquents([]);
                setLoading(false);
                return;
            }

            const { data: members } = await supabase
                .from('members')
                .select('id, first_name, last_name, phone, member_number')
                .eq('status', 'active');

            const { data: payments } = await supabase
                .from('payments')
                .select('member_id, payment_type, month_number, status')
                .eq('season_id', activeSeason.id)
                .eq('status', 'VALIDATED');

            if (!members || !payments) {
                setLoading(false);
                return;
            }

            const paymentsByMember: Record<string, { types: Set<string>; months: Set<number> }> = {};
            payments.forEach(p => {
                if (!paymentsByMember[p.member_id]) {
                    paymentsByMember[p.member_id] = { types: new Set(), months: new Set() };
                }
                paymentsByMember[p.member_id].types.add(p.payment_type);
                if (p.payment_type === 'monthly' && p.month_number) {
                    paymentsByMember[p.member_id].months.add(p.month_number);
                }
            });

            const seasonStart = new Date(activeSeason.start_date);
            const now = new Date();

            const delinquentList: DelinquentMember[] = [];
            members.forEach(member => {
                const memberPayments = paymentsByMember[member.id] || { types: new Set(), months: new Set() };

                // Check registration
                const owes_registration = !memberPayments.types.has('registration') && !memberPayments.types.has('annual');

                // Check monthly payments (from season start to current month - 1)
                const unpaid_months: number[] = [];
                if (!memberPayments.types.has('annual')) {
                    // Start from the season start date
                    let checkDate = new Date(seasonStart.getFullYear(), seasonStart.getMonth(), 1);
                    // End at the beginning of the current month
                    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

                    while (checkDate < currentMonthStart) {
                        const m = checkDate.getMonth() + 1;
                        if (!memberPayments.months.has(m)) {
                            unpaid_months.push(m);
                        }
                        // Advance one month
                        checkDate.setMonth(checkDate.getMonth() + 1);
                    }
                }

                if (owes_registration || unpaid_months.length > 0) {
                    delinquentList.push({
                        id: member.id,
                        first_name: member.first_name,
                        last_name: member.last_name,
                        phone: member.phone,
                        member_number: member.member_number,
                        owes_registration,
                        unpaid_months,
                    });
                }
            });

            setDelinquents(delinquentList);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        const { error } = await supabase.from('reminders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
            toast({ title: 'Erreur', description: 'Impossible de supprimer l\'historique.', variant: 'destructive' });
        } else {
            toast({ title: 'Historique effacé', description: 'Tout l\'historique des rappels a été supprimé.' });
            fetchAll();
        }
    };

    const recordReminder = async (memberId: string, type: string, monthNumber?: number) => {
        const { data: activeSeason } = await supabase.from('seasons').select('id').eq('is_active', true).maybeSingle();
        if (!activeSeason) return;

        const { error } = await supabase.from('reminders').insert({
            member_id: memberId,
            season_id: activeSeason.id,
            type,
            month_number: monthNumber || null,
            status: 'sent',
            sent_at: new Date().toISOString(),
        });

        if (error) {
            toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le rappel.', variant: 'destructive' });
        } else {
            toast({
                title: 'Rappel enregistré',
                description: 'Le rappel a été enregistré. Note : l\'envoi SMS n\'est pas disponible dans cette version.',
            });
            fetchAll();
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'sent') return <Badge className="bg-green-100 text-green-800 border-green-200">Enregistré</Badge>;
        if (status === 'failed') return <Badge variant="destructive">Échec</Badge>;
        return <Badge variant="outline">En attente</Badge>;
    };

    const getMonthName = (num: number | null) => {
        if (!num) return '-';
        return format(new Date(2024, num - 1), 'MMMM', { locale: fr });
    };

    const getShortMonthName = (num: number) =>
        format(new Date(2024, num - 1), 'MMM', { locale: fr }).toUpperCase();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Rappels de Paiement</h1>
                        <p className="text-muted-foreground">Suivi des retards et notifications</p>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        <Bell className="h-4 w-4 flex-shrink-0" />
                        <span>L'envoi SMS n'est pas disponible dans cette version. Utilisez Wave ou appelez directement.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-3 w-3" />Planning
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-blue-900 leading-snug">
                                Vérifiez manuellement les retards et enregistrez les rappels.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-red-800 uppercase tracking-wider flex items-center gap-2">
                                <UserX className="h-3 w-3" />État Actuel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-red-900">{delinquents.length} membre(s) en retard</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-green-800 uppercase tracking-wider flex items-center gap-2">
                                <UserCheck className="h-3 w-3" />Traitement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-green-900 leading-snug">Enregistrez les rappels pour garder un historique.</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="delinquents" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="delinquents" className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />En retard
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />Historique
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="delinquents" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Liste des personnes en retard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground animate-pulse">Calcul des retards...</div>
                                ) : delinquents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic flex flex-col items-center gap-2">
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        Tout le monde est à jour !
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>N°</TableHead>
                                                <TableHead>Pratiquant</TableHead>
                                                <TableHead>Manquant</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {delinquents.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-mono text-xs">{member.member_number}</TableCell>
                                                    <TableCell className="font-semibold">
                                                        {member.first_name} {member.last_name}
                                                        <p className="text-xs text-muted-foreground font-normal">{member.phone}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.owes_registration && (
                                                                <Badge variant="destructive" className="text-[10px] font-bold">INSCRIPTION</Badge>
                                                            )}
                                                            {member.unpaid_months.map(m => (
                                                                <Badge key={m} className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] font-bold uppercase">
                                                                    {getShortMonthName(m)}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (member.owes_registration) recordReminder(member.id, 'registration');
                                                                if (member.unpaid_months.length > 0) recordReminder(member.id, 'monthly', member.unpaid_months[0]);
                                                            }}
                                                        >
                                                            Enregistrer rappel
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Historique des communications</CardTitle>
                                {history.length > 0 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" className="gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Effacer l'historique
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                <AlertDialogDescription>Cette action supprimera tout l'historique des rappels envoyés.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={clearHistory} className="bg-red-600 hover:bg-red-700">Confirmer</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground">Chargement...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic">Aucun rappel enregistré pour le moment.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Pratiquant</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Mois</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(item.sent_at || item.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.members ? `${item.members.first_name} ${item.members.last_name}` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {item.type === 'registration' ? 'Inscription' : 'Mensualité'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{getMonthName(item.month_number)}</TableCell>
                                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
