'use client';

import { useQueryUpstreamStatus } from '@/hooks/caddy/use-query-upstream-status';
import { useQueryConfig } from '@/hooks/caddy/use-query-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Upstream {
  address: string;
  num_requests: number;
  fails: number;
}

export function UpstreamCards() {
  const { data: upstreams, isLoading: isLoadingUpstreams, error: upstreamsError } = useQueryUpstreamStatus();
  const { data: config, isLoading: isLoadingConfig, error: configError } = useQueryConfig();

  const isLoading = isLoadingUpstreams || isLoadingConfig;
  const error = upstreamsError || configError;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  if (!upstreams || !Array.isArray(upstreams) || upstreams.length === 0) {
    return <div>No upstream servers found</div>;
  }

  // Create a map of IP addresses to their hostnames
  const addressToHostMap = new Map<string, string>();
  
  const buildAddressMap = () => {
    Object.values(config?.apps?.http?.servers ?? {}).forEach(server => {
      server.routes?.forEach(route => {
        const hostname = route.match?.[0]?.host?.[0];
        if (route.handle?.[0]?.handler === 'subroute') {
          route.handle[0].routes?.[0]?.handle?.[0]?.upstreams?.forEach(upstream => {
            const dialAddress = upstream.dial.split(':')[0];
            if (hostname) {
              addressToHostMap.set(dialAddress, hostname);
            }
          });
        } else if (route.handle?.[0]?.handler === 'reverse_proxy') {
          route.handle[0].upstreams?.forEach(upstream => {
            const dialAddress = upstream.dial.split(':')[0];
            if (hostname) {
              addressToHostMap.set(dialAddress, hostname);
            }
          });
        }
      });
    });
  };

  buildAddressMap();

  // Sort upstreams by address
  const sortedUpstreams = [...upstreams].sort((a, b) => 
    a.address.localeCompare(b.address)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedUpstreams.map((upstream) => {
        const address = upstream.address.split(':')[0];
        const hostname = addressToHostMap.get(address) || 'Unknown Service';
        
        return (
          <Card key={upstream.address}>
            <CardHeader>
              <CardTitle>{hostname}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Address:</strong> {upstream.address}</p>
                <p><strong>Requests:</strong> {upstream.num_requests}</p>
                <p><strong>Fails:</strong> {upstream.fails}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 