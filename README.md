# Vovinam UGB Reminders - Système de Gestion

Bienvenue dans le projet **Vovinam UGB Reminders**. Cette application est conçue pour gérer les membres, les saisons et les paiements d'un club de Vovinam Viet Vo Dao.

Cette version spécifique (située dans le dossier `copie`) est une architecture autonome utilisant **PHP** pour le backend et **MySQL** pour la base de données, remplaçant l'ancienne architecture basée sur Supabase.

---

## 🚀 Technologies utilisées

### Frontend
- **React** (avec Vite & TypeScript)
- **Tailwind CSS** pour le stylage
- **Shadcn UI** pour les composants d'interface
- **Lucide React** pour les icônes
- **TanStack Query** (React Query) pour la gestion d'état des données

### Backend
- **PHP 8.0+** (API REST native)
- **MySQL / MariaDB** pour le stockage
- **PDO** pour la connexion à la base de données sécurisée

---

## 📁 Structure du Projet

```text
copie/
├── api/            # Backend PHP (Endpoints API)
│   ├── auth/       # Gestion de la connexion et inscription
│   ├── config.php  # Configuration de la base de données
│   ├── utils.php   # Fonctions utilitaires (JSON, UUID, etc.)
│   └── *.php       # Ressources (members, payments, seasons, etc.)
├── mysql/          # Scripts de base de données
│   └── schema.sql  # Structure de la base de données
├── src/            # Frontend React + TypeScript
│   ├── components/ # Composants réutilisables
│   ├── pages/      # Vues principales de l'application
│   ├── lib/        # Utilitaires frontend (client API)
│   └── hooks/      # Hooks personnalisés
└── migrate.php     # Script de migration Supabase -> MySQL
```

---

## 🛠️ Installation et Configuration

### 1. Base de données
1. Créez une base de données MySQL nommée `vovinam_ugb`.
2. Importez le fichier `mysql/schema.sql` :
   ```bash
   mysql -u utilisateur -p vovinam_ugb < mysql/schema.sql
   ```

### 2. Backend PHP
1. Configurez vos accès dans `api/config.php`.
2. Assurez-vous que votre serveur web (Apache/PHP) pointe vers le dossier `api`.
3. Pour le développement local, vous pouvez lancer :
   ```bash
   cd api
   php -S localhost:8000
   ```

### 3. Frontend React
1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Configurez le fichier `.env` si nécessaire (base URL de l'API).
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

---

## 💡 Fonctionnalités Principales

- **Tableau de Bord** : Statistiques globales sur les membres et les paiements.
- **Gestion des Membres** : Ajout, modification, suppression et suivi du statut des pratiquants.
- **Suivi des Paiements** : Enregistrement des inscriptions et des mensualités avec support des modes de paiement (Wave, Espèces, etc.).
- **Gestion des Saisons** : Configuration des frais d'inscription et des cotisations mensuelles par saison.
- **Génération de Rapports** (En cours) : Visualisation des performances financières.

---

## 🔄 Migration (Optionnel)

Si vous venez de l'ancienne version Supabase :
1. Configurez `migrate.php` avec vos anciennes et nouvelles informations de connexion.
2. Exécutez le script : `php migrate.php`.

---

## 👤 Auteur
Projet développé pour le club Vovinam UGB.
