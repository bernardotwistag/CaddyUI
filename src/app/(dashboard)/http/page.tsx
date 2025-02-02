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

type HandlerType = keyof typeof handlerTypes
  
interface ServerCardData {
  name: string;
  type: HandlerType;
  origin?: string;
  config: ServerFormData['reverseProxyConfig'];
}

interface FileServerHandler {
  handler: 'file_server';
  root?: string;
}

export default function HTTPServersPage() {
  const { data: config, isLoading } = useQueryConfig();

  // Extract srv1 routes from config
  const srv1Routes = config?.apps?.http?.servers?.srv1?.routes || [];
  
  // Transform routes data for cards
  const serverCards: ServerCardData[] = srv1Routes.map((route) => {
    const host = route.match?.[0]?.host?.[0] || 'default';
    
    // Extract handler and upstream info from the subroute structure
    const subroute = route.handle?.[0];
    const innerRoute = subroute?.routes?.[0];
    const handler = innerRoute?.handle?.[0];
    let origin: string | undefined = undefined;

    if (
      subroute?.handler === "subroute" && 
      handler?.handler === "reverse_proxy" &&
      handler.upstreams
    ) {
      origin = handler.upstreams.map(upstream => upstream.dial).join(', ');
    } else if (
      handler?.handler === "file_server" && 
      (handler as FileServerHandler).root
    ) {
      origin = (handler as FileServerHandler).root;
    }

    return {
      name: host,
      type: handler?.handler as HandlerType,
      origin,
      config: handler,
    };
  }) as ServerCardData[];

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