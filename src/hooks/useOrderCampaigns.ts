// src/hooks/useOrderCampaigns.ts
// CRUD des campagnes de commande (admin)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { OrderCampaign, CampaignFormData } from '@/types/commandes';

const QK = 'order_campaigns';

async function fetchCampaigns(): Promise<OrderCampaign[]> {
  const { data, error } = await (supabase as any)
    .from('order_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchCampaignById(id: string): Promise<OrderCampaign | null> {
  const { data, error } = await (supabase as any)
    .from('order_campaigns')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ── Upload image échantillon vers Supabase Storage ───────────────────────────
export async function uploadCampaignImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `campaign-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('campaign-images')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from('campaign-images').getPublicUrl(path);
  return data.publicUrl;
}

function parseCampaignForm(form: CampaignFormData, userId: string) {
  return {
    name: form.name.trim(),
    product_type: form.product_type.trim(),
    description: form.description.trim() || null,
    price: parseFloat(form.price) || 0,
    margin: parseFloat(form.margin) || 0,
    available_sizes: form.available_sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    deadline: form.deadline || null,
    is_active: form.is_active,
    image_url: form.image_url || null,
    created_by: userId,
  };
}

// ── Hook admin (liste complète) ───────────────────────────────────────────────
export function useOrderCampaigns() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: campaigns = [], isLoading: loading } = useQuery<OrderCampaign[]>({
    queryKey: [QK],
    queryFn: fetchCampaigns,
  });

  const createMutation = useMutation({
    mutationFn: async ({ form, userId }: { form: CampaignFormData; userId: string }) => {
      const payload = parseCampaignForm(form, userId);
      const { error } = await (supabase as any).from('order_campaigns').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Campagne créée avec succès' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, form, userId }: { id: string; form: CampaignFormData; userId: string }) => {
      const payload = parseCampaignForm(form, userId);
      const { error } = await (supabase as any)
        .from('order_campaigns')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Campagne mise à jour' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from('order_campaigns')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Statut mis à jour' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('order_campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast({ title: 'Campagne supprimée' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  return {
    campaigns,
    loading,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      toggleActiveMutation.isPending ||
      deleteMutation.isPending,
    create: (form: CampaignFormData, userId: string) =>
      createMutation.mutate({ form, userId }),
    update: (id: string, form: CampaignFormData, userId: string) =>
      updateMutation.mutate({ id, form, userId }),
    toggleActive: (id: string, is_active: boolean) =>
      toggleActiveMutation.mutate({ id, is_active }),
    remove: (id: string) => deleteMutation.mutate(id),
  };
}

// ── Hook public (une campagne par ID, sans auth) ──────────────────────────────
export function usePublicCampaign(id: string) {
  return useQuery<OrderCampaign | null>({
    queryKey: [QK, 'public', id],
    queryFn: () => fetchCampaignById(id),
    enabled: !!id,
  });
}
