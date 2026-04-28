/**
 * @file src/components/card-generator/CardTabsNav.tsx
 * Navigation par onglets du générateur de cartes.
 */
import { CreditCard, Bell, Users, ScrollText, BookOpen, CalendarDays } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CardType } from '@/types';

const TABS: { value: CardType; label: string; icon: React.ReactNode }[] = [
  { value: 'access',    label: 'Adhérent',    icon: <CreditCard className="h-4 w-4 hidden sm:block" /> },
  { value: 'reminder',  label: 'Rappel',      icon: <Bell       className="h-4 w-4 hidden sm:block" /> },
  { value: 'renewal',   label: 'Élections',   icon: <Users      className="h-4 w-4 hidden sm:block" /> },
  { value: 'reglement', label: 'Règlement',   icon: <ScrollText className="h-4 w-4 hidden sm:block" /> },
  { value: 'principes', label: '10 Principes',icon: <BookOpen   className="h-4 w-4 hidden sm:block" /> },
  { value: 'programme', label: 'Programme',   icon: <CalendarDays className="h-4 w-4 hidden sm:block" /> },
];

export function CardTabsNav() {
  return (
    <TabsList className="grid w-full grid-cols-6 mb-8">
      {TABS.map(({ value, label, icon }) => (
        <TabsTrigger key={value} value={value} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          {icon} {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
