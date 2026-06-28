'use client';

import { useQueryUpstreamStatus } from '@/hooks/caddy/use-query-upstream-status';
import { useQueryConfig } from '@/hooks/caddy/use-query-config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { parseAllRoutes } from '@/lib/caddy/parse-route';
import { CheckCircle2, XCircle } from 'lucide-react';

export function UpstreamCards() {
  const {
    data: upstreams,
    isLoading: isLoadingUpstreams,
    isFetching,
    dataUpdatedAt,
    error: upstreamsError,
  } = useQueryUpstreamStatus();
  const { data: config, isLoading: isLoadingConfig, error: configError } = useQueryConfig();

  const isLoading = isLoadingUpstreams || isLoadingConfig;
  const error = upstreamsError || configError;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Error loading upstreams: {error.message}
      </div>
    );
  }

  const list = Array.isArray(upstreams) ? upstreams : [];

  // Map upstream dial addresses (and bare IPs) back to the host they serve.
  const hostByAddress = new Map<string, string>();
  for (const route of parseAllRoutes(config)) {
    for (const dial of route.upstreams) {
      hostByAddress.set(dial, route.host);
      hostByAddress.set(dial.split(':')[0], route.host);
    }
  }

  const total = list.length;
  const healthy = list.filter((u) => u.fails === 0).length;
  const down = total - healthy;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
        <span className="text-muted-foreground">·</span>
        <span><strong>{total}</strong> upstreams</span>
        <span className="text-emerald-600">{healthy} healthy</span>
        {down > 0 && <span className="text-destructive">{down} down</span>}
        {dataUpdatedAt > 0 && (
          <span className="text-muted-foreground ml-auto">
            {isFetching ? 'Refreshing…' : `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`}
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="rounded-md border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          No active upstreams reported by Caddy.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...list]
            .sort((a, b) => a.address.localeCompare(b.address))
            .map((upstream) => {
              const isHealthy = upstream.fails === 0;
              const hostname =
                hostByAddress.get(upstream.address) ||
                hostByAddress.get(upstream.address.split(':')[0]) ||
                'Unknown service';
              return (
                <Card key={upstream.address}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">{hostname}</h3>
                      <Badge
                        variant={isHealthy ? 'secondary' : 'destructive'}
                        className="shrink-0 gap-1"
                      >
                        {isHealthy ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {isHealthy ? 'Healthy' : 'Down'}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground truncate">
                      {upstream.address}
                    </p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Requests</div>
                        <div className="font-medium tabular-nums">{upstream.num_requests}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Fails</div>
                        <div className={`font-medium tabular-nums ${upstream.fails > 0 ? 'text-destructive' : ''}`}>
                          {upstream.fails}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
