'use client';

import { generateDemoData } from '@/app/actions/demo';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

export function DemoDataButton() {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            await generateDemoData();
        });
    };

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            disabled={isPending}
        >
            {isPending ? 'Génération...' : 'Générer Données Démo'}
        </Button>
    );
}
