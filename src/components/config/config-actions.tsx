'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';

export function ConfigActions() {
  const [isLoading, setIsLoading] = useState(false);
  const caddyClient = useCaddyClient();

  const handleExport = async () => {
    const config = await caddyClient.getConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caddy-config-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const config = JSON.parse(await file.text());
      await caddyClient.loadConfig(config);
    } catch (error) {
      console.error('Failed to import configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button onClick={handleExport}>
        Export Config
      </Button>
      <Button disabled={isLoading} onClick={() => document.getElementById('config-file')?.click()}>
        Import Config
      </Button>
      <input
        id="config-file"
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
} 