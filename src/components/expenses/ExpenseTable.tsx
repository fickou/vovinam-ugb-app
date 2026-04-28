/**
 * @file src/components/expenses/ExpenseTable.tsx
 * Table desktop + cards mobile pour la liste des opérations de trésorerie.
 */
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Wallet } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatExpenseAmount } from '@/lib/utils';
import type { Expense } from '@/types';

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  isMobileView: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseTable({ expenses, loading, isMobileView, onEdit, onDelete }: ExpenseTableProps) {
  if (loading) return <LoadingSpinner message="Chargement des opérations…" />;
  if (expenses.length === 0) return <EmptyState icon={Wallet} message="Aucune opération trouvée" />;

  if (isMobileView) {
    return (
      <div className="space-y-3 px-3 py-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3 pb-3 border-b">
              <div className="flex-1 pr-2">
                <p className="font-semibold text-navy text-sm line-clamp-2">{expense.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(expense.expense_date)}</p>
              </div>
              <p className={`font-bold text-sm ${expense.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatExpenseAmount(expense.amount)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <span className="text-muted-foreground">Catégorie :</span>
                <p className="font-medium text-gray-900">{expense.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Saison :</span>
                <p className="font-medium text-gray-900">{expense.seasons?.name ?? '-'}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => onEdit(expense)} className="flex-1 h-8 text-xs">
                <Pencil className="h-3 w-3 mr-1" /> Modifier
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(expense)} className="text-destructive h-8 px-3 text-xs hover:bg-destructive/10">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {['Date', 'Description', 'Catégorie', 'Saison', 'Montant', 'Actions'].map((h, i) => (
              <TableHead key={h} className={`whitespace-nowrap font-bold ${i === 4 || i === 5 ? 'text-right' : ''}`}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="whitespace-nowrap text-muted-foreground font-mono text-xs">
                {formatDate(expense.expense_date)}
              </TableCell>
              <TableCell className="font-medium min-w-[200px]">{expense.description}</TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  {expense.category}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">{expense.seasons?.name ?? '-'}</TableCell>
              <TableCell className={`text-right font-bold whitespace-nowrap ${expense.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatExpenseAmount(expense.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 md:gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="h-8 w-8 hover:bg-navy/10 hover:text-navy transition-colors">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(expense)} className="text-destructive h-8 w-8 hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
