'use client';

import { generateNewTicketsAndClients } from '@/app/actions/demo';
import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function GenerateDataButton() {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const handleClick = () => {
        setMessage(null);
        startTransition(async () => {
            try {
                const result = await generateNewTicketsAndClients();
                if (result.success) {
                    setMessage(result.message || 'Données générées avec succès !');
                    // Refresh the page after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    const errorMsg = result.error || 'Erreur lors de la génération';
                    setMessage(errorMsg);
                    console.error('Generation error:', errorMsg);
                    // Keep error message visible longer
                    setTimeout(() => {
                        setMessage(null);
                    }, 5000);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
                setMessage(`Erreur: ${errorMsg}`);
                console.error('Error:', error);
                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                onClick={handleClick}
                disabled={isPending}
                className="rounded-full border-[#C7FF06] text-[#C7FF06] hover:bg-[#C7FF06] hover:text-gray-900"
            >
                <Plus className="h-4 w-4 mr-2" />
                {isPending ? 'Génération...' : 'Nouveaux tickets & clients'}
            </Button>
            {message && (
                <span className={`text-xs ${message.includes('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                    {message}
                </span>
            )}
        </div>
    );
}

