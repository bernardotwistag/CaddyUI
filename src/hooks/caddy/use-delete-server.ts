import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RouteConfig } from "@/types/caddy-config";
import { QUERY_KEYS } from "@/lib/constants";
import { CaddyConfig, CaddyRoute } from "@/lib/caddy/types";

interface DeleteServerParams {
  host: string;
}

const runDeleteServer = async ({ host }: DeleteServerParams) => {
  // Get current config
  const response = await fetch("/api/caddy-proxy/config", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get current configuration");
  }

  const currentConfig = await response.json();
  const srv1 = currentConfig?.apps?.http?.servers?.srv1;

  if (!srv1) {
    throw new Error("Server srv1 not found");
  }

  // Find the route index with the matching host
  const routeIndex = srv1.routes.findIndex(
    (route: RouteConfig) => route.match?.[0]?.host?.[0] === host
  );

  if (routeIndex === -1) {
    throw new Error("Route not found");
  }

  // Remove the route
  srv1.routes.splice(routeIndex, 1);

  // Update the configuration
  const updateResponse = await fetch(
    "/api/caddy-proxy/config/apps/http/servers/srv1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(srv1),
    }
  );

  if (!updateResponse.ok) {
    throw new Error("Failed to update server configuration");
  }

  return updateResponse.json();
};

export const useDeleteServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runDeleteServer,
    onMutate: async ({ host }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["config"] });

      // Snapshot the previous value
      const previousConfig = queryClient.getQueryData(["config"]);

      // Optimistically update the config
      queryClient.setQueryData(["config"], (old: CaddyConfig) => {
        if (!old?.apps?.http?.servers?.srv1?.routes) return old;
        
        return {
          ...old,
          apps: {
            ...old.apps,
            http: {
              ...old.apps.http,
              servers: {
                ...old.apps.http.servers,
                srv1: {
                  ...old.apps.http.servers.srv1,
                  routes: old.apps.http.servers.srv1.routes.filter(
                    (route: CaddyRoute) => route.match?.[0]?.host?.[0] !== host
                  ),
                },
              },
            },
          },
        };
      });

      return { previousConfig };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousConfig) {
        queryClient.setQueryData(["config"], context.previousConfig);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our optimistic update matches the server state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CADDY.CONFIG  });
    },
  });
}; 