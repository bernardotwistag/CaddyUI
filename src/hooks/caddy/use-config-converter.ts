import { useMemo } from 'react';
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';
import { CaddyConfig } from '@/lib/caddy/types';

const runCaddyfileToJson = async (
  caddyfile: unknown,
  caddyClient: ReturnType<typeof useCaddyClient>
): Promise<CaddyConfig> => {
  // @ts-expect-error caddyfile is not typed because it's a Caddyfile format and we don't need to type it
  return await caddyClient.adaptConfig(caddyfile);
};

export function useConfigConverter() {
  const caddyClient = useCaddyClient();

  return useMemo(
    () => ({
      convertCaddyfileToJson: (caddyfile: unknown) => 
        runCaddyfileToJson(caddyfile, caddyClient),
    }),
    [caddyClient]
  );
} 