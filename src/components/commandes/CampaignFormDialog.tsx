// src/components/commandes/CampaignFormDialog.tsx
import { useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, ImagePlus, X, Upload } from 'lucide-react';
import { uploadCampaignImage } from '@/hooks/useOrderCampaigns';
import { useToast } from '@/hooks/use-toast';
import type { CampaignFormData } from '@/types/commandes';
import { PRODUCT_TYPES } from '@/types/commandes';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: CampaignFormData;
  onChange: (data: CampaignFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  isMutating: boolean;
}

export function CampaignFormDialog({
  open, onOpenChange, formData, onChange, onSubmit, isEditing, isMutating,
}: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.image_url);

  // Sync preview when dialog opens with existing data
  const handleOpen = (v: boolean) => {
    if (v) setPreviewUrl(formData.image_url);
    onOpenChange(v);
  };

  const set = (field: keyof CampaignFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...formData, [field]: e.target.value });

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation locale
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Fichier trop volumineux', description: 'Maximum 3 Mo.', variant: 'destructive' });
      return;
    }

    // Aperçu immédiat
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload Supabase
    setUploadingImage(true);
    try {
      const publicUrl = await uploadCampaignImage(file);
      onChange({ ...formData, image_url: publicUrl });
      setPreviewUrl(publicUrl);
      toast({ title: '✓ Image téléversée' });
    } catch (err: any) {
      toast({ title: 'Erreur upload', description: err.message, variant: 'destructive' });
      setPreviewUrl(formData.image_url);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onChange({ ...formData, image_url: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Modifier la campagne' : 'Nouvelle campagne de commande'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {/* ── Image échantillon ── */}
          <div className="space-y-2">
            <Label>Photo de l'échantillon</Label>
            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border bg-muted h-40 group">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {!uploadingImage && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-end p-2 gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" /> Changer
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={removeImage}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-navy/50 hover:bg-navy/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-navy"
              >
                {uploadingImage
                  ? <Loader2 className="h-6 w-6 animate-spin" />
                  : <ImagePlus className="h-8 w-8" />
                }
                <span className="text-sm font-medium">
                  {uploadingImage ? 'Téléversement…' : 'Ajouter une photo du produit'}
                </span>
                <span className="text-xs">JPG, PNG, WebP — max 3 Mo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Nom */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-name">Nom de la campagne *</Label>
            <Input
              id="camp-name"
              value={formData.name}
              onChange={set('name')}
              placeholder="ex: Lacoste Saison 2025-2026"
              required
            />
          </div>

          {/* Type de produit */}
          <div className="space-y-1.5">
            <Label>Type de produit *</Label>
            <Select
              value={formData.product_type}
              onValueChange={(v) => onChange({ ...formData, product_type: v })}
            >
              <SelectTrigger id="camp-type">
                <SelectValue placeholder="Choisir le type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-price">Prix unitaire (FCFA) *</Label>
            <Input
              id="camp-price"
              type="number"
              min="0"
              step="100"
              value={formData.price}
              onChange={set('price')}
              placeholder="ex: 15000"
              required
            />
          </div>

          {/* Tailles disponibles */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-sizes">
              Tailles disponibles *
              <span className="text-muted-foreground text-xs ml-1">(séparées par des virgules)</span>
            </Label>
            <Input
              id="camp-sizes"
              value={formData.available_sizes}
              onChange={set('available_sizes')}
              placeholder="XS, S, M, L, XL, XXL"
              required
            />
          </div>

          {/* Date limite */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-deadline">Date limite de commande</Label>
            <Input
              id="camp-deadline"
              type="date"
              value={formData.deadline}
              onChange={set('deadline')}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-desc">Instructions / Description</Label>
            <Textarea
              id="camp-desc"
              value={formData.description}
              onChange={set('description')}
              placeholder="Informations supplémentaires pour les pratiquants…"
              rows={3}
            />
          </div>

          {/* Actif */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div>
              <p className="font-medium text-sm">Formulaire actif</p>
              <p className="text-xs text-muted-foreground">Le lien public sera accessible</p>
            </div>
            <Switch
              id="camp-active"
              checked={formData.is_active}
              onCheckedChange={(v) => onChange({ ...formData, is_active: v })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isMutating || uploadingImage}
              className="bg-navy hover:bg-navy-light"
            >
              {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer la campagne'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
