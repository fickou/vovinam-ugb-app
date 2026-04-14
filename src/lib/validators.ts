/**
 * src/lib/validators.ts
 * Schémas Zod centralisés — Validation client-side de toutes les données sensibles
 */
import { z } from 'zod';

// ─────────────────────────────────────────────
// PAIEMENTS
// ─────────────────────────────────────────────
const PAYMENT_TYPES = ['monthly', 'registration', 'annual', 'other'] as const;
const PAYMENT_METHODS = ['cash', 'wave', 'transfer', 'other'] as const;
const PAYMENT_STATUSES = ['VALIDATED', 'PENDING'] as const;

const MAX_PAYMENT_AMOUNT = 500_000; // 500 000 FCFA plafond

export const paymentSchema = z.object({
  member_id: z.string().uuid('Pratiquant invalide'),
  season_id: z.string().uuid('Saison invalide'),
  amount: z
    .number({ invalid_type_error: 'Montant invalide' })
    .positive('Le montant doit être positif')
    .max(MAX_PAYMENT_AMOUNT, `Le montant ne peut pas dépasser ${MAX_PAYMENT_AMOUNT.toLocaleString('fr-FR')} FCFA`),
  payment_type: z.enum(PAYMENT_TYPES, { errorMap: () => ({ message: 'Type de paiement invalide' }) }),
  payment_method: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: 'Méthode de paiement invalide' }) }),
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format YYYY-MM-DD)')
    .refine((d) => new Date(d) <= new Date(), 'La date ne peut pas être dans le futur'),
  month_number: z.number().int().min(1).max(12).nullable().optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
  notes: z.string().max(500, 'Notes trop longues (max 500 caractères)').optional().nullable(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ─────────────────────────────────────────────
// INSCRIPTION / AUTH
// ─────────────────────────────────────────────

// Regex téléphone sénégalais : 7X XXX XX XX ou +221 7X XXX XX XX
const phoneRegex = /^(\+221\s?)?(7[0-9])\s?\d{3}\s?\d{2}\s?\d{2}$/;

export const signupSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Prénom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Prénom invalide (caractères spéciaux non autorisés)'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Nom trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Nom invalide (caractères spéciaux non autorisés)'),
  telephone: z
    .string()
    .regex(phoneRegex, 'Numéro de téléphone invalide (ex: 77 123 45 67)')
    .optional()
    .or(z.literal('')),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// ─────────────────────────────────────────────
// PROFIL
// ─────────────────────────────────────────────
export const profileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Prénom requis')
    .max(50, 'Prénom trop long'),
  last_name: z
    .string()
    .min(2, 'Nom requis')
    .max(50, 'Nom trop long'),
  phone: z
    .string()
    .regex(phoneRegex, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  date_of_birth: z
    .string()
    .refine((d) => !d || new Date(d) < new Date(), 'Date de naissance invalide')
    .optional(),
});

// ─────────────────────────────────────────────
// MEMBRE (admin)
// ─────────────────────────────────────────────
export const memberSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex).optional().or(z.literal('')),
  date_of_birth: z
    .string()
    .refine((d) => !d || new Date(d) < new Date(), 'Date invalide')
    .optional(),
  member_number: z.string().optional(),
});

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────

/**
 * Extrait le premier message d'erreur d'un ZodError
 */
export function getFirstZodError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Données invalides';
}

/**
 * Sanitise une chaîne (supprime les caractères dangereux XSS basiques)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Rate limiter simple basé sur un timestamp
 */
export class RateLimiter {
  private lastCallTime: number = 0;
  private readonly minInterval: number;

  constructor(minIntervalMs: number = 3000) {
    this.minInterval = minIntervalMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime < this.minInterval) return false;
    this.lastCallTime = now;
    return true;
  }

  getRemainingMs(): number {
    return Math.max(0, this.minInterval - (Date.now() - this.lastCallTime));
  }
}
