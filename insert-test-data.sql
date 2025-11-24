-- Script SQL pour insérer des données de test (Store et PosTerminal)
-- Exécutez ce script dans Supabase SQL Editor après avoir créé les tables

-- Insérer un Store (magasin) de test
INSERT INTO "Store" ("id", "name", "city", "address", "userId", "createdAt", "updatedAt")
VALUES (
    'store-test-001',
    'Magasin Principal',
    'Paris',
    '123 Rue de la Démo, 75001 Paris',
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Insérer un PosTerminal (TPE) de test associé au magasin
INSERT INTO "PosTerminal" ("id", "name", "identifier", "storeId", "status", "lastSeenAt", "createdAt", "updatedAt")
VALUES (
    'terminal-test-001',
    'TPE Principal',
    'TPE-MAIN-001',
    'store-test-001',
    'ACTIF',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- Vérification : Afficher les données insérées
SELECT 'Store créé:' as info, "id", "name", "city" FROM "Store" WHERE "id" = 'store-test-001';
SELECT 'Terminal créé:' as info, "id", "name", "identifier", "status" FROM "PosTerminal" WHERE "id" = 'terminal-test-001';



