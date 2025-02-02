import { useQuery } from '@tanstack/react-query';
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';
import { QUERY_KEYS } from '@/lib/constants';
import type { CaddyConfig } from '@/lib/caddy/types';

const getConfig = async (caddyClient: ReturnType<typeof useCaddyClient>): Promise<CaddyConfig> => {
  try {
    const config = await caddyClient.getConfig();
    return config;
  } catch (error) {
    throw error;
  }
};

export const useQueryConfig = () => {
  const caddyClient = useCaddyClient();
  
  return useQuery({
    queryKey: QUERY_KEYS.CADDY.CONFIG,
    queryFn: () => getConfig(caddyClient),
  });
}; 