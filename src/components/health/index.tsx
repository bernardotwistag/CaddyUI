'use client';

import { useQueryUpstreamStatus } from '@/hooks/caddy/use-query-upstream-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function HealthDashboard() {
  const { data: upstreams } = useQueryUpstreamStatus();
  
  const calculateHealthScore = (fails: number, requests: number) => {
    if (requests === 0) return 100;
    return Math.max(0, 100 - (fails / requests * 100));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {upstreams?.map((upstream) => (
        <Card key={upstream.address}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {upstream.address}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Health Score</span>
                  <span>{calculateHealthScore(upstream.fails, upstream.num_requests).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={calculateHealthScore(upstream.fails, upstream.num_requests)} 
                  className="h-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Active Requests</p>
                  <p className="font-medium">{upstream.num_requests}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Failed Requests</p>
                  <p className="font-medium">{upstream.fails}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 