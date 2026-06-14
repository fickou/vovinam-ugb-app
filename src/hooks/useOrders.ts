// src/hooks/useOrders.ts
// Lecture, validation paiement et export CSV des commandes
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderFormData } from '@/types/commandes';

const QK = 'orders';

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchOrders(campaignId?: string): Promise<Order[]> {
  let query = (supabase as any)
    .from('orders')
    .select('*, campaign:order_campaigns(name, product_type, price)')
    .order('created_at', { ascending: false });

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ── Hook admin ────────────────────────────────────────────────────────────────
export function useOrders(campaignId?: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: orders = [], isLoading: loading } = useQuery<Order[]>({
    queryKey: [QK, campaignId ?? 'all'],
    queryFn: () => fetchOrders(campaignId),
  });

  // Valider le paiement d'une commande
  const validateMutation = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await (supabase as any)
        .from('orders')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          validated_by: userId,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Commande marquée comme payée ✓' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  // Annuler la validation
  const invalidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('orders')
        .update({ is_paid: false, paid_at: null, validated_by: null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Paiement annulé' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  // Supprimer une commande
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Commande supprimée' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  return {
    orders,
    loading,
    isMutating:
      validateMutation.isPending ||
      invalidateMutation.isPending ||
      deleteMutation.isPending,
    validatePayment: (id: string, userId: string) =>
      validateMutation.mutate({ id, userId }),
    cancelPayment: (id: string) => invalidateMutation.mutate(id),
    remove: (id: string) => deleteMutation.mutate(id),
  };
}

// ── Hook public (soumission d'une commande sans auth) ─────────────────────────
export function useSubmitOrder() {
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async ({
      campaignId,
      form,
    }: {
      campaignId: string;
      form: OrderFormData;
    }) => {
      const { error } = await (supabase as any).from('orders').insert({
        campaign_id: campaignId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        size: form.size,
        quantity: form.quantity,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  return {
    submit: (campaignId: string, form: OrderFormData) =>
      submitMutation.mutateAsync({ campaignId, form }),
    isPending: submitMutation.isPending,
  };
}

// ── Export CSV ────────────────────────────────────────────────────────────────
export function exportOrdersCSV(orders: Order[], campaignName: string) {
  const headers = [
    'Nom',
    'Prénom',
    'Téléphone',
    'Taille',
    'Quantité',
    'Payé',
    'Date commande',
    'Remarques',
  ];

  const rows = orders.map((o) => [
    o.last_name,
    o.first_name,
    o.phone,
    o.size,
    o.quantity,
    o.is_paid ? 'Oui' : 'Non',
    new Date(o.created_at).toLocaleDateString('fr-FR'),
    o.notes ?? '',
  ]);

  const csvContent =
    '\uFEFF' + // BOM pour Excel
    [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(';'),
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safe = campaignName.replace(/[^a-zA-Z0-9-_]/g, '_');
  link.download = `commandes_${safe}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
