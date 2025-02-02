import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RouteConfig } from "@/types/caddy-config";
import { QUERY_KEYS } from "@/lib/constants";

const runCreateServer = async (route: RouteConfig) => {
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
    // Create new server config
    const serverConfig = {
      listen: [":443"],
      routes: [route],
    };

    const createResponse = await fetch(
      "/api/caddy-proxy/config/apps/http/servers/srv1",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverConfig),
      }
    );

    if (!createResponse.ok) {
      throw new Error("Failed to create server");
    }

    return createResponse.json();
  } else {
    // Add new route to existing config
    srv1.routes.push(route);

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
  }
};

export const useCreateServer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runCreateServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CADDY.CONFIG });
    },
  });
}; 