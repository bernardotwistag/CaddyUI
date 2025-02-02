'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatusCard } from '@/components/ui/status-card';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryConfig } from '@/hooks/caddy/use-query-config';

export default function HomePage() {
  const { data: config, isLoading, error } = useQueryConfig();

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 text-red-500">
          Error loading configuration: {error.message}
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const httpStats = {
    success: 6,
    warnings: 0,
    errors: 0,
  };

  const serviceStats = {
    success: 7,
    warnings: 1,
    errors: 2,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Entrypoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config?.apps?.http?.servers && Object.entries(config.apps.http.servers).map(([key, server]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">HTTP</div>
                  <div className="text-xl font-mono">{server.listen?.[0] || 'N/A'}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard
            title="HTTP Routers"
            stats={httpStats}
            total={6}
          />
          <StatusCard
            title="Services"
            stats={serviceStats}
            total={10}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Services & Routes</h2>
          <div className="grid gap-4">
            {config?.apps?.http?.servers && Object.entries(config.apps.http.servers).map(([serverKey, server]) => (
              server.routes?.map((route, routeIndex) => (
                <Card key={`${serverKey}-${routeIndex}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          {route.match?.[0]?.host?.[0] || 'Default Host'}
                        </h3>
                        <div className="flex gap-2">
                          {route.match?.[0]?.path?.map((path, i) => (
                            <Badge key={i} variant="secondary">
                              {path}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge>
                        {route.handle?.[0]?.handler || 'unknown'}
                      </Badge>
                    </div>
                    {route.handle?.[0]?.handler === 'subroute' && route.handle[0].routes?.[0]?.handle?.[0]?.upstreams && (
                      <div className="text-sm text-muted-foreground">
                        Proxy to: {route.handle[0].routes[0].handle[0].upstreams.map(u => u.dial).join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ))}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
