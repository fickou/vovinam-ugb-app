/**
 * @file src/components/card-generator/CardTabsNav.tsx
 * Navigation par onglets du générateur de cartes.
 * Responsive : scroll horizontal sur mobile, icônes masquées sur xs.
 */
import { CreditCard, Bell, Users, ScrollText, BookOpen, CalendarDays, Award } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CardType } from '@/types';

const TABS: { value: CardType; label: string; icon: React.ReactNode }[] = [
  { value: 'access',    label: 'Adhérent',   icon: <CreditCard   className="h-4 w-4 shrink-0" /> },
  { value: 'reminder',  label: 'Rappel',     icon: <Bell         className="h-4 w-4 shrink-0" /> },
  { value: 'renewal',   label: 'Élections',  icon: <Users        className="h-4 w-4 shrink-0" /> },
  { value: 'reglement', label: 'Règlement',  icon: <ScrollText   className="h-4 w-4 shrink-0" /> },
  { value: 'principes', label: '10 Principes', icon: <BookOpen   className="h-4 w-4 shrink-0" /> },
  { value: 'programme', label: 'Programme',  icon: <CalendarDays className="h-4 w-4 shrink-0" /> },
  { value: 'passage',   label: 'Passage',    icon: <Award        className="h-4 w-4 shrink-0" /> },
];

export function CardTabsNav() {
  return (
    /* Wrapper scrollable sur mobile */
    <div className="w-full overflow-x-auto pb-1 mb-6">
      <TabsList className="inline-flex min-w-max w-full sm:grid sm:grid-cols-7 h-auto gap-0.5 p-1">
        {TABS.map(({ value, label, icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="hidden sm:inline-flex">{icon}</span>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
