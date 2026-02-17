# Vovinam UGB SC - Migration MySQL & PHP

Cette version est une migration du projet original vers une architecture autonome utilisant **MySQL** et **PHP**, remplaçant ainsi Supabase.

## Prérequis

1.  **Serveur Web :** Apache ou Nginx avec PHP 8.0+ installé.
2.  **Base de données :** MySQL 5.7+ ou MariaDB.
3.  **Node.js :** Pour le développement frontend.

## Installation

1.  **Base de données :**
    - Importez le fichier [`mysql/schema.sql`](./mysql/schema.sql) dans votre base de données MySQL.
    
2.  **Configuration PHP :**
    - Modifiez [`api/config.php`](./api/config.php) avec vos accès à la base de données.
    
3.  **Frontend :**
    - Installez les dépendances : `npm install`
    - Lancez le serveur de développement : `npm run dev`
    - Les requêtes API seront proxied vers `http://localhost:8000` (configurable dans `vite.config.ts`).

4.  **Lancement du Backend (en développement) :**
    - Vous pouvez utiliser le serveur PHP intégré :
      ```bash
      cd api
      php -S localhost:8000
      ```

## Migration des données depuis Supabase

1. Ouvrez [`migrate.php`](./migrate.php).
2. Remplissez les informations de connexion pour Supabase (PostgreSQL) et votre nouvelle base MySQL.
3. Exécutez le script : `php migrate.php`.

## Structure du projet

- `api/` : Endpoints PHP pour toutes les fonctionnalités.
- `src/lib/api.ts` : Client frontend pour communiquer avec le backend PHP.
- `mysql/schema.sql` : Schéma de la base de données.
