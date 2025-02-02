export interface UpstreamConfig {
  dial: string;
}

export interface HandlerConfig {
  handler: string;
  upstreams?: UpstreamConfig[];
  routes?: RouteConfig[];
  root?: string;
}

export interface RouteMatchConfig {
  host?: string[];
}

export interface RouteConfig {
  match?: RouteMatchConfig[];
  handle: HandlerConfig[];
  terminal?: boolean;
}

export interface ServerConfig {
  listen: string[];
  routes: RouteConfig[];
} 