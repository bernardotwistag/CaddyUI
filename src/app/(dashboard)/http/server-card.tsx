"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { EditServerDialog } from "./edit-server-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDeleteServer } from "@/hooks/caddy/use-delete-server"
import { toast } from "sonner"
import { useState } from "react"
import { handlerTypes } from "./components/server-form"
import type { ServerFormData } from "./components/server-form"

type HandlerType = keyof typeof handlerTypes

interface ServerCardProps {
  name: string
  type: HandlerType
  origin: string
  config: ServerFormData['reverseProxyConfig']
}

export function ServerCard({ name, type, origin, config }: ServerCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteServer = useDeleteServer()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteServer.mutateAsync({ host: name })
      toast.success("Server deleted successfully")
    } catch (error) {
      toast.error(`Failed to delete server ${error}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Format origins for display
  const originsList = origin.split(',').map(o => o.trim())
  const displayOrigins = originsList.length > 2 
    ? `${originsList.slice(0, 2).join(', ')}...`
    : origin

  return (
    <div className="group relative h-[150px]">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the server configuration for {name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditServerDialog
        initialValues={{
          name,
          type,
          reverseProxyConfig: config
        }}
      >
        <Card className="cursor-pointer hover:border-primary hover:bg-muted/50 h-full">
          <CardHeader>
            <div>
              <h3 className="font-semibold">{name}</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type: {handlerTypes[type]}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground truncate">
                    Origins: {displayOrigins}
                  </p>
                </TooltipTrigger>
                {originsList.length > 2 && (
                  <TooltipContent>
                    <p>{origin}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </EditServerDialog>
    </div>
  )
} 