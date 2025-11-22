'use client';

import { exportAnalyticsCSV } from '@/app/actions/export';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExportButton() {
    const [isPending, startTransition] = useTransition();

    const handleExport = () => {
        startTransition(async () => {
            const result = await exportAnalyticsCSV();
            if (result.csv) {
                const blob = new Blob([result.csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'analytics_export.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            }
        });
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isPending}
        >
            <Download className="mr-2 h-4 w-4" />
            {isPending ? 'Export...' : 'Exporter CSV'}
        </Button>
    );
}
