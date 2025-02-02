export const QUERY_KEYS = {
  CADDY: {
    CONFIG: ['caddy', 'config'],
    UPSTREAM_STATUS: ['caddy', 'upstream-status'],
    CA_INFO: (id: string) => ['caddy', 'ca-info', id],
  },
} as const; 