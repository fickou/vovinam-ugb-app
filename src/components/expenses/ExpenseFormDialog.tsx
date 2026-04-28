/**
 * @file src/components/expenses/ExpenseFormDialog.tsx
 * Dialog de création / modification d'une opération de trésorerie.
 * Totalement contrôlé : reçoit l'état et les handlers du parent.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ExpenseFormData, Expense, Season } from '@/types';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ExpenseFormData;
  onFormChange: (data: ExpenseFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedExpense: Expense | null;
  seasons: Season[];
  isMutating: boolean;
}

// ─── Catégories selon le type d'opération ────────────────────────────────────

const INCOME_CATEGORIES = [
  { value: 'Recette Bureau sortant', label: 'Bureau sortant' },
  { value: 'Don / Subvention',       label: 'Don / Subvention extérieure' },
  { value: 'Autre recette',          label: 'Autre recette diverse' },
];

const EXPENSE_CATEGORIES = [
  { value: 'Matériel',     label: 'Matériel' },
  { value: 'Loyer',        label: 'Loyer / Salle' },
  { value: 'Événement',    label: 'Événement' },
  { value: 'Transport',    label: 'Transport' },
  { value: 'Communication',label: 'Communication' },
  { value: 'Divers',       label: 'Divers' },
];

export function ExpenseFormDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  selectedExpense,
  seasons,
  isMutating,
}: ExpenseFormDialogProps) {
  const set = (field: keyof ExpenseFormData, value: string) =>
    onFormChange({ ...formData, [field]: value });

  const categories = formData.operation_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); }}>
      <DialogContent className="max-w-md w-[95vw] rounded-xl overflow-hidden p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {selectedExpense ? "Modifier l'opération" : 'Ajouter une opération'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            {/* Saison */}
            <div className="space-y-2">
              <Label>Saison</Label>
              <Select value={formData.season_id} onValueChange={(v) => set('season_id', v)}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Choisir une saison" /></SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description" required
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Ex: Achat de matériel, Loyer salle…"
                className="rounded-lg"
              />
            </div>

            {/* Montant + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input id="amount" type="number" required value={formData.amount} onChange={(e) => set('amount', e.target.value)} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_date">Date</Label>
                <Input id="expense_date" type="date" required value={formData.expense_date} onChange={(e) => set('expense_date', e.target.value)} className="rounded-lg" />
              </div>
            </div>

            {/* Type d'opération */}
            <div className="space-y-2">
              <Label>Type d'opération</Label>
              <Select
                value={formData.operation_type}
                onValueChange={(v) => onFormChange({
                  ...formData,
                  operation_type: v as 'income' | 'expense',
                  category: v === 'income' ? 'Recette Bureau sortant' : 'Divers',
                })}
              >
                <SelectTrigger className="rounded-lg border-2 border-navy/10 font-medium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense" className="text-red-700 font-medium">Dépense (Sortie d'argent)</SelectItem>
                  <SelectItem value="income"  className="text-green-700 font-medium">Recette (Entrée d'argent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label>Catégorie comptable</Label>
              <Select value={formData.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isMutating} className="w-full bg-navy hover:bg-navy-light text-white py-6 text-lg rounded-xl mt-2">
              {selectedExpense ? 'Modifier' : 'Ajouter'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
