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
import { Bell, CheckCircle2, AlertCircle, History, Clock, UserX, UserCheck, Trash2, Shield, Users } from 'lucide-react';
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
    guardian_name: string | null;
    guardian_phone: string | null;
    owes_registration: boolean;
    unpaid_months: number[];
}

// Groupe de tuteur : un tuteur avec plusieurs élèves en retard
interface GuardianGroup {
    guardian_name: string;
    guardian_phone: string;
    students: DelinquentMember[];
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
            const { data: historyData } = await supabase
                .from('reminders')
                .select('*, members(first_name, last_name), seasons(name)')
                .order('created_at', { ascending: false })
                .limit(100);

            setHistory((historyData as ReminderHistory[]) || []);

            const { data: activeSeason } = await supabase.from('seasons').select('*').eq('is_active', true).maybeSingle();
            if (!activeSeason) { setDelinquents([]); setLoading(false); return; }

            const { data: members } = await supabase
                .from('members')
                .select('id, first_name, last_name, phone, member_number, created_at, guardian_name, guardian_phone')
                .eq('status', 'active');

            const { data: payments } = await supabase
                .from('payments')
                .select('member_id, payment_type, month_number, status')
                .eq('season_id', activeSeason.id)
                .eq('status', 'VALIDATED');

            if (!members || !payments) { setLoading(false); return; }

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
                const owes_registration = !memberPayments.types.has('registration') && !memberPayments.types.has('annual');
                const unpaid_months: number[] = [];

                if (!memberPayments.types.has('annual')) {
                    const memberCreated = new Date(member.created_at);
                    let checkDate = new Date(Math.max(seasonStart.getTime(), memberCreated.getTime()));
                    checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1);
                    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

