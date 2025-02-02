import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCaddyClient } from '@/lib/caddy/hooks/use-caddy-client';
import { QUERY_KEYS } from "@/lib/constants";
import type { CaddyConfig } from '@/lib/caddy/types';

const runUpdateConfig = async (
  config: CaddyConfig,
  caddyClient: ReturnType<typeof useCaddyClient>
): Promise<void> => {
  return await caddyClient.loadConfig(config);
};

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  const caddyClient = useCaddyClient();

  return useMutation({
    mutationFn: (config: CaddyConfig) => runUpdateConfig(config, caddyClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.CADDY.CONFIG 
      });
    },
  });
} 