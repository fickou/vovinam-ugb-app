# Plateforme de Gestion de Club de Vovinam Viet Vo Dao (UGB)

L'application est un système complet de gestion (Dashboard/ERP) conçu sur mesure pour numériser, structurer et faciliter l'administration quotidienne du club de Vovinam Viet Vo Dao de l'Université Gaston Berger (UGB). Elle permet de centraliser toutes les opérations essentielles du club dans une interface unique, moderne et sécurisée.

**Fonctionnalités clés :**
*   **Gestion de la Vie du Club :** Inscription, profils, suivi des grades et historique des membres (`/members`, `/seasons`).
*   **Gestion Financière :** Suivi rigoureux des cotisations mensuelles, des dépenses du club et des autres paiements (`/cotisations`, `/expenses`, `/payments`).
*   **Générateur de Cartes :** Outil intégré permettant de créer, visualiser et exporter automatiquement les cartes d'identité sportives des membres (`/card`).
*   **Tableau de Bord & Rapports :** Visualisation globale de la santé financière et de l'évolution des effectifs via des graphiques interactifs (`/dashboard`, `/reports`).
*   **Gestion du Bureau :** Mise en valeur des membres du bureau directeur et de leurs rôles (`/board`).
*   **Communication :** Interface d'administration du site public (`/public-site`) et système de gestion des rappels (`/reminders`).

### 2. Public cible et Rôles
Cette application est conçue pour être utilisée par l'ensemble des acteurs du club, avec un système de droits d'accès sécurisé (RBAC - Role-Based Access Control) :

*   **Administrateurs (Super-Admins / Président) :** Accès total. Ils peuvent gérer la configuration globale du club, attribuer des rôles aux autres utilisateurs (`/users`, `/settings`), et superviser l'ensemble des données.
*   **Le Staff du Bureau (Trésorier, Secrétaire...) :** Accès aux outils opérationnels. Le trésorier a accès à la gestion financière (ajout de paiements, dépenses), tandis que le secrétaire peut gérer les membres, mettre à jour les grades, et générer les cartes.
*   **Les Pratiquants (Membres standards) :** Ils disposent d'un compte pour consulter leur profil, vérifier l'état de leurs cotisations pour la saison en cours et s'informer sur les contacts du bureau. 


**Stack Technique :**
*   **Frontend :** React 18, TypeScript, Vite
*   **Interface (UI) :** Tailwind CSS, Shadcn UI, Radix UI, Lucide React
*   **Backend & Base de données :** Supabase (Auth, PostgreSQL, Row Level Security)
*   **Traitement de données :** React Query (`@tanstack/react-query`), React Router DOM
*   **Utilitaires :** Zod (validation), React Hook Form, Recharts (graphiques), html2canvas/jspdf (génération de cartes)

### 3. Quelles captures d’écran

1.  **Le Dashboard Principal (`/dashboard`) :** 
![Dashboard](/docs/dashboard.png)
2.  **Le Générateur de Cartes (`/dashboard/card`) :** 
![Carte](/docs/carte.png)
3.  **La Table des paiements (`/dashboard/cotisations`) :** 
![payement](/docs/payement.png)
4.  **La Table des membres (`/dashboard/members`) :** 
![members](/docs/members.png)
5.  **Une Capture Mobile :** 
![Site public](/docs/public.png)