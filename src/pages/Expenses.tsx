/**
 * @file src/pages/Expenses.tsx
 * Orchestrateur de la page Opérations de Trésorerie.
 *
 * Avant refactoring : 415 lignes (state + fetch + form + table + dialogs mélangés).
 * Après  refactoring :  ~80 lignes (orchestration pure).
 */
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus } from 'lucide-react';

import { useExpenses }              from '@/hooks/useExpenses';
import { useSeasons }               from '@/hooks/useSeasons';
import { useTableResponsive }       from '@/hooks/useTableResponsive';
import { todayISO }                 from '@/lib/utils';
import { PageHeader }               from '@/components/shared/PageHeader';
import { SearchInput }              from '@/components/shared/SearchInput';
import { DeleteDialog }             from '@/components/shared/DeleteDialog';
import { ExpenseSummaryCards }      from '@/components/expenses/ExpenseSummaryCards';
import { ExpenseTable }             from '@/components/expenses/ExpenseTable';
import { ExpenseFormDialog }        from '@/components/expenses/ExpenseFormDialog';
import type { Expense, ExpenseFormData } from '@/types';

// ─── État formulaire par défaut ───────────────────────────────────────────────

function buildDefaultForm(activeSeasonId = ''): ExpenseFormData {
  return {
    season_id:      activeSeasonId,
    amount:         '',
    description:    '',
    category:       'Divers',
    expense_date:   todayISO(),
    operation_type: 'expense',
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Expenses() {
  const { expenses, loading, isMutating, create, update, remove } = useExpenses();
  const { seasons } = useSeasons();

  const [searchTerm,        setSearchTerm]        = useState('');
  const [isFormOpen,        setIsFormOpen]        = useState(false);
  const [isDeleteOpen,      setIsDeleteOpen]      = useState(false);
  const [selectedExpense,   setSelectedExpense]   = useState<Expense | null>(null);
  const [formData,          setFormData]          = useState<ExpenseFormData>(buildDefaultForm);

  const isMobileView = useTableResponsive();

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    expenses.filter((e) =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()),
    ), [expenses, searchTerm]);

  const totalExpenses = useMemo(() => filtered.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0), [filtered]);
  const totalIncomes  = useMemo(() => filtered.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0), [filtered]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    const active = seasons.find((s) => s.is_active);
    setFormData(buildDefaultForm(active?.id));
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      season_id:      expense.season_id,
      amount:         String(Math.abs(expense.amount)),
      description:    expense.description,
      category:       expense.category,
      expense_date:   expense.expense_date,
      operation_type: expense.amount < 0 ? 'income' : 'expense',
    });
    setIsFormOpen(true);
  };

  const openDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExpense) {
      update(selectedExpense.id, formData);
    } else {
      create(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (selectedExpense) remove(selectedExpense.id);
    setIsDeleteOpen(false);
    setSelectedExpense(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Opérations de Trésorerie"
          subtitle="Dépenses et recettes diverses"
          actions={
            <Button onClick={openCreate} className="w-full sm:w-auto bg-navy hover:bg-navy-light h-12 rounded-xl">
              <Plus className="h-5 w-5 mr-2" />Nouvelle opération
            </Button>
          }
        />

        <ExpenseSummaryCards
          totalExpenses={totalExpenses}
          totalIncomes={totalIncomes}
          loading={loading}
        />

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="pb-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher une opération…"
            />
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <ExpenseTable
              expenses={filtered}
              loading={loading}
              isMobileView={isMobileView}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </CardContent>
        </Card>

        <ExpenseFormDialog
          open={isFormOpen}
          onOpenChange={(o) => { setIsFormOpen(o); if (!o) setSelectedExpense(null); }}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          selectedExpense={selectedExpense}
          seasons={seasons}
          isMutating={isMutating}
        />

        <DeleteDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDelete}
          description="Êtes-vous sûr de vouloir supprimer cette opération ? Cette action est irréversible."
        />
      </div>
    </DashboardLayout>
  );
}