                    while (checkDate < currentMonthStart) {
                        const m = checkDate.getMonth() + 1;
                        if (!memberPayments.months.has(m)) unpaid_months.push(m);
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
                        guardian_name: (member as any).guardian_name ?? null,
                        guardian_phone: (member as any).guardian_phone ?? null,
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
            toast({ title: 'Erreur', description: "Impossible de supprimer l'historique.", variant: 'destructive' });
        } else {
            toast({ title: 'Historique effacé', description: "Tout l'historique des rappels a été supprimé." });
            fetchAll();
        }
    };

    // ── Normalise un numéro sénégalais ────────────────────────────────────────
    const normalizePhone = (phone: string) => {
        let p = phone.replace(/\D/g, '');
        if (p.length === 9 && p.startsWith('7')) p = '221' + p;
        return p;
    };

    // ── Construit le détail d'un pratiquant (pour le message) ────────────────
    const buildMemberDetail = (member: DelinquentMember, activeSeason: any): { text: string; amount: number } => {
        let amount = 0;
        const parts: string[] = [];

        if (member.owes_registration) {
            parts.push(`inscription (${activeSeason.registration_fee} FCFA)`);
            amount += activeSeason.registration_fee;
        }
        if (member.unpaid_months.length > 0) {
            const monthsStr = member.unpaid_months.map(m => format(new Date(2024, m - 1), 'MMMM', { locale: fr })).join(', ');
            const monthAmount = member.unpaid_months.length * activeSeason.monthly_fee;
            parts.push(`mensualités de ${monthsStr} (${monthAmount} FCFA)`);
            amount += monthAmount;
        }
        return { text: parts.join(' et '), amount };
    };

    // ── Rappel direct au pratiquant (comportement actuel) ────────────────────
    const handleSendReminder = async (member: DelinquentMember) => {
        const phone = member.phone;
        if (!phone) {
            toast({ title: 'Erreur', description: "Ce pratiquant n'a pas de numéro de téléphone.", variant: 'destructive' });
            return;
        }

        const { data: activeSeason } = await supabase.from('seasons').select('*').eq('is_active', true).maybeSingle();
        if (!activeSeason) { toast({ title: 'Erreur', description: 'Aucune saison active.', variant: 'destructive' }); return; }

        const { text: detailsStr, amount: totalAmount } = buildMemberDetail(member, activeSeason);
        const message = `Vovinam CLUB UGB:\nBonjour ${member.first_name.toUpperCase()} ${member.last_name.toUpperCase()}, rappel: ${detailsStr} non réglées. Total: ${totalAmount} FCFA. Wave au 75 557 55 51.`;

        window.open(`https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`, '_blank');

        const type = member.owes_registration ? 'registration' : 'monthly';
        const monthNumber = member.unpaid_months.length > 0 ? member.unpaid_months[0] : null;

        const { error } = await supabase.from('reminders').insert({
            id: crypto.randomUUID(),
            member_id: member.id,
            season_id: activeSeason.id,
            type, month_number: monthNumber,
            status: 'sent', sent_at: new Date().toISOString(),
        });

        if (!error) {
            toast({ title: 'Rappel enregistré' });
            fetchAll();
        }
    };

    // ── Rappel groupé au tuteur (plusieurs élèves) ───────────────────────────
    const handleSendGuardianReminder = async (group: GuardianGroup) => {
        const { data: activeSeason } = await supabase.from('seasons').select('*').eq('is_active', true).maybeSingle();
        if (!activeSeason) { toast({ title: 'Erreur', description: 'Aucune saison active.', variant: 'destructive' }); return; }

        let totalAmount = 0;
        const lines = group.students.map(student => {
            const { text, amount } = buildMemberDetail(student, activeSeason);
            totalAmount += amount;
            return `• ${student.last_name.toUpperCase()} ${student.first_name} : ${text}`;
        }).join('\n');

        const message = `Vovinam CLUB UGB:\nBonjour ${group.guardian_name}, rappel de paiement pour vos élève(s) :\n\n${lines}\n\nTotal : ${totalAmount} FCFA\nWave au 75 557 55 51.`;

        window.open(`https://wa.me/${normalizePhone(group.guardian_phone)}?text=${encodeURIComponent(message)}`, '_blank');

        // Enregistrer un rappel pour chaque élève du groupe
        for (const student of group.students) {
            const type = student.owes_registration ? 'registration' : 'monthly';
            const monthNumber = student.unpaid_months.length > 0 ? student.unpaid_months[0] : null;
            await supabase.from('reminders').insert({
                id: crypto.randomUUID(),
                member_id: student.id,
                season_id: activeSeason.id,
                type, month_number: monthNumber,
                status: 'sent', sent_at: new Date().toISOString(),
            });
        }

        toast({ title: `Rappel tuteur envoyé (${group.students.length} élève(s))` });
        fetchAll();
    };

    // ── Calcul des groupes tuteurs ───────────────────────────────────────────
    const guardianGroups: GuardianGroup[] = [];
    const guardianPhoneMap: Record<string, GuardianGroup> = {};

    delinquents.forEach(member => {
        if (member.guardian_phone) {
            if (!guardianPhoneMap[member.guardian_phone]) {
                guardianPhoneMap[member.guardian_phone] = {
                    guardian_name: member.guardian_name || 'Tuteur',
                    guardian_phone: member.guardian_phone,
                    students: [],
                };
                guardianGroups.push(guardianPhoneMap[member.guardian_phone]);
            }
            guardianPhoneMap[member.guardian_phone].students.push(member);
        }
    });

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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-red-50 border-red-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center gap-2">
                                <UserX className="h-4 w-4" />État Actuel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-red-900">{delinquents.length} membre(s) en retard</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="h-4 w-4" />Tuteurs concernés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold text-amber-900">{guardianGroups.length} tuteur(s)</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100 shadow-sm">
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
                    <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto grid grid-cols-3 sm:flex sm:inline-flex">
                        <TabsTrigger value="delinquents" className="rounded-lg px-4 py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />En retard
                        </TabsTrigger>
                        <TabsTrigger value="guardians" className="rounded-lg px-4 py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Shield className="h-4 w-4 mr-2" />Tuteurs
                            {guardianGroups.length > 0 && (
                                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                                    {guardianGroups.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg px-4 py-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <History className="h-4 w-4 mr-2" />Historique
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab En retard ─────────────────────────────────────── */}
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
                                                    <TableHead className="whitespace-nowrap font-bold">Tuteur</TableHead>
                                                    <TableHead className="whitespace-nowrap font-bold">Manquant</TableHead>
                                                    <TableHead className="text-right whitespace-nowrap font-bold no-print">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {delinquents.map((member) => (
                                                    <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{member.member_number}</TableCell>
                                                        <TableCell className="min-w-[160px]">
                                                            <div className="font-bold text-navy truncate">
                                                                {member.first_name} {member.last_name}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground font-mono mt-1">
                                                                {member.phone || 'Pas de téléphone'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="min-w-[130px]">
                                                            {member.guardian_name ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Shield className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-xs font-medium text-amber-800 leading-none">{member.guardian_name}</p>
                                                                        <p className="text-[10px] text-muted-foreground">{member.guardian_phone}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">—</span>
                                                            )}
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
                                                                className="h-9 px-4 rounded-xl border-navy/20 hover:border-navy hover:bg-navy/5 text-navy text-xs font-semibold whitespace-nowrap"
                                                                onClick={() => handleSendReminder(member)}
                                                            >
                                                                {member.guardian_phone ? '↗ Direct' : 'Notifier'}
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

                    {/* ── Tab Tuteurs ───────────────────────────────────────── */}
                    <TabsContent value="guardians" className="mt-6">
                        <Card className="overflow-hidden border-none shadow-md">
                            <CardHeader className="bg-white pb-4 border-b">
                                <CardTitle className="text-xl font-display font-semibold text-navy flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-500" />
                                    Rappels groupés par tuteur
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-4">
                                {loading ? (
                                    <div className="text-center py-12 animate-pulse text-muted-foreground">Chargement…</div>
                                ) : guardianGroups.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic flex flex-col items-center gap-3">
                                        <Shield className="h-10 w-10 text-muted-foreground/30" />
                                        <p>Aucun tuteur avec des élèves en retard.</p>
                                    </div>
                                ) : (
                                    guardianGroups.map((group) => (
                                        <div key={group.guardian_phone} className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                                            {/* En-tête tuteur */}
                                            <div className="flex items-center justify-between px-4 py-3 bg-amber-100/70 border-b border-amber-200">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-amber-600" />
                                                    <div>
                                                        <p className="font-bold text-amber-900 text-sm">{group.guardian_name}</p>
                                                        <p className="text-xs text-amber-700">{group.guardian_phone}</p>
                                                    </div>
                                                    <Badge className="ml-2 bg-amber-200 text-amber-800 border-amber-300 text-xs">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {group.students.length} élève(s)
                                                    </Badge>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                                                    onClick={() => handleSendGuardianReminder(group)}
                                                >
                                                    <Bell className="h-3.5 w-3.5" />
                                                    Notifier le tuteur
                                                </Button>
                                            </div>

                                            {/* Liste des élèves */}
                                            <div className="divide-y divide-amber-100">
                                                {group.students.map((student) => (
                                                    <div key={student.id} className="flex items-center justify-between px-4 py-2.5">
                                                        <div>
                                                            <p className="text-sm font-semibold text-navy">
                                                                {student.first_name} {student.last_name}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                                {student.member_number && `#${student.member_number} · `}{student.phone || ''}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 justify-end">
                                                            {student.owes_registration && (
                                                                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[9px] font-black uppercase">INSCRIPTION</span>
                                                            )}
                                                            {student.unpaid_months.map(m => (
                                                                <span key={m} className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[9px] font-black uppercase">
                                                                    {getShortMonthName(m)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Tab Historique ────────────────────────────────────── */}
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
