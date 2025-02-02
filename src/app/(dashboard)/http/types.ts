export type ServerStatus = "active" | "inactive"

export type ServerType = "origin" | "reverse-proxy"

export interface ServerCardProps {
  name: string
  type: ServerType
  origin: string
  status: ServerStatus
} 