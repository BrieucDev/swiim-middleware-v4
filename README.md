# SWIIM Merchant Dashboard

Plateforme de gestion des tickets numériques, fidélité et analytics pour les enseignes de distribution.

## 🚀 Installation

### Prérequis

- Node.js 18+ et pnpm installés
- Compte Supabase avec une base de données Postgres
- Variable d'environnement `DATABASE_URL` configurée

### Étapes d'installation

> **Note**: Les migrations ont été réinitialisées pour passer de SQLite à Supabase Postgres.

1. **Installer les dépendances**

```bash
pnpm install
```

2. **Configurer la base de données (Supabase)**

Créez un fichier `.env` à la racine du projet avec votre URL de connexion Supabase (voir `.env.example`) :

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

> **Production (Vercel)** : Configurez `DATABASE_URL` dans Project → Settings → Environment Variables.

3. **Appliquer les migrations**

```bash
npx prisma migrate dev --name init
```

4. **Seeder la base de données (optionnel)**

```bash
npx prisma db seed
```

5. **Lancer le serveur de développement**

```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).
Vous pouvez vérifier la connexion à la base de données via [http://localhost:3000/api/health-db](http://localhost:3000/api/health-db).

## 📦 Structure du projet

```
swiim-middleware-v3/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Routes du dashboard
│   │   ├── accueil/         # Page d'accueil avec KPIs
│   │   ├── tickets/         # Gestion des tickets
│   │   ├── magasins/        # Gestion des magasins
│   │   ├── tpe-cles/        # Gestion des TPE
│   │   ├── clients/         # Gestion des clients
│   │   ├── fidelite/        # Programme de fidélité
│   │   ├── analytique/      # Analytics et insights
│   │   └── parametres/      # Paramètres
│   └── api/                 # API routes
├── components/              # Composants React
│   ├── layout/             # Layout components (Sidebar, Header)
│   ├── ui/                 # Composants UI shadcn
│   ├── fidelite/           # Composants fidélité
│   └── tpe/                # Composants TPE
├── lib/                    # Utilitaires
│   ├── prisma.ts           # Client Prisma singleton
│   ├── format.ts           # Helpers de formatage
│   └── analytics/          # Fonctions d'analyse
└── prisma/                 # Prisma
    ├── schema.prisma       # Schéma de la base de données
    └── seed.ts             # Script de seed
```

## 🗄️ Base de données

Le projet utilise Prisma avec Supabase Postgres. Le schéma inclut :

- **Store** : Magasins
- **PosTerminal** : Terminaux de paiement
- **Customer** : Clients
- **Receipt** : Tickets de caisse
- **ReceiptLineItem** : Lignes de ticket
- **LoyaltyProgram** : Programme de fidélité
- **LoyaltyTier** : Niveaux de fidélité
- **LoyaltyAccount** : Comptes fidélité
- **LoyaltyCampaign** : Campagnes marketing

## 🚢 Déploiement sur Vercel

### 1. Préparer le repository GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Connecter Vercel au repository

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Configurez les variables d'environnement :
   - `DATABASE_URL` : Votre URL de connexion Supabase

### 3. Configuration Vercel

Vercel détectera automatiquement Next.js. Les paramètres recommandés :

- **Framework Preset** : Next.js
- **Build Command** : `pnpm build` (ou `npm run build`)
- **Output Directory** : `.next`
- **Install Command** : `pnpm install` (ou `npm install`)

### 4. Variables d'environnement

Assurez-vous d'ajouter dans Vercel :
- `DATABASE_URL` : URL de connexion à votre base Supabase

### 5. Post-deployment

Après le premier déploiement :

1. Ouvrez la console Vercel
2. Lancez une commande dans le shell pour exécuter les migrations :

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

Ou créez un script de build personnalisé qui exécute ces commandes.

## 🔧 Scripts disponibles

- `pnpm dev` : Lance le serveur de développement
- `pnpm build` : Build la production
- `pnpm start` : Lance le serveur de production
- `pnpm lint` : Lint le code
- `pnpm prisma:generate` : Génère le client Prisma
- `pnpm prisma:migrate` : Lance une migration
- `pnpm prisma:seed` : Seed la base de données

## 📝 Notes importantes

- Le projet utilise le pattern singleton pour Prisma (compatible Vercel serverless)
- Toutes les données sont en français
- Les données seedées incluent des exemples FNAC réalistes
- Le projet est optimisé pour Vercel (serverless compatible)

## 🛠️ Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **TailwindCSS**
- **shadcn/ui**
- **Prisma**
- **Supabase Postgres**
- **Recharts** (graphiques)

## 📄 Licence

Propriétaire - SWIIM

