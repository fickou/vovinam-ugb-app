// src/types/cotisations.ts

export interface CotisationList {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
}

export interface CotisationEntry {
  id: string;
  list_id: string;
  member_id: string | null;  // null if external person
  first_name: string;
  last_name: string;
  amount: number;
  created_at: string;
  created_by: string;
}

// Représentation pour l'UI, incluant le membre lié s'il existe
export interface CotisationEntryWithMember extends CotisationEntry {
  member?: {
    first_name: string;
    last_name: string;
    phone: string;
    grade: string;
  };
}
