/**
 * @file src/lib/utils.ts
 * Fonctions utilitaires partagées dans toute l'application.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MemberStatus, PaymentType } from '@/types';

// ─── Tailwind ─────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatage monétaire ──────────────────────────────────────────────────────

/**
 * Formate un montant en FCFA avec séparateur de milliers.
 * @example formatAmount(150000) → "150 000 FCFA"
 */
export function formatAmount(amount: number, withCurrency = true): string {
  const formatted = Math.abs(amount).toLocaleString('fr-FR');
  return withCurrency ? `${formatted} FCFA` : `${formatted} F`;
}

/**
 * Formate un montant de trésorerie avec signe +/-.
 * Négatif dans la DB = recette diverse (entrée d'argent).
 */
export function formatExpenseAmount(amount: number): string {
  const sign = amount < 0 ? '+' : '-';
  return `${sign}${Math.abs(amount).toLocaleString()} F`;
}

// ─── Formatage dates ──────────────────────────────────────────────────────────

/**
 * Formate une date ISO en date lisible FR.
 * @example formatDate('2026-04-28') → "28/04/2026"
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('fr-FR');
}

/**
 * Retourne la date du jour au format ISO YYYY-MM-DD (pour les inputs date).
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Labels métier ────────────────────────────────────────────────────────────

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  monthly: 'Mensualité',
  registration: 'Inscription',
  other: 'Autre',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave: 'Wave',
  cash: 'Espèces',
  transfer: 'Virement',
  other: 'Autre',
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Actif',
  new: 'Nouveau',
  suspended: 'Suspendu',
  former: 'Ancien',
};

export const MEMBER_STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800',
  new: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
  suspended: 'bg-amber-100 text-amber-800',
  former: 'bg-gray-100 text-gray-800',
};

export function getPaymentTypeLabel(type: PaymentType | string): string {
  return PAYMENT_TYPE_LABELS[type] ?? 'Autre';
}

// ─── Agrégations ─────────────────────────────────────────────────────────────

/**
 * Groupe un tableau d'objets par une clé et en somme les montants.
 * @example groupByCategory(transactions, 'category', 'amount')
 */
export function groupByCategory<T extends Record<string, any>>(
  items: T[],
  keyField: keyof T,
  valueField: keyof T,
): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = String(item[keyField]);
    acc[key] = (acc[key] ?? 0) + Number(item[valueField]);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Filtre et somme les dépenses dont le montant est positif (vraies dépenses).
 */
export function sumExpenses(amounts: number[]): number {
  return amounts.filter((a) => a > 0).reduce((s, a) => s + a, 0);
}

/**
 * Filtre et somme les recettes diverses (montants négatifs dans la DB).
 */
export function sumIncomes(amounts: number[]): number {
  return amounts.filter((a) => a < 0).reduce((s, a) => s + Math.abs(a), 0);
}
