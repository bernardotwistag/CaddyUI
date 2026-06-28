import type { CaddyConfig, CaddyRoute, CaddyHandler } from "@/lib/caddy/types";

export interface ParsedRoute {
  host: string;
  handler: string;
  upstreams: string[];
  handlerConfig?: CaddyHandler;
}

/**
 * Walk a route's handlers, descending through `subroute` wrappers, and return
 * the first concrete handler (e.g. reverse_proxy, file_server).
 */
function findHandler(handles: CaddyHandler[] | undefined): CaddyHandler | undefined {
  for (const h of handles ?? []) {
    if (h.handler === "subroute") {
      for (const r of h.routes ?? []) {
        const inner = findHandler(r.handle);
        if (inner) return inner;
      }
    } else if (h.handler) {
      return h;
    }
  }
  return undefined;
}

export function parseRoute(route: CaddyRoute): ParsedRoute {
  const host = route.match?.[0]?.host?.[0] || "default";
  const handler = findHandler(route.handle);

  let upstreams: string[] = [];
  if (handler?.handler === "reverse_proxy" && handler.upstreams) {
    upstreams = handler.upstreams.map((u) => u.dial).filter(Boolean);
  }

  return {
    host,
    handler: handler?.handler ?? "unknown",
    upstreams,
    handlerConfig: handler,
  };
}

/** Parse routes across ALL http servers (not just `srv1`). */
export function parseAllRoutes(config: CaddyConfig | undefined): ParsedRoute[] {
  const servers = config?.apps?.http?.servers ?? {};
  const result: ParsedRoute[] = [];
  for (const key of Object.keys(servers)) {
    for (const route of servers[key]?.routes ?? []) {
      result.push(parseRoute(route));
    }
  }
  return result;
}

/** Distinct listen addresses across all servers. */
export function listEntrypoints(config: CaddyConfig | undefined): string[] {
  const servers = config?.apps?.http?.servers ?? {};
  const set = new Set<string>();
  for (const key of Object.keys(servers)) {
    for (const listen of servers[key]?.listen ?? []) set.add(listen);
  }
  return Array.from(set);
}
