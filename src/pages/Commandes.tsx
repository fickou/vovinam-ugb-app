// src/pages/Commandes.tsx
// Page admin — Gestion des campagnes de commande et des commandes
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ShoppingBag, LayoutGrid, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrderCampaigns } from '@/hooks/useOrderCampaigns';
import { useOrders } from '@/hooks/useOrders';
import { CampaignCard } from '@/components/commandes/CampaignCard';
import { CampaignFormDialog } from '@/components/commandes/CampaignFormDialog';
import { OrdersTable } from '@/components/commandes/OrdersTable';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import type { CampaignFormData, OrderCampaign } from '@/types/commandes';
import { DEFAULT_CAMPAIGN_FORM } from '@/types/commandes';

export default function Commandes() {
  const { user } = useAuth();

  // ── Campagnes ─────────────────────────────────────────────────────────────
  const {
    campaigns, loading: loadCampaigns, isMutating: mutCamp,
    create, update, toggleActive, remove: removeCampaign,
  } = useOrderCampaigns();

  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [isDeleteCampOpen, setIsDeleteCampOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<OrderCampaign | null>(null);
  const [formData, setFormData]           = useState<CampaignFormData>(DEFAULT_CAMPAIGN_FORM);

  const openCreate = () => {
    setSelectedCampaign(null);
    setFormData(DEFAULT_CAMPAIGN_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (c: OrderCampaign) => {
    setSelectedCampaign(c);
    setFormData({
      name:             c.name,
      product_type:     c.product_type,
      description:      c.description ?? '',
      price:            String(c.price),
      margin:           String(c.margin ?? ''),
      available_sizes:  c.available_sizes.join(', '),
      deadline:         c.deadline ?? '',
      is_active:        c.is_active,
      image_url:        c.image_url ?? null,
    });
    setIsFormOpen(true);
  };

  const handleSubmitCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedCampaign) {
      update(selectedCampaign.id, formData, user.id);
    } else {
      create(formData, user.id);
    }
    setIsFormOpen(false);
  };

  const openDeleteCampaign = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (c) { setSelectedCampaign(c); setIsDeleteCampOpen(true); }
  };

  const handleDeleteCampaign = () => {
    if (selectedCampaign) removeCampaign(selectedCampaign.id);
    setIsDeleteCampOpen(false);
    setSelectedCampaign(null);
  };

  // ── Commandes ─────────────────────────────────────────────────────────────
  const {
    orders, loading: loadOrders, isMutating: mutOrders,
    validatePayment, cancelPayment, remove: removeOrder,
  } = useOrders();

  const [isDeleteOrderOpen, setIsDeleteOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId]     = useState<string | null>(null);

  const openDeleteOrder = (id: string) => {
    setSelectedOrderId(id);
    setIsDeleteOrderOpen(true);
  };

  const handleDeleteOrder = () => {
    if (selectedOrderId) removeOrder(selectedOrderId);
    setIsDeleteOrderOpen(false);
    setSelectedOrderId(null);
  };

  // ── Stats rapides ──────────────────────────────────────────────────────────
  const activeCampaigns = campaigns.filter((c) => c.is_active).length;
  const totalOrders     = orders.length;
  const paidOrders      = orders.filter((o) => o.is_paid).length;

  // Calcul du gain total : pour chaque commande payée, on cherche la marge de sa campagne
  const totalGain = orders
    .filter((o) => o.is_paid)
    .reduce((sum, o) => {
      const campaign = campaigns.find((c) => c.id === o.campaign_id);
      const margin = campaign?.margin ?? 0;
      return sum + margin * o.quantity;
    }, 0);

  const formatFCFA = (n: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Commandes"
          subtitle="Gérez les commandes de tenues du club (Lacoste, Blouson, etc.)"
          actions={
            <Button
              onClick={openCreate}
              className="w-full sm:w-auto bg-navy hover:bg-navy-light h-11 rounded-xl gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle campagne
            </Button>
          }
        />

        {/* ── Stats rapides ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Campagnes actives', value: activeCampaigns, color: 'text-emerald-600', sub: null },
            { label: 'Commandes reçues', value: totalOrders, color: 'text-navy', sub: null },
            { label: 'Paiements validés', value: paidOrders, color: 'text-amber-600', sub: null },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
          {/* Gain total */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-sm p-4 text-center text-white">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="h-4 w-4 opacity-80" />
              <p className="text-xs font-medium opacity-80">Gain total club</p>
            </div>
            <p className="text-2xl font-bold">{formatFCFA(totalGain)}</p>
            <p className="text-xs opacity-70 mt-0.5">sur commandes payées</p>
          </div>
        </div>

        {/* ── Onglets ── */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-80">
            <TabsTrigger value="campaigns" className="gap-2">
              <LayoutGrid className="h-4 w-4" /> Campagnes
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" /> Commandes
            </TabsTrigger>
          </TabsList>

          {/* ── Tab Campagnes ── */}
          <TabsContent value="campaigns">
            {loadCampaigns ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-navy/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-navy" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Aucune campagne</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Créez une campagne pour permettre aux pratiquants de passer leurs commandes.
                </p>
                <Button onClick={openCreate} className="bg-navy hover:bg-navy-light gap-2">
                  <Plus className="h-4 w-4" /> Créer une campagne
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onEdit={openEdit}
                    onToggleActive={toggleActive}
                    onDelete={openDeleteCampaign}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab Commandes ── */}
          <TabsContent value="orders">
            <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
              <OrdersTable
                orders={orders}
                campaigns={campaigns}
                loading={loadOrders}
                isMutating={mutOrders}
                onValidate={validatePayment}
                onCancelPayment={cancelPayment}
                onDelete={openDeleteOrder}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialogs ── */}
      <CampaignFormDialog
        open={isFormOpen}
        onOpenChange={(v) => { setIsFormOpen(v); if (!v) setSelectedCampaign(null); }}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmitCampaign}
        isEditing={!!selectedCampaign}
        isMutating={mutCamp}
      />

      <DeleteDialog
        open={isDeleteCampOpen}
        onOpenChange={setIsDeleteCampOpen}
        onConfirm={handleDeleteCampaign}
        description={`Supprimer la campagne "${selectedCampaign?.name}" ? Toutes les commandes associées seront aussi supprimées.`}
      />

      <DeleteDialog
        open={isDeleteOrderOpen}
        onOpenChange={setIsDeleteOrderOpen}
        onConfirm={handleDeleteOrder}
        description="Supprimer cette commande définitivement ?"
      />
    </DashboardLayout>
  );
}
