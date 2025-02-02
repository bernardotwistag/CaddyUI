export interface ReverseProxyConfig {
  handler: 'reverse_proxy'
  transport?: {
    http?: {
      protocol?: string
      resolver?: {
        addresses?: string[]
      }
      tls?: {
        ca?: Record<string, unknown>
        root_ca_pool?: string[]
        root_ca_pem_files?: string[]
        client_certificate_file?: string
        client_certificate_key_file?: string
        client_certificate_automate?: string
        insecure_skip_verify?: boolean
        handshake_timeout?: number
        server_name?: string
        renegotiation?: string
        except_ports?: string[]
        curves?: string[]
      }
      keep_alive?: {
        enabled?: boolean
        probe_interval?: number
        max_idle_conns?: number
        max_idle_conns_per_host?: number
        idle_timeout?: number
      }
      compression?: boolean
      max_conns_per_host?: number
      proxy_protocol?: string
      forward_proxy_url?: string
      dial_timeout?: number
      dial_fallback_delay?: number
      response_header_timeout?: number
      expect_continue_timeout?: number
      max_response_header_size?: number
      write_buffer_size?: number
      read_buffer_size?: number
      read_timeout?: number
      write_timeout?: number
      versions?: string[]
      local_address?: string
    }
  },
  load_balancing?: {
    selection_policy?: {
      policy?: 'client_ip_hash' | 'cookie' | 'first' | 'header' | 'ip_hash' | 'least_conn' | 'query' | 'random' | 'random_choose' | 'round_robin' | 'uri_hash' | 'weighted_round_robin'
    }
    retries?: number
    try_duration?: number
    try_interval?: number
  }
  health_checks?: {
    active?: {
      path?: string
      port?: number
      interval?: number
      timeout?: number
      passes?: number
      fails?: number
      expect_status?: number
    }
    passive?: {
      fail_duration?: number
      max_fails?: number
      unhealthy_request_count?: number
      unhealthy_status?: number[]
    }
  }
  upstreams: Array<{
    dial: string
    max_requests?: number
  }>
  headers?: {
    request?: {
      add?: Record<string, string[]>
      set?: Record<string, string[]>
      delete?: string[]
    }
    response?: {
      add?: Record<string, string[]>
      set?: Record<string, string[]>
      delete?: string[]
    }
  }
}

export type HeaderFieldPath = 
  | `headers.${string}.${string}`  // Base paths
  | `headers.${string}.${string}.${number}`  // Array paths
  | `headers.${string}.${string}.${number}.header`  // Header field paths
  | `headers.${string}.${string}.${number}.values`  // Values field paths
  | `headers.${string}.replace.${number}.search`  // Replace paths
  | `headers.${string}.replace.${number}.search_regexp`
  | `headers.${string}.replace.${number}.replace`;

export type ReverseProxyFormPath = 
  | "upstreams"
  | "handle_response"
  | "load_balancing.retry_match"
  | HeaderFieldPath
  | `handle_response.${number}.routes.${number}.handle`; 