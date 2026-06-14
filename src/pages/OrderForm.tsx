// src/pages/OrderForm.tsx
// Formulaire public de commande — accessible via un lien partageable sans connexion
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicCampaign } from '@/hooks/useOrderCampaigns';
import { useSubmitOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, Loader2, ShoppingBag, CalendarDays, Tag,
  Ruler, AlertCircle, Phone, User, ChevronDown,
} from 'lucide-react';
import type { OrderFormData } from '@/types/commandes';
import { DEFAULT_ORDER_FORM } from '@/types/commandes';
import vovinamLogo from '@/assets/logo.png';

export default function OrderForm() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { data: campaign, isLoading } = usePublicCampaign(campaignId ?? '');
  const { submit, isPending } = useSubmitOrder();

  const [form, setForm]       = useState<OrderFormData>(DEFAULT_ORDER_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const set = (field: keyof OrderFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(p) + ' FCFA';

  const formatDeadline = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const isExpired = campaign?.deadline
    ? new Date(campaign.deadline) < new Date()
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!campaignId) return;
    try {
      await submit(campaignId, form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? 'Une erreur est survenue. Réessayez.');
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  // ── Campagne non trouvée ou inactive ───────────────────────────────────────
  if (!campaign || !campaign.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center text-white max-w-sm">
          <AlertCircle className="h-14 w-14 mx-auto mb-4 text-amber-400" />
          <h1 className="text-xl font-bold mb-2">Formulaire indisponible</h1>
          <p className="text-white/70 text-sm">
            Ce formulaire de commande est actuellement fermé ou n'existe pas.
            Contactez votre responsable de club.
          </p>
        </div>
      </div>
    );
  }

  // ── Succès ─────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande enregistrée !</h1>
          <p className="text-gray-500 text-sm mb-6">
            Votre commande de <strong>{campaign.product_type}</strong> (taille{' '}
            <strong>{form.size}</strong>, ×{form.quantity}) a bien été reçue.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800">
            <p className="font-semibold mb-1">💰 Paiement</p>
            <p>
              Le montant total est de{' '}
              <strong>{formatPrice(campaign.price * form.quantity)}</strong>.
              Le responsable du club vous contactera pour confirmer votre paiement.
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Vovinam Việt Võ Đạo — UGB Saint-Louis
          </p>
        </div>
      </div>
    );
  }

  // ── Expiré ─────────────────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center text-white max-w-sm">
          <CalendarDays className="h-14 w-14 mx-auto mb-4 text-amber-400" />
          <h1 className="text-xl font-bold mb-2">Commandes clôturées</h1>
          <p className="text-white/70 text-sm">
            La période de commande pour <strong>{campaign.name}</strong> s'est terminée
            le {formatDeadline(campaign.deadline)}.
          </p>
        </div>
      </div>
    );
  }

  // ── Formulaire ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy to-slate-800 py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="text-center text-white space-y-2">
          <img src={vovinamLogo} alt="Vovinam UGB" className="h-14 w-14 object-contain mx-auto" />
          <p className="text-sm text-white/60 font-medium tracking-wider uppercase">
            Vovinam Việt Võ Đạo — UGB
          </p>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
        </div>

        {/* Image échantillon */}
        {campaign.image_url && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <img
              src={campaign.image_url}
              alt={`Échantillon — ${campaign.name}`}
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}

        {/* Info campagne */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white space-y-2">
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-white/60" />
              {campaign.product_type}
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Tag className="h-4 w-4 text-amber-400" />
              {formatPrice(campaign.price)} / article
            </span>
            <span className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-white/60" />
              {campaign.available_sizes.join(' · ')}
            </span>
            {campaign.deadline && (
              <span className="flex items-center gap-1.5 text-amber-300">
                <CalendarDays className="h-4 w-4" />
                Jusqu'au {formatDeadline(campaign.deadline)}
              </span>
            )}
          </div>
          {campaign.description && (
            <p className="text-white/70 text-sm pt-1 border-t border-white/10">
              {campaign.description}
            </p>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-navy" />
            Votre commande
          </h2>

          {/* Nom & Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="of-lastname" className="text-sm font-medium">Nom *</Label>
              <Input
                id="of-lastname"
                value={form.last_name}
                onChange={set('last_name')}
                placeholder="DIALLO"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="of-firstname" className="text-sm font-medium">Prénom *</Label>
              <Input
                id="of-firstname"
                value={form.first_name}
                onChange={set('first_name')}
                placeholder="Mamadou"
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <Label htmlFor="of-phone" className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Téléphone *
            </Label>
            <Input
              id="of-phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="77 123 45 67"
              required
              className="h-11 rounded-xl"
            />
          </div>

          {/* Taille */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" /> Taille *
            </Label>
            <Select
              value={form.size}
              onValueChange={(v) => setForm((f) => ({ ...f, size: v }))}
              required
            >
              <SelectTrigger id="of-size" className="h-11 rounded-xl">
                <SelectValue placeholder="Choisissez une taille" />
              </SelectTrigger>
              <SelectContent>
                {campaign.available_sizes.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantité */}
          <div className="space-y-1.5">
            <Label htmlFor="of-qty" className="text-sm font-medium">Quantité *</Label>
            <Input
              id="of-qty"
              type="number"
              min="1"
              max="10"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
              required
              className="h-11 rounded-xl"
            />
          </div>

          {/* Montant total dynamique */}
          {form.quantity > 0 && form.size && (
            <div className="bg-navy/5 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Montant total estimé</span>
              <span className="font-bold text-navy text-lg">
                {formatPrice(campaign.price * form.quantity)}
              </span>
            </div>
          )}

          {/* Remarques */}
          <div className="space-y-1.5">
            <Label htmlFor="of-notes" className="text-sm font-medium">
              Remarques <span className="text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <Textarea
              id="of-notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Précisions supplémentaires…"
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending || !form.size}
            className="w-full h-12 rounded-xl bg-navy hover:bg-navy-light text-base font-semibold gap-2"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</>
              : <><ShoppingBag className="h-4 w-4" /> Passer la commande</>
            }
          </Button>

          <p className="text-center text-xs text-gray-400">
            Votre commande sera confirmée après paiement au responsable du club.
          </p>
        </form>
      </div>
    </div>
  );
}
