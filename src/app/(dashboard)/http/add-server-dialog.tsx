"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import { ServerForm, ServerFormData } from "./components/server-form"
import { useCreateServer } from "@/hooks/caddy/use-create-server"
import { RouteConfig } from "@/types/caddy-config"
import { cleanConfig } from "@/lib/utils/clean-config"

export function AddServerDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const createServer = useCreateServer()

  const handleSubmit = async (values: ServerFormData) => {
    try {
      const cleanedConfig = cleanConfig(values.reverseProxyConfig);
      
      const route: RouteConfig = {
        handle: [
          {
            handler: "subroute",
            routes: [
              {
                handle: [
                  {
                    handler: values.type,
                    ...cleanedConfig
                  }
                ]
              }
            ]
          }
        ],
        match: [
          {
            host: [values.name]
          }
        ],
        terminal: true
      }

      await createServer.mutateAsync(route)
      toast.success("Server added successfully")
      setOpen(false)
    } catch (error) {
      toast.error(`Failed to add server ${error}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New HTTP Server</DialogTitle>
          <DialogDescription>
            Configure a new HTTP server with origin or reverse proxy settings.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <ServerForm
            defaultValues={{
              name: "",
              type: "reverse_proxy",
              reverseProxyConfig: {
                handler: "reverse_proxy",
                upstreams: [{
                  dial: ""
                }]
              }
            }}
            onSubmit={handleSubmit}
            submitText="Add Server"
            isSubmitting={createServer.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 