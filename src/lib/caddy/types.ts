export interface CaddyConfig {
  admin?: {
    listen: string;
  };
  apps?: {
    http?: {
      servers?: Record<string, CaddyServerConfig>;
    };
    tls?: CaddyTlsApp;
  };
}

export interface CaddyTlsApp {
  certificates?: {
    load_files?: CaddyLoadedCert[];
  };
  automation?: {
    policies?: CaddyTlsPolicy[];
  };
}

export interface CaddyLoadedCert {
  certificate: string;
  key?: string;
  tags?: string[];
}

export interface CaddyTlsPolicy {
  subjects?: string[];
  issuers?: CaddyTlsIssuer[];
}

export interface CaddyTlsIssuer {
  module?: string;
  ca?: string;
  email?: string;
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