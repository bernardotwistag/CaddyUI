import type { CaddyConfig, CaddyRoute } from '@/lib/caddy/types';

interface HeaderConfig {
  header: string;
  values: string[];
}

interface ReplaceConfig {
  search?: string;
  search_regexp?: string;
  replace: string;
}

interface HeadersReplaceMap {
  [key: string]: ReplaceConfig[];
}

interface RequireConfig {
  status_code?: number[];
  headers?: Record<string, string[]>;
}

interface CaddyRouteReverseProxyHandler {
  handler: string;
  headers?: {
    request?: {
      add?: HeaderConfig[] | Record<string, string[]>;
      set?: HeaderConfig[] | Record<string, string[]>;
      delete?: string[];
      replace?: HeadersReplaceMap;
    };
    response?: {
      add?: HeaderConfig[] | Record<string, string[]>;
      set?: HeaderConfig[] | Record<string, string[]>;
      delete?: string[];
      replace?: HeadersReplaceMap;
      require?: RequireConfig;
      deferred?: boolean;
    };
  };
  routes?: CaddyRoute[];
}

export interface CaddyServer {
  routes?: CaddyRoute[];
}

const transformHeadersFormat = (headers: HeaderConfig[]): Record<string, string[]> => {
  return headers.reduce((acc, curr) => {
    if (curr.header && curr.values) {
      acc[curr.header] = curr.values;
    }
    return acc;
  }, {} as Record<string, string[]>);
};

export const transformReverseProxyHeaders = (config: CaddyConfig): CaddyConfig => {
  const transformedConfig = JSON.parse(JSON.stringify(config));

  //TODO: this still needs improvement and further testing
  const transformRouteHeaders = (route: CaddyRoute) => {
    if (!route.handle) return;

    route.handle.forEach((handler: CaddyRouteReverseProxyHandler) => {
      if (handler.handler === 'reverse_proxy' && handler.headers) {
        // Transform request headers
        if (handler.headers.request) {
          const { add, set, delete: del, replace } = handler.headers.request;
          
          if (Array.isArray(add)) {
            handler.headers.request.add = transformHeadersFormat(add);
          }
          if (Array.isArray(set)) {
            handler.headers.request.set = transformHeadersFormat(set);
          }
          if (Array.isArray(del)) {
            handler.headers.request.delete = del;
          }
          if (replace) {
            handler.headers.request.replace = replace;
          }
        }

        // Transform response headers (same logic as request)
        if (handler.headers.response) {
          const { add, set, delete: del, replace, require } = handler.headers.response;
          
          if (Array.isArray(add)) {
            handler.headers.response.add = transformHeadersFormat(add);
          }
          if (Array.isArray(set)) {
            handler.headers.response.set = transformHeadersFormat(set);
          }
          if (Array.isArray(del)) {
            handler.headers.response.delete = del;
          }
          if (replace) {
            handler.headers.response.replace = replace;
          }
          if (require) {
            handler.headers.response.require = require;
          }
        }
      }
      
      if (handler.handler === 'subroute' && handler.routes) {
        handler.routes.forEach(transformRouteHeaders);
      }
    });
  };

  if (transformedConfig.apps?.http?.servers) {
    Object.values(transformedConfig.apps.http.servers).forEach((server: unknown) => {
      const typedServer = server as CaddyServer;
      if (typedServer.routes) {
        typedServer.routes.forEach(transformRouteHeaders);
      }
    });
  }

  return transformedConfig;
}; 