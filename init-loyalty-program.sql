-- Script SQL pour initialiser directement le programme de fidélité dans Supabase
-- Exécutez ce script APRÈS avoir exécuté create-tables.sql
-- Ce script crée le programme et les 3 niveaux (Bronze, Argent, Or)

-- Vérifier si un programme existe déjà
DO $$
DECLARE
    program_exists BOOLEAN;
    program_id TEXT;
BEGIN
    -- Vérifier si un programme existe
    SELECT EXISTS(SELECT 1 FROM "LoyaltyProgram" LIMIT 1) INTO program_exists;
    
    IF program_exists THEN
        RAISE NOTICE 'Un programme de fidélité existe déjà. Aucune action nécessaire.';
    ELSE
        -- Créer le programme de fidélité
        INSERT INTO "LoyaltyProgram" (
            "id",
            "name",
            "description",
            "pointsPerEuro",
            "conversionRate",
            "conversionValue",
            "bonusCategories",
            "pointsExpiryDays",
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid()::TEXT,
            'Programme de fidélité Swiim',
            'Programme de fidélité par défaut',
            1,
            100,
            5,
            '{"Livres": 2, "Vinyles": 2}'::JSONB,
            365,
            NOW(),
            NOW()
        )
        RETURNING "id" INTO program_id;
        
        RAISE NOTICE 'Programme créé avec l''ID: %', program_id;
        
        -- Créer les 3 niveaux
        INSERT INTO "LoyaltyTier" (
            "id",
            "programId",
            "name",
            "minSpend",
            "maxSpend",
            "benefits",
            "sortOrder",
            "createdAt",
            "updatedAt"
        ) VALUES 
        (
            gen_random_uuid()::TEXT,
            program_id,
            'Bronze',
            0,
            100,
            '{"Points standard": "1 point par euro"}'::JSONB,
            1,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid()::TEXT,
            program_id,
            'Argent',
            100,
            500,
            '{"Points bonus": "1.5 points par euro", "Remise": "5% sur les achats"}'::JSONB,
            2,
            NOW(),
            NOW()
        ),
        (
            gen_random_uuid()::TEXT,
            program_id,
            'Or',
            500,
            NULL,
            '{"Points premium": "2 points par euro", "Remise": "10% sur les achats", "Livraison gratuite": "Toujours"}'::JSONB,
            3,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '3 niveaux créés (Bronze, Argent, Or)';
        RAISE NOTICE '✅ Programme de fidélité initialisé avec succès !';
    END IF;
END $$;

-- Vérifier le résultat
SELECT 
    p."id" as program_id,
    p."name" as program_name,
    COUNT(t."id") as tiers_count
FROM "LoyaltyProgram" p
LEFT JOIN "LoyaltyTier" t ON t."programId" = p."id"
GROUP BY p."id", p."name";

