/**
 * @file src/components/card-generator/data/reglement.ts
 * Données statiques du Règlement Intérieur du Club.
 * Extraites de CardGenerator.tsx pour ne pas polluer la logique du composant.
 */
import type { ReglementArticle } from '@/types';

export const REGLEMENT_ARTICLES: ReglementArticle[] = [
  {
    num: 1,
    titre: 'Adhésion et Cotisation',
    texte: "Tout pratiquant doit s'acquitter de ses droits d'inscription et de ses mensualités dans les délais impartis. Aucun pratiquant en situation d'impayé ne sera admis à l'entraînement.",
  },
  {
    num: 2,
    titre: 'Assiduité & Absences',
    texte: "La présence régulière est obligatoire. Tout retard injustifié est sanctionné. Au-delà de 3 absences injustifiées par mois ou 10 sur la saison, le pratiquant pourra se voir refuser le passage de grade.",
  },
  {
    num: 3,
    titre: 'Tenue Réglementaire',
    texte: "Le port de la tenue officielle du club (võ phục) est obligatoire lors de chaque séance. La tenue doit être propre, complète et en bon état.",
  },
  {
    num: 4,
    titre: 'Respect & Discipline',
    texte: "Les pratiquants doivent faire preuve de respect envers les instructeurs, les aînés et les camarades. Tout comportement irrespectueux ou violent en dehors du cadre pédagogique sera sanctionné.",
  },
  {
    num: 5,
    titre: 'Hygiène',
    texte: "Chaque pratiquant est tenu de maintenir une hygiène corporelle irréprochable. Les pieds et les mains doivent être propres. Les ongles doivent être coupés courts.",
  },
  {
    num: 6,
    titre: 'Usage du Dojo',
    texte: "Le dojo est un espace sacré. Il est interdit d'y manger, de fumer ou d'y introduire des boissons alcoolisées. Chaussures interdites sur le tatami.",
  },
  {
    num: 7,
    titre: 'Téléphones & Distractions',
    texte: "L'utilisation des téléphones portables est strictement interdite pendant les séances d'entraînement. Les appareils doivent être mis en mode silencieux ou éteints.",
  },
  {
    num: 8,
    titre: 'Sécurité',
    texte: "La sécurité de tous est une priorité. Tout pratiquant blessé ou souffrant doit en informer immédiatement l'instructeur. Les techniques dangereuses ne sont autorisées que sous supervision.",
  },
  {
    num: 9,
    titre: 'Représentation du Club',
    texte: "Les pratiquants représentant le club lors de compétitions ou d'événements sont tenus de se comporter avec honneur et fair-play, avant, pendant et après la compétition.",
  },
  {
    num: 10,
    titre: 'Sanctions & Passage de Grade',
    texte: "Tout manquement au règlement peut entraîner un avertissement, une suspension ou une exclusion. Le dépassement du seuil d'absences injustifiées (Art. 2) entraîne automatiquement le refus de passage de grade.",
  },
];
