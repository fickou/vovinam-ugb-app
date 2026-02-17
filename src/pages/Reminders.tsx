import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, CheckCircle2, AlertCircle, History, Clock, UserX, UserCheck, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReminderHistory {
    id: string;
    member_id: string;
    first_name: string;
    last_name: string;
    season_name: string;
    type: 'registration' | 'monthly';
    month_number: number | null;
    status: 'sent' | 'failed' | 'pending';
    sent_at: string;
    created_at: string;
}

interface DelinquentMember {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    member_number: string;
    owes_registration: number;
    owes_monthly: number;
    unpaid_months?: number[]; // Added field
}

export default function Reminders() {
    const [history, setHistory] = useState<ReminderHistory[]>([]);
    const [delinquents, setDelinquents] = useState<DelinquentMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [historyData, delinquentsData] = await Promise.all([
                api.get('/notifications.php?mode=history'),
                api.get('/notifications.php?mode=delinquents')
            ]);
            setHistory(historyData || []);
            setDelinquents(delinquentsData || []);
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

    const getPreviousMonthDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
    };

    const getPreviousMonthNumber = () => {
        const currentCheck = new Date().getMonth(); // 0-11
        return currentCheck === 0 ? 12 : currentCheck;
    };

    const runAutoCleanup = async () => {
        setIsSending(true);
        try {
            toast({
                title: 'Traitement en cours',
                description: 'Le système recherche les retards de paiement...',
            });

            // Trigger actual cron script logic via API
            await api.get('/notifications.php?mode=process_cron');

            await fetchAll();
            setIsSending(false);
            toast({
                title: 'Terminé',
                description: 'Rappels automatiques (et combinés) envoyés avec succès.',
            });
        } catch (error) {
            setIsSending(false);
            console.error('Error running auto cleanup:', error);
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de l\'envoi des rappels.',
                variant: 'destructive',
            });
        }
    };

    const clearHistory = async () => {
        try {
            await api.delete('/notifications.php?mode=all');
            toast({
                title: 'Historique effacé',
                description: 'Tout l\'historique des rappels a été supprimé.',
            });
            fetchAll();
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer l\'historique.',
                variant: 'destructive'
            });
        }
    };

    const sendManualReminder = async (memberId: string, type: 'registration' | 'monthly' | 'combined', monthNumber?: number) => {
        try {
            // If monthly/combined, we usually default to previous month #, 
            // BUT backend now smart-detects based on unpaid list.
            // Sending ANY valid month number triggers the check.
            const monthToSend = monthNumber || getPreviousMonthNumber();

            await api.post('/notifications.php', {
                member_id: memberId,
                type: type,
                month_number: (type === 'monthly' || type === 'combined') ? monthToSend : null
            });
            toast({
                title: 'Envoyé',
                description: 'Rappel manuel envoyé avec succès.',
            });
            fetchAll();
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible d\'envoyer le rappel.',
                variant: 'destructive'
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Envoyé</Badge>;
            case 'failed':
                return <Badge variant="destructive">Échec</Badge>;
            default:
                return <Badge variant="outline">En attente</Badge>;
        }
    };

    const getMonthName = (num: number | null) => {
        if (!num) return '-';
        return format(new Date(2024, num - 1), 'MMMM', { locale: fr });
    };

    // Helper to format short month name
    const getShortMonthName = (num: number) => {
        return format(new Date(2024, num - 1), 'MMM', { locale: fr }).toUpperCase();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Rappels de Paiement</h1>
                        <p className="text-muted-foreground">Suivi des retards et notifications (1er et 5 du mois)</p>
                    </div>
                    <Button
                        onClick={runAutoCleanup}
                        disabled={isSending}
                        className="bg-navy hover:bg-navy-light text-white gap-2 shadow-lg hover:translate-y-[-1px] transition-all"
                    >
                        <Send className="h-4 w-4" />
                        {isSending ? 'Envoi en cours...' : 'Lancer les rappels combinés'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Planning System
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-blue-900 leading-snug">
                                Les rappels partent automatiquement les 1er et 5 de chaque mois à 08h00.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-red-800 uppercase tracking-wider flex items-center gap-2">
                                <UserX className="h-3 w-3" />
                                État Actuel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-red-900 leading-snug">
                                    {delinquents.length} membres en retard.
                                </p>
                                <p className="text-xs text-red-700">
                                    Concerne les inscriptions et tous les mois impayés passés.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-green-800 uppercase tracking-wider flex items-center gap-2">
                                <UserCheck className="h-3 w-3" />
                                Protection
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-green-900 leading-snug">
                                Limite d'un rappel par quinzaine par membre pour éviter le spam.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="delinquents" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="delinquents" className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            En retard
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historique
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="delinquents" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Liste des personnes en retard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground animate-pulse">Recherche des retards...</div>
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
                                                <TableRow key={member.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-mono text-xs">{member.member_number}</TableCell>
                                                    <TableCell className="font-semibold">
                                                        {member.first_name} {member.last_name}
                                                        <p className="text-xs text-muted-foreground font-normal">{member.phone}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.owes_registration === 1 && (
                                                                <Badge variant="destructive" className="text-[10px] font-bold">INSCRIPTION</Badge>
                                                            )}
                                                            {member.unpaid_months && member.unpaid_months.length > 0 ? (
                                                                member.unpaid_months.map(m => (
                                                                    <Badge key={m} className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] font-bold uppercase">
                                                                        {getShortMonthName(m)}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                // Fallback if backend doesn't send array yet
                                                                member.owes_monthly === 1 && (
                                                                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] font-bold uppercase">
                                                                        Mensualité {format(getPreviousMonthDate(), 'MMM', { locale: fr })}
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                const regFee = 2000;
                                                                const monthlyFee = 1000;
                                                                const unpaidCount = member.unpaid_months?.length || (member.owes_monthly ? 1 : 0);
                                                                const monthlyTotal = unpaidCount * monthlyFee;
                                                                const grandTotal = (member.owes_registration ? regFee : 0) + monthlyTotal;

                                                                if (member.owes_registration === 1 && member.owes_monthly === 1) {
                                                                    return (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => sendManualReminder(member.id, 'combined')}
                                                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                                                            title={`Envoyer un rappel unique pour l'inscription et ${unpaidCount} mois impayés`}
                                                                        >
                                                                            <Send className="h-3 w-3 mr-1" />
                                                                            Combiné ({grandTotal}F)
                                                                        </Button>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <>
                                                                            {member.owes_registration === 1 && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => sendManualReminder(member.id, 'registration')}
                                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                                >
                                                                                    <Send className="h-3 w-3 mr-1" />
                                                                                    Inscrip. (2000F)
                                                                                </Button>
                                                                            )}
                                                                            {member.owes_monthly === 1 && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => sendManualReminder(member.id, 'monthly')}
                                                                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                                                >
                                                                                    <Send className="h-3 w-3 mr-1" />
                                                                                    Mens. ({monthlyTotal}F)
                                                                                </Button>
                                                                            )}
                                                                        </>
                                                                    );
                                                                }
                                                            })()}
                                                        </div>
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
                                                <AlertDialogDescription>
                                                    Cette action supprimera tout l'historique des rappels envoyés.
                                                    Cette action est irréversible.
                                                </AlertDialogDescription>
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
                                    <div className="text-center py-12 text-muted-foreground">Chargement de l'historique...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic">
                                        Aucun rappel envoyé pour le moment.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date d'envoi</TableHead>
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
                                                        {item.first_name} {item.last_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {item.type === 'registration' ? "Inscription" : "Mensualité"}
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
