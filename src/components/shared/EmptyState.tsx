/**
 * @file src/components/shared/EmptyState.tsx
 * Affichage standardisé lorsqu'une liste est vide.
 */
import type { LucideIcon } from 'lucide-react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  description?: string;
}

export function EmptyState({
  icon: Icon = FileX,
  message = 'Aucune donnée trouvée',
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
      <Icon className="h-12 w-12 opacity-30" />
      <p className="font-medium">{message}</p>
      {description && <p className="text-xs max-w-xs">{description}</p>}
    </div>
  );
}
