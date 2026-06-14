// src/components/commandes/CampaignCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy, ExternalLink, Pencil, Power, Trash2, MoreVertical,
  ShoppingBag, CalendarDays, Tag, Ruler, CheckCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OrderCampaign } from '@/types/commandes';

// URL de production de l'app déployée
const APP_BASE_URL = 'https://vovinam-ugb-sc.netlify.app';

interface Props {
  campaign: OrderCampaign;
  onEdit: (c: OrderCampaign) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

export function CampaignCard({ campaign, onEdit, onToggleActive, onDelete }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Lien public avec l'URL de production Netlify
  const publicUrl = `${APP_BASE_URL}/commande/${campaign.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast({
      title: '✓ Lien copié !',
      description: 'Collez-le dans WhatsApp, Telegram ou SMS.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const openLink = () => window.open(publicUrl, '_blank', 'noopener,noreferrer');

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('fr-SN', { style: 'decimal', maximumFractionDigits: 0 }).format(p) + ' FCFA';

  const formatDeadline = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const isExpired = campaign.deadline
    ? new Date(campaign.deadline) < new Date()
    : false;

  const isAccessible = campaign.is_active && !isExpired;

  return (
    <Card className={`relative overflow-hidden border-none shadow-md transition-all hover:shadow-lg ${
      !isAccessible ? 'opacity-60' : ''
    }`}>
      {/* Color stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isAccessible
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
          : 'bg-gradient-to-r from-slate-400 to-slate-300'
      }`} />

      {/* Image échantillon */}
      {campaign.image_url && (
        <div className="w-full h-36 overflow-hidden">
          <img
            src={campaign.image_url}
            alt={`Échantillon — ${campaign.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base truncate">{campaign.name}</h3>
              <Badge
                variant={isAccessible ? 'default' : 'secondary'}
                className={isAccessible
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500'}
              >
                {!campaign.is_active ? 'Inactif' : isExpired ? 'Expiré' : 'Actif'}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(campaign)}>
                <Pencil className="h-4 w-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(campaign.id, !campaign.is_active)}>
                <Power className="h-4 w-4 mr-2" />
                {campaign.is_active ? 'Désactiver' : 'Activer'}
              </DropdownMenuItem>
              {isAccessible && (
                <DropdownMenuItem onClick={openLink}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Ouvrir le formulaire
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(campaign.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Infos */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShoppingBag className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{campaign.product_type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tag className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
            <span className="font-semibold text-foreground">{formatPrice(campaign.price)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
            <Ruler className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{campaign.available_sizes.join(' · ')}</span>
          </div>
          {campaign.deadline && (
            <div className={`flex items-center gap-1.5 col-span-2 ${
              isExpired ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Jusqu'au {formatDeadline(campaign.deadline)}</span>
            </div>
          )}
        </div>

        {campaign.description && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* Lien public — cliquable + copiable */}
        {isAccessible && (
          <div className="space-y-2">
            {/* URL affichée comme lien cliquable */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-navy hover:text-navy-light underline underline-offset-2 break-all leading-snug"
              title="Ouvrir le formulaire"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              {publicUrl}
            </a>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                onClick={copyLink}
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 h-9 border-dashed hover:border-navy hover:text-navy"
              >
                {copied
                  ? <><CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> Copié !</>
                  : <><Copy className="h-3.5 w-3.5" /> Copier le lien</>
                }
              </Button>
              <Button
                onClick={openLink}
                variant="outline"
                size="sm"
                className="h-9 px-3 hover:border-navy hover:text-navy"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {!isAccessible && (
          <div className="text-center text-xs text-muted-foreground py-1">
            {!campaign.is_active ? 'Activez la campagne pour partager le lien' : 'Campagne expirée'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
