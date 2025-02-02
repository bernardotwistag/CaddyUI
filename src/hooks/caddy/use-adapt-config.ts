import { useMutation } from '@tanstack/react-query';
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';
import { CaddyConfig } from '@/lib/caddy/types';

const runAdaptConfig = async (
  config: CaddyConfig,
  caddyClient: ReturnType<typeof useCaddyClient>
) => {
  return await caddyClient.adaptConfig(config);
};

export const useAdaptConfig = () => {
  const caddyClient = useCaddyClient();

  return useMutation({
    mutationFn: (config: CaddyConfig) => runAdaptConfig(config, caddyClient),
  });
}; 