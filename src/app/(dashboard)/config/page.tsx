import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ConfigActions } from '@/components/config/config-actions';
import { ConfigComparison } from '@/components/config/config-comparison';

export default function ConfigPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground">
            Manage your Caddy server configuration
          </p>
        </div>
        
        <ConfigActions />
        <ConfigComparison />

      </div>
    </DashboardLayout>
  );
} 