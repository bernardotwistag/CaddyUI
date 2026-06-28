'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryConfig } from '@/hooks/caddy/use-query-config';
import { useQueryUpstreamStatus } from '@/hooks/caddy/use-query-upstream-status';
import { parseAllRoutes, listEntrypoints } from '@/lib/caddy/parse-route';

export default function HomePage() {
  const { data: config, isLoading, error } = useQueryConfig();
  const { data: upstreams } = useQueryUpstreamStatus();

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 text-destructive">
          Error loading configuration: {error.message}
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </div>
      </DashboardLayout>
    );
  }

  const entrypoints = listEntrypoints(config);
  const routes = parseAllRoutes(config);
  const serverCount = Object.keys(config?.apps?.http?.servers ?? {}).length;
  const upstreamList = upstreams ?? [];
  const healthyUpstreams = upstreamList.filter((u) => u.fails === 0).length;

  const metrics = [
    { label: "Servers", value: String(serverCount) },
    { label: "Routes", value: String(routes.length) },
    {
      label: "Upstreams",
      value: upstreamList.length ? `${healthyUpstreams}/${upstreamList.length}` : "—",
      sub: upstreamList.length ? "healthy" : "no data",
    },
    { label: "Entrypoints", value: String(entrypoints.length) },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <Card key={m.label}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{m.label}</div>
                  <div className="text-3xl font-semibold tracking-tight">{m.value}</div>
                  {m.sub && <div className="text-xs text-muted-foreground mt-1">{m.sub}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Entrypoints */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Entrypoints</h2>
          {entrypoints.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {entrypoints.map((listen) => (
                <Card key={listen}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">HTTP</div>
                    <div className="text-xl font-mono">{listen}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No entrypoints configured.</p>
          )}
        </section>

        {/* Services & Routes */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Services &amp; Routes</h2>
          {routes.length ? (
            <div className="grid gap-4">
              {routes.map((route, i) => (
                <Card key={`${route.host}-${i}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-medium truncate">{route.host}</h3>
                        {route.upstreams.length > 0 && (
                          <p className="text-sm text-muted-foreground font-mono truncate">
                            Proxy to: {route.upstreams.join(', ')}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0">{route.handler}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No routes configured yet.</p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
