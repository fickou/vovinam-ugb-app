/**
 * @file src/components/shared/SeasonSelector.tsx
 * Select saison réutilisable. Utilisé dans Reports, FinancialBalance, Expenses…
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Season } from '@/types';

interface SeasonSelectorProps {
  seasons: Season[];
  value: string;
  onValueChange: (value: string) => void;
  /** Afficher l'option "Toutes les saisons". Default: true */
  withAll?: boolean;
  allLabel?: string;
  placeholder?: string;
  className?: string;
}

export function SeasonSelector({
  seasons,
  value,
  onValueChange,
  withAll = true,
  allLabel = 'Toutes les saisons',
  placeholder = 'Choisir une saison',
  className = 'w-full sm:w-[180px]',
}: SeasonSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`${className} rounded-lg h-10 border-2 border-navy/10`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {withAll && <SelectItem value="all">{allLabel}</SelectItem>}
        {seasons.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
