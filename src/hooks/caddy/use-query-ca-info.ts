import { useQuery } from '@tanstack/react-query';
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';
import { QUERY_KEYS } from '@/lib/constants';
import { CaddyCAInfo } from '@/lib/caddy/types';

const runQueryCAInfo = async (id: string, caddyClient: ReturnType<typeof useCaddyClient>) => {
  return await caddyClient.getCAInfo(id);
};

export const useQueryCAInfo = (id: string = 'local') => {
  const caddyClient = useCaddyClient();
  
  return useQuery<CaddyCAInfo>({
    queryKey: QUERY_KEYS.CADDY.CA_INFO(id),
    queryFn: () => runQueryCAInfo(id, caddyClient),
  });
}; 