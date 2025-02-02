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
import { ServerForm, ServerFormData } from "@/app/(dashboard)/http/components/server-form"
import { useUpdateServer } from "@/hooks/caddy/use-update-server"
import { RouteConfig } from "@/types/caddy-config"
import { cleanConfig, JsonValue } from "@/lib/utils/clean-config"
import { prepareHeadersConfig } from "@/lib/utils/clean-form-data"

interface EditServerDialogProps {
  children: React.ReactNode;
  initialValues: ServerFormData;
}

export function EditServerDialog({ children, initialValues }: EditServerDialogProps) {
  const [open, setOpen] = useState(false)
  const updateServer = useUpdateServer()

  const handleSubmit = async (values: ServerFormData) => {
    try {
      const cleanedConfig = cleanConfig(values.reverseProxyConfig as Record<string, JsonValue>);
      
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
      };

      await updateServer.mutateAsync({
        oldHost: initialValues.name,
        route
      });
      toast.success("Server updated successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to update server");
    }
  }

  const preparedData = prepareHeadersConfig(initialValues)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit HTTP Server</DialogTitle>
          <DialogDescription>
            Update your HTTP server configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <ServerForm
            defaultValues={preparedData}
            onSubmit={handleSubmit}
            submitText="Update Server"
            isSubmitting={updateServer.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 