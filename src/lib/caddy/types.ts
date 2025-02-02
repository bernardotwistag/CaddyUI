export interface CaddyConfig {
  admin?: {
    listen: string;
  };
  apps?: {
    http?: {
      servers?: Record<string, CaddyServerConfig>;
    };
  };
}

export interface CaddyServerConfig {
  listen?: string[];
  routes?: CaddyRoute[];
}

export interface CaddyRoute {
  match?: CaddyMatch[];
  handle?: CaddyHandler[];
  group?: string;
  terminal?: boolean;
}

export interface CaddyMatch {
  host?: string[];
  path?: string[];
  method?: string[];
}

export interface CaddyHandler {
  handler: string;
  routes?: CaddyRoute[];
  upstreams?: CaddyUpstream[];
  response?: {
    set: Record<string, string[]>;
  };
  status_code?: number;
}

export interface CaddyUpstream {
  dial: string;
}

export interface UpstreamStatus {
  address: string;
  num_requests: number;
  fails: number;
}

export interface CaddyCAInfo {
  id: string;
  name: string;
  root_common_name: string;
  intermediate_common_name: string;
  root_certificate: string;
  intermediate_certificate: string;
} 