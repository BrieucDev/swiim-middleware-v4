# Instructions pour créer les tables dans Supabase

## ⚠️ IMPORTANT
**N'UTILISEZ PAS les fichiers `.ts` (TypeScript) dans Supabase SQL Editor !**
**UTILISEZ UNIQUEMENT les fichiers `.sql` !**

## 📋 Étapes à suivre

### 1. Ouvrir Supabase SQL Editor
- Allez sur https://supabase.com
- Connectez-vous à votre projet
- Cliquez sur "SQL Editor" dans le menu de gauche

### 2. Vérifier si les tables existent (optionnel)
1. Dans SQL Editor, créez une nouvelle requête
2. Ouvrez le fichier `check-loyalty-tables.sql` dans votre éditeur de code
3. **Copiez TOUT le contenu** du fichier `check-loyalty-tables.sql`
4. Collez-le dans Supabase SQL Editor
5. Cliquez sur "Run" (ou Ctrl+Enter)
6. Vérifiez les résultats :
   - Si vous voyez "✅ Existe" pour toutes les tables → Les tables existent déjà
   - Si vous voyez "❌ Manquante" → Passez à l'étape 3

### 3. Créer les tables
1. Dans Supabase SQL Editor, créez une nouvelle requête
2. Ouvrez le fichier `create-tables.sql` dans votre éditeur de code
3. **Copiez TOUT le contenu** du fichier `create-tables.sql` (249 lignes)
4. Collez-le dans Supabase SQL Editor
5. Cliquez sur "Run" (ou Ctrl+Enter)
6. Vous devriez voir "Success. No rows returned" ou un message de succès

### 4. Vérifier que les tables ont été créées
1. Dans Supabase SQL Editor, créez une nouvelle requête
2. Exécutez à nouveau `check-loyalty-tables.sql`
3. Vous devriez maintenant voir "✅ Existe" pour toutes les tables

### 5. Retourner à l'application
1. Allez sur votre application déployée
2. Cliquez sur "Initialiser le programme" sur la page `/fidelite`
3. Cela devrait maintenant fonctionner !

## ❌ Erreurs courantes

### Erreur: "syntax error at or near 'use server'"
**Cause:** Vous avez copié du code TypeScript au lieu de SQL
**Solution:** Utilisez le fichier `create-tables.sql`, pas `app/actions/loyalty.ts`

### Erreur: "syntax error at or near '{'"
**Cause:** Vous avez copié du code TypeScript/JavaScript
**Solution:** Utilisez le fichier `create-tables.sql`, pas les fichiers `.ts`

### Erreur: "relation does not exist"
**Cause:** Les tables n'ont pas été créées
**Solution:** Exécutez `create-tables.sql` dans Supabase SQL Editor

## 📁 Fichiers à utiliser

✅ **À UTILISER dans Supabase SQL Editor:**
- `create-tables.sql` → Pour créer toutes les tables
- `check-loyalty-tables.sql` → Pour vérifier si les tables existent

❌ **À NE PAS UTILISER dans Supabase SQL Editor:**
- `app/actions/loyalty.ts` → Code TypeScript (ne fonctionne pas dans SQL Editor)
- Tous les fichiers `.ts` → Code TypeScript
- Tous les fichiers `.tsx` → Code TypeScript/React

## 🔍 Comment reconnaître un fichier SQL

Un fichier SQL commence généralement par:
- `-- Commentaire SQL`
- `CREATE TABLE`
- `SELECT`
- `INSERT`

Un fichier TypeScript commence généralement par:
- `'use server'`
- `import`
- `export`
- `const` ou `function`

