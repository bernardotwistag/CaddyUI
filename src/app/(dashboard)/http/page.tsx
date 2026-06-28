"use client";

import { Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { AddServerDialog } from "./add-server-dialog"
import { ServerCard } from "./server-card"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useQueryConfig } from '@/hooks/caddy/use-query-config'
import { Skeleton } from "@/components/ui/skeleton"
import { ServerFormData } from "@/app/(dashboard)/http/components/server-form"
import { handlerTypes } from "@/app/(dashboard)/http/components/server-form"
import { parseAllRoutes } from "@/lib/caddy/parse-route"

type HandlerType = keyof typeof handlerTypes

interface ServerCardData {
  name: string;
  type: HandlerType;
  origin?: string;
  config: ServerFormData['reverseProxyConfig'];
}

export default function HTTPServersPage() {
  const { data: config, isLoading } = useQueryConfig();

  // Parse routes across all http servers (robust to nested subroute/group shapes).
  const serverCards: ServerCardData[] = parseAllRoutes(config).map((route) => ({
    name: route.host,
    type: route.handler as HandlerType,
    origin: route.upstreams.join(', '),
    config: route.handlerConfig as unknown as ServerFormData['reverseProxyConfig'],
  }));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[150px]" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HTTP Servers</h1>
          <p className="text-muted-foreground">
            Manage your HTTP servers and configurations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AddServerDialog>
            <Card className="flex h-[150px] w-full cursor-pointer items-center justify-center border-dashed hover:border-primary hover:bg-muted/50">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="h-8 w-8" />
                <p>Add New Server</p>
              </div>
            </Card>
          </AddServerDialog>
          
          {serverCards.map((server, index) => (
            <ServerCard 
              key={index}
              name={server.name}
              type={server.type}
              config={server.config}
              origin={server.origin || ''}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 