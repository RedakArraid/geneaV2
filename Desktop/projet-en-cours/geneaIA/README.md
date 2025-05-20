# GeneaIA

Application de généalogie moderne permettant de créer, visualiser et partager des arbres généalogiques de manière interactive.

## Structure du projet

Le projet est structuré en deux parties principales :

- `/backend` : API REST avec Node.js, Express et Prisma
- `/frontend` : Interface utilisateur avec React, Vite et TailwindCSS

## Prérequis

- Node.js v16+ et npm
- PostgreSQL (pour la base de données)

## Installation rapide

1. Clonez le répertoire :
```bash
git clone <URL-du-repo>
cd geneaIA
```

2. Rendez les scripts exécutables :
```bash
chmod +x setup.sh
./setup.sh
```

3. Configurez votre base de données PostgreSQL dans le fichier `backend/.env` :
```
DATABASE_URL="postgresql://username:password@localhost:5432/geneaia?schema=public"
```

4. Initialisez la base de données :
```bash
./init-db.sh
```

5. Démarrez l'application :
```bash
./start.sh
```

## Installation manuelle détaillée

### Configuration de la base de données

1. Assurez-vous que PostgreSQL est installé et en cours d'exécution
2. Créez une base de données pour le projet :

```sql
CREATE DATABASE geneaia;
```

### Backend

1. Accédez au répertoire backend :

```bash
cd backend
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez les variables d'environnement en modifiant le fichier `.env` :

```
DATABASE_URL="postgresql://username:password@localhost:5432/geneaia?schema=public"
PORT=3001
JWT_SECRET="votre-secret-jwt"
JWT_EXPIRES_IN="7d"
```

4. Exécutez les migrations Prisma pour créer les tables :

```bash
npx prisma migrate dev
```

5. Générez le client Prisma :

```bash
npx prisma generate
```

6. Démarrez le serveur de développement :

```bash
npm run dev
```

### Frontend

1. Accédez au répertoire frontend :

```bash
cd frontend
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez les variables d'environnement en modifiant le fichier `.env` :

```
VITE_APP_NAME=GeneaIA
VITE_API_URL=http://localhost:3001/api
```

4. Démarrez le serveur de développement :

```bash
npm run dev
```

## Utilisation

Une fois les serveurs backend et frontend démarrés :

1. Accédez à l'application dans votre navigateur : http://localhost:5173
2. Créez un compte utilisateur ou connectez-vous avec :
   - Email : test@example.com
   - Mot de passe : password123
3. Commencez à créer et à gérer vos arbres généalogiques

## Dépannage

### Erreurs liées à Prisma

Si vous rencontrez des erreurs lors de la migration ou de la génération du client Prisma :

```bash
# Réinitialiser la migration
npx prisma migrate reset

# Recréer la migration
npx prisma migrate dev --name init
```

### Erreurs liées au serveur frontend

Si vous rencontrez des erreurs de module lors du démarrage du frontend :

```bash
# Supprimer les modules existants
rm -rf node_modules package-lock.json

# Réinstaller les dépendances
npm install
```

## Fonctionnalités

- Création et gestion de plusieurs arbres généalogiques
- Visualisation interactive avec possibilité de déplacer et réorganiser les membres
- Ajout de détails pour chaque personne (dates de naissance/décès, lieu de naissance, profession, etc.)
- Création de différents types de relations (parent, enfant, conjoint, frère/sœur)
- Partage d'arbres généalogiques
- Gestion des comptes utilisateurs

## Technologies utilisées

### Backend
- Node.js
- Express
- Prisma (ORM)
- PostgreSQL
- JWT (authentification)
- bcrypt (hachage des mots de passe)

### Frontend
- React
- Vite
- React Router
- ReactFlow (visualisation d'arbres)
- TailwindCSS
- Framer Motion (animations)
- Zustand (gestion de l'état)
- Axios (requêtes HTTP)

## Licence

Ce projet est sous licence MIT.