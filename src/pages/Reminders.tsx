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
            id: crypto.randomUUID(),
            member_id: memberId,
            season_id: activeSeason.id,
            type,
            month_number: monthNumber || null,
            status: 'sent',
            sent_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Erreur insert reminder:', error);
            toast({ title: 'Erreur', description: `Impossible d'enregistrer le rappel: ${error.message}`, variant: 'destructive' });
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Rappels de Paiement</h1>
                        <p className="text-muted-foreground">Suivi des retards et notifications</p>
                    </div>
                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 shadow-sm max-w-xl">
                        <Bell className="h-5 w-5 flex-shrink-0 text-amber-600" />
                        <p className="leading-tight">
                            <span className="font-bold">Note :</span> L'envoi SMS n'est pas disponible. Utilisez Wave ou appelez directement les pratiquants.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-4 w-4" />Planning
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-blue-900 leading-snug">
                                Vérifiez manuellement les retards et enregistrez les rappels.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center gap-2">
                                <UserX className="h-4 w-4" />État Actuel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-red-900">{delinquents.length} membre(s) en retard</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100 shadow-sm transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase tracking-widest flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />Historique
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-green-900 leading-snug">
                                Les rappels enregistrés sont archivés pour votre suivi.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="delinquents" className="w-full">
                    <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto grid grid-cols-2 sm:flex sm:inline-flex">
                        <TabsTrigger value="delinquents" className="rounded-lg px-6 py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />En retard
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg px-6 py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <History className="h-4 w-4 mr-2" />Historique
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="delinquents" className="mt-6">
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardHeader className="bg-white pb-4 border-b">
                                <CardTitle className="text-xl font-display font-semibold text-navy">Personnes en retard</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6">
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground animate-pulse">Calcul des retards...</div>
                                ) : delinquents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        </div>
                                        <p className="text-lg font-medium text-green-700">Tout le monde est à jour !</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="whitespace-nowrap font-bold">N°</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Pratiquant</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Manquant</TableHead>
                                                    <TableHead className="text-right whitespace-nowrap font-bold no-print">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {delinquents.map((member) => (
                                                    <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{member.member_number}</TableCell>
                                                        <TableCell className="min-w-[180px]">
                                                            <div className="font-bold text-navy truncate">
                                                                {member.first_name} {member.last_name}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                                {member.phone || 'Pas de téléphone'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {member.owes_registration && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-tighter">
                                                                        INSCRIPTION
                                                                    </span>
                                                                )}
                                                                {member.unpaid_months.map(m => (
                                                                    <span key={m} className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[9px] font-black uppercase tracking-tighter">
                                                                        {getShortMonthName(m)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right no-print">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-9 px-4 rounded-xl border-navy/20 hover:border-navy hover:bg-navy/5 text-navy text-xs font-semibold overflow-hidden transition-all whitespace-nowrap"
                                                                onClick={() => {
                                                                    if (member.owes_registration) recordReminder(member.id, 'registration');
                                                                    if (member.unpaid_months.length > 0) recordReminder(member.id, 'monthly', member.unpaid_months[0]);
                                                                }}
                                                            >
                                                                Notifier
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardHeader className="bg-white pb-4 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-xl font-display font-semibold text-navy">Historique des communications</CardTitle>
                                {history.length > 0 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Effacer</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Effacer l'historique ?</AlertDialogTitle>
                                                <AlertDialogDescription>Cette action supprimera tout l'historique des rappels. C'est irréversible.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={clearHistory} className="bg-red-600 hover:bg-red-700 rounded-lg">Confirmer</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6">
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground">Chargement...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic">Aucun rappel enregistré pour le moment.</div>
                                ) : (
                                    <div className="overflow-x-auto w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="whitespace-nowrap font-bold">Date</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Pratiquant</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Type</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Mois</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {history.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="whitespace-nowrap text-muted-foreground font-mono text-[10px]">
                                                            {format(new Date(item.sent_at || item.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                        </TableCell>
                                                        <TableCell className="font-bold text-navy whitespace-nowrap">
                                                            {item.members ? `${item.members.first_name} ${item.members.last_name}` : '-'}
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'registration' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                                                {item.type === 'registration' ? 'Inscription' : 'Mensualité'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap font-medium">{getMonthName(item.month_number)}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{getStatusBadge(item.status)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
