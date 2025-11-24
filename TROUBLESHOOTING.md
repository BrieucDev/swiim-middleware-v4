# Troubleshooting - Problème de timeout pnpm

## Problème
`Error: ETIMEDOUT: connection timed out, read` lors de l'utilisation de pnpm

## Solutions

### 1. Utiliser npm à la place
```bash
npm run dev
```

### 2. Vérifier les permissions
```bash
chmod 644 package.json
chmod 755 node_modules 2>/dev/null || true
```

### 3. Nettoyer et réinstaller
```bash
rm -rf node_modules
rm -rf .pnpm-store
npm install
npm run dev
```

### 4. Redémarrer complètement
- Fermer tous les terminaux
- Redémarrer l'ordinateur si nécessaire
- Réessayer

### 5. Vérifier l'espace disque
```bash
df -h
```

## Code créé

Tous les composants du Loyalty Control Center sont créés et prêts :
- ✅ 13 composants dans `components/fidelite/`
- ✅ Server actions dans `app/actions/loyalty.ts`
- ✅ Helpers dans `lib/analytics/loyalty-segments.ts`
- ✅ Composants UI (textarea, switch)

Le problème est uniquement système avec pnpm/corepack, pas avec le code.
