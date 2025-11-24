-- Script de vérification des tables de fidélité dans Supabase
-- Exécutez ce script dans Supabase SQL Editor pour vérifier si les tables existent

-- Vérifier si les tables existent
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('LoyaltyProgram', 'LoyaltyTier', 'LoyaltyAccount', 'LoyaltyCampaign')
ORDER BY table_name;

-- Compter les enregistrements dans chaque table
SELECT 
    'LoyaltyProgram' as table_name,
    COUNT(*) as count
FROM "LoyaltyProgram"
UNION ALL
SELECT 
    'LoyaltyTier' as table_name,
    COUNT(*) as count
FROM "LoyaltyTier"
UNION ALL
SELECT 
    'LoyaltyAccount' as table_name,
    COUNT(*) as count
FROM "LoyaltyAccount"
UNION ALL
SELECT 
    'LoyaltyCampaign' as table_name,
    COUNT(*) as count
FROM "LoyaltyCampaign";

