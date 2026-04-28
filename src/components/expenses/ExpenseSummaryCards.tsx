/**
 * @file src/components/expenses/ExpenseSummaryCards.tsx
 * Cards de synthèse : total dépenses + total recettes diverses.
 */
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import { formatAmount } from '@/lib/utils';

interface ExpenseSummaryCardsProps {
  totalExpenses: number;
  totalIncomes: number;
  loading: boolean;
}

export function ExpenseSummaryCards({ totalExpenses, totalIncomes, loading }: ExpenseSummaryCardsProps) {
  const cards = [
    { label: 'Total Dépenses',                value: totalExpenses, color: 'text-red-600',   borderColor: 'border-red-100',   iconColor: 'text-red-500' },
    { label: 'Total Recettes Div. / Reports', value: totalIncomes,  color: 'text-green-600', borderColor: 'border-green-100', iconColor: 'text-green-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map(({ label, value, color, borderColor, iconColor }) => (
        <Card key={label} className={`bg-white ${borderColor} shadow-sm overflow-hidden`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
              <Wallet className={`h-5 w-5 ${iconColor}`} />
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex flex-col">
                <div className={`text-2xl sm:text-3xl font-bold ${color} truncate`}>
                  {formatAmount(value)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sur la base des filtres actuels</p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
