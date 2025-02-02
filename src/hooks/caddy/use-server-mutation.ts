import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CaddyConfig } from "@/lib/caddy/types";


type MutationFn<TVariables> = (variables: TVariables) => Promise<void>;
type OptimisticUpdateFn<TVariables> = (oldData: CaddyConfig | undefined, variables: TVariables) => CaddyConfig;

export const useServerMutation = <TVariables>(
  mutationFn: MutationFn<TVariables>, 
  optimisticUpdate: OptimisticUpdateFn<TVariables>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["config"] });
      const previousConfig = queryClient.getQueryData<CaddyConfig>(["config"]);
      queryClient.setQueryData<CaddyConfig | undefined>(["config"], (old: CaddyConfig | undefined) => optimisticUpdate(old, variables));
      return { previousConfig };
    },
    onError: (err, variables, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(["config"], context.previousConfig);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};