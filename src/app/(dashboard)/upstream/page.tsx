import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UpstreamCards } from '@/components/upstreams/upstream-cards';

export default function UpstreamPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upstreams</h1>
          <p className="text-muted-foreground">
            Live health and request metrics for your reverse-proxy upstreams.
          </p>
        </div>
        <UpstreamCards />
      </div>
    </DashboardLayout>
  );
}
