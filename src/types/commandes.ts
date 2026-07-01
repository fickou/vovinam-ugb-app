// src/types/commandes.ts
// Types métier pour le module Commandes (Lacoste, Blouson, etc.)

export interface OrderCampaign {
  id: string;
  name: string;
  product_type: string;
  description: string | null;
  price: number;
  /** Marge bénéficiaire du club par article (FCFA). Prix confectionneur = price - margin */
  margin: number;
  available_sizes: string[];
  deadline: string | null;
  is_active: boolean;
  image_url: string | null;   // URL publique de l'image échantillon
  created_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  campaign_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  size: string;
  quantity: number;
  notes: string | null;
  is_paid: boolean;
  paid_at: string | null;
  validated_by: string | null;
  created_at: string;
  // joined
  campaign?: OrderCampaign;
}

export interface CampaignFormData {
  name: string;
  product_type: string;
  description: string;
  price: string;
  /** Marge du club par article (FCFA) */
  margin: string;
  available_sizes: string;   // saisie libre séparée par virgules, ex: "S,M,L,XL"
  deadline: string;
  is_active: boolean;
  image_url: string | null;  // URL stockée après upload
}

export interface OrderFormData {
  first_name: string;
  last_name: string;
  phone: string;
  size: string;
  quantity: number;
  notes: string;
}

export const DEFAULT_CAMPAIGN_FORM: CampaignFormData = {
  name: '',
  product_type: 'Lacoste',
  description: '',
  price: '',
  margin: '',
  available_sizes: 'S, M, L, XL, XXL',
  deadline: '',
  is_active: true,
  image_url: null,
};

export const DEFAULT_ORDER_FORM: OrderFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  size: '',
  quantity: 1,
  notes: '',
};

export const PRODUCT_TYPES = [
  'Lacoste',
  'Blouson',
  'T-shirt',
  'Pantalon',
  'Short',
  'Survêtement',
  'Autre',
] as const;
