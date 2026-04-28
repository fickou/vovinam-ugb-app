/**
 * @file src/types/index.ts
 * Point d'entrée unique pour tous les types métier de l'application.
 * Importer depuis ici pour garantir la cohérence des données.
 */

// ─── Rôles ───────────────────────────────────────────────────────────────────

export type AppRole = 'super_admin' | 'admin' | 'treasurer' | 'coach' | 'member';

// ─── Domaine Membres ─────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'new' | 'suspended' | 'former';

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  status: MemberStatus;
  member_number: string | null;
  created_at: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: MemberStatus;
}

// ─── Saisons ─────────────────────────────────────────────────────────────────

export interface Season {
  id: string;
  name: string;
  is_active?: boolean;
  start_date?: string;
}

// ─── Paiements ───────────────────────────────────────────────────────────────

export type PaymentType = 'registration' | 'monthly' | 'other';
export type PaymentMethod = 'wave' | 'cash' | 'transfer' | 'other';
export type PaymentStatus = 'VALIDATED' | 'PENDING' | 'REJECTED';

export interface Payment {
  id: string;
  member_id: string;
  season_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  payment_date: string;
  status: PaymentStatus;
  members?: Pick<Member, 'first_name' | 'last_name'> | null;
  seasons?: Pick<Season, 'name'> | null;
}

// ─── Trésorerie / Dépenses ───────────────────────────────────────────────────

export type OperationType = 'expense' | 'income';

export interface Expense {
  id: string;
  season_id: string;
  amount: number; // positif = dépense, négatif = recette diverse
  description: string;
  category: string;
  expense_date: string;
  recorded_by?: string | null;
  seasons?: Pick<Season, 'name'> | null;
}

export interface ExpenseFormData {
  season_id: string;
  amount: string;
  description: string;
  category: string;
  expense_date: string;
  operation_type: OperationType;
}

// ─── Bilan Financier ─────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  member?: string | null;
}

export interface ReportData {
  totalMembers: number;
  activeMembers: number;
  totalPayments: number;
  registrationPayments: number;
  monthlyPayments: number;
  otherPayments: number;
  otherIncomes: number;
  totalExpenses: number;
  netBalance: number;
  paymentsByMethod: Record<string, number>;
}

// ─── Cartes / Card Generator ─────────────────────────────────────────────────

export type CardType = 'access' | 'reminder' | 'renewal' | 'reglement' | 'principes' | 'programme';

export interface CardFormData {
  ligue: string;
  clubName: string;
  firstName: string;
  lastName: string;
  phone: string;
  season: string;
  website: string;
  email: string;
  inscriptionAmount: string;
  mensualiteAmount: string;
  paymentMethod: string;
  renewalTitle: string;
  renewalSubtitle: string;
  renewalDate: string;
  renewalTime: string;
  renewalLocation: string;
  renewalAgenda1: string;
  renewalAgenda2: string;
  renewalAgenda3: string;
  renewalMessage: string;
  programTitle: string;
  programActivities: ProgramActivity[];
}

export interface ProgramActivity {
  id: string;
  name: string;
  date: string;
  location: string;
  time: string;
}

// ─── Documents Vovinam ───────────────────────────────────────────────────────

export interface ReglementArticle {
  num: number;
  titre: string;
  texte: string;
}

export interface Principe {
  num: number;
  fr: string;
  vn: string;
}

// ─── Membres du Bureau ───────────────────────────────────────────────────────

export interface BoardMember {
  id: string;
  full_name: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  season_id?: string | null;
}
