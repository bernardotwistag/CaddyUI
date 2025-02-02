import { UpstreamCards } from '@/components/upstreams/upstream-cards';

export default function DashboardPage() {
  return (
    <div className="container space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Caddy reverse proxy configuration
        </p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Upstream Servers</h2>
        <UpstreamCards />
      </div>
    </div>
  );
}