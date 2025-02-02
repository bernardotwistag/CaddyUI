import { useQuery } from '@tanstack/react-query';
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';
import { QUERY_KEYS } from '@/lib/constants';
import { UpstreamStatus } from '@/lib/caddy/types';

const getUpstreamStatus = async (caddyClient: ReturnType<typeof useCaddyClient>): Promise<UpstreamStatus[]> => {
  return await caddyClient.getUpstreamStatus();
};

export const useQueryUpstreamStatus = () => {
  const caddyClient = useCaddyClient();
  
  return useQuery({
    queryKey: QUERY_KEYS.CADDY.UPSTREAM_STATUS,
    queryFn: () => getUpstreamStatus(caddyClient),
  });
}; 