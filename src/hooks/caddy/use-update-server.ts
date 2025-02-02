import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RouteConfig } from "@/types/caddy-config";
import { QUERY_KEYS } from "@/lib/constants";

interface UpdateServerParams {
  oldHost: string;
  route: RouteConfig;
}

const runUpdateServer = async ({ oldHost, route }: UpdateServerParams) => {
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
    throw new Error("Server configuration not found");
  }

  // Find and replace the route with matching host
  const routeIndex = srv1.routes.findIndex(
    (r: RouteConfig) => r.match?.[0]?.host?.[0] === oldHost
  );

  if (routeIndex === -1) {
    throw new Error("Route not found");
  }

  srv1.routes[routeIndex] = route;

  const updateResponse = await fetch(
    "/api/caddy-proxy/config/apps/http/servers/srv1",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(srv1),
    }
  );

  if (!updateResponse.ok) {
    throw new Error("Failed to update server configuration");
  }

  return updateResponse.json();
};

export const useUpdateServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runUpdateServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CADDY.CONFIG });
    },
  });
}; 