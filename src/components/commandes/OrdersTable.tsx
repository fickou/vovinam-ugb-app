// src/components/commandes/OrdersTable.tsx
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Download, Search, Trash2, Loader2 } from 'lucide-react';
import type { Order, OrderCampaign } from '@/types/commandes';
import { exportOrdersCSV } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  orders: Order[];
  campaigns: OrderCampaign[];
  loading: boolean;
  isMutating: boolean;
  onValidate: (id: string, userId: string) => void;
  onCancelPayment: (id: string) => void;
  onDelete: (id: string) => void;
}

export function OrdersTable({
  orders, campaigns, loading, isMutating,
  onValidate, onCancelPayment, onDelete,
}: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterPaid, setFilterPaid] = useState('all');
  const [pendingId, setPendingId] = useState<string | null>(null);

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        o.first_name.toLowerCase().includes(term) ||
        o.last_name.toLowerCase().includes(term) ||
        o.phone.includes(term) ||
        o.size.toLowerCase().includes(term);
      const matchCampaign = filterCampaign === 'all' || o.campaign_id === filterCampaign;
      const matchPaid =
        filterPaid === 'all' ||
        (filterPaid === 'paid' && o.is_paid) ||
        (filterPaid === 'unpaid' && !o.is_paid);
      return matchSearch && matchCampaign && matchPaid;
    });
  }, [orders, search, filterCampaign, filterPaid]);

  const paidOrders = filtered.filter((o) => o.is_paid);
  const totalQty = filtered.reduce((s, o) => s + o.quantity, 0);
  const paidQty = paidOrders.reduce((s, o) => s + o.quantity, 0);

  const handleValidate = (id: string) => {
    if (!user) return;
    setPendingId(id);
    onValidate(id, user.id);
    setTimeout(() => setPendingId(null), 1000);
  };

  const getCampaignName = (campaignId: string) =>
    campaigns.find((c) => c.id === campaignId)?.name ?? '—';

  const handleExport = () => {
    const campaignName =
      filterCampaign !== 'all'
        ? campaigns.find((c) => c.id === filterCampaign)?.name ?? 'toutes'
        : 'toutes_campagnes';
    exportOrdersCSV(filterPaid === 'paid' ? paidOrders : filtered, campaignName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher (nom, téléphone, taille)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterCampaign} onValueChange={setFilterCampaign}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Toutes les campagnes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les campagnes</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPaid} onValueChange={setFilterPaid}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="paid">Payées</SelectItem>
            <SelectItem value="unpaid">Non payées</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="default"
          onClick={handleExport}
          className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          disabled={filtered.length === 0}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exporter CSV</span>
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="bg-muted rounded-full px-3 py-1">
          <strong className="text-foreground">{filtered.length}</strong> commandes
        </span>
        <span className="bg-muted rounded-full px-3 py-1">
          <strong className="text-foreground">{totalQty}</strong> articles
        </span>
        <span className="bg-emerald-50 text-emerald-700 rounded-full px-3 py-1">
          <strong>{paidQty}</strong> payés
        </span>
        <span className="bg-amber-50 text-amber-700 rounded-full px-3 py-1">
          <strong>{totalQty - paidQty}</strong> en attente
        </span>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBagEmpty />
          <p className="mt-3 font-medium">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Pratiquant</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Campagne</TableHead>
                <TableHead className="text-center">Taille</TableHead>
                <TableHead className="text-center">Qté</TableHead>
                <TableHead>Remarques</TableHead>
                <TableHead className="text-center">Paiement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} className={order.is_paid ? 'bg-emerald-50/30' : ''}>
                  <TableCell className="font-medium">
                    {order.last_name} {order.first_name}
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                    {getCampaignName(order.campaign_id)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">{order.size}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">{order.quantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-28 truncate">
                    {order.notes ?? '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {order.is_paid ? (
                      <button
                        onClick={() => onCancelPayment(order.id)}
                        title="Annuler le paiement"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-amber-500 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleValidate(order.id)}
                        disabled={pendingId === order.id || isMutating}
                        title="Marquer comme payé"
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-500 transition-colors disabled:opacity-50"
                      >
                        {pendingId === order.id
                          ? <Loader2 className="h-5 w-5 animate-spin" />
                          : <XCircle className="h-5 w-5" />
                        }
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ShoppingBagEmpty() {
  return (
    <svg className="mx-auto h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
