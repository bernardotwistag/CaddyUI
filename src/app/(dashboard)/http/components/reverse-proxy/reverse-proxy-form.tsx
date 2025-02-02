"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ReverseProxyConfig } from "./types"
import { UpstreamsConfig } from "./upstreams-config"
import { LoadBalancingConfig } from "./load-balancing-config"
import { HealthChecksConfig } from "./health-checks-config"
import { HeadersConfig } from "./headers-config"
import { cleanHeadersConfig } from "@/lib/utils/clean-form-data"
import { transformReverseProxyHeaders } from "./transform-utils"
import { CaddyConfig } from "@/lib/caddy/types"

// Update headers part of schema
const headerSchema = z.object({
  request: z.object({
    add: z.record(z.array(z.string())).optional(),
    set: z.record(z.array(z.string())).optional(),
    delete: z.array(z.string()).optional(),
    replace: z.record(z.array(z.object({
      search: z.string().optional(),
      search_regexp: z.string().optional(),
      replace: z.string()
    }))).optional()
  }).optional(),
  response: z.object({
    add: z.record(z.array(z.string())).optional(),
    set: z.record(z.array(z.string())).optional(),
    delete: z.array(z.string()).optional(),
    replace: z.record(z.array(z.object({
      search: z.string().optional(),
      search_regexp: z.string().optional(),
      replace: z.string()
    }))).optional(),
    require: z.object({
      status_code: z.array(z.number()).optional(),
      headers: z.record(z.array(z.string())).optional()
    }).optional(),
    deferred: z.boolean().optional()
  }).optional()
}).optional()

export const reverseProxySchema = z.object({
  handler: z.literal('reverse_proxy'),
  transport: z.object({}).optional(),
  circuit_breaker: z.object({}).optional(),
  load_balancing: z.object({
    selection_policy: z.object({
      policy: z.enum([
        'client_ip_hash',
        'cookie', 
        'first',
        'header',
        'ip_hash',
        'least_conn',
        'query',
        'random',
        'random_choose',
        'round_robin',
        'uri_hash',
        'weighted_round_robin'
      ] as const).optional()
    }).optional(),
    retries: z.number().min(0).optional(),
    try_duration: z.number().min(0).optional(),
    try_interval: z.number().min(0).optional(),
    retry_match: z.array(z.object({})).optional()
  }).optional(),
  health_checks: z.object({
    active: z.object({
      path: z.string().optional(),
      uri: z.string().optional(), 
      upstream: z.string().optional(),
      port: z.number().min(0).max(65535).optional(),
      headers: z.record(z.array(z.string())).optional(),
      method: z.string().optional(),
      body: z.string().optional(),
      follow_redirects: z.boolean().optional(),
      interval: z.number().min(0).optional(),
      timeout: z.number().min(0).optional(),
      passes: z.number().min(0).optional(),
      fails: z.number().min(0).optional(),
      max_size: z.number().min(0).optional(),
      expect_status: z.number().min(100).max(599).optional(),
      expect_body: z.string().optional()
    }).optional(),
    passive: z.object({
      fail_duration: z.number().min(0).optional(),
      max_fails: z.number().min(0).optional(),
      unhealthy_request_count: z.number().min(0).optional(),
      unhealthy_status: z.array(z.number()).optional(),
      unhealthy_latency: z.number().min(0).optional()
    }).optional()
  }).optional(),
  upstreams: z.array(z.object({
    dial: z.string().min(1, "Origin is required"),
    max_requests: z.number().optional()
  })),
  dynamic_upstreams: z.object({}).optional(),
  flush_interval: z.number().min(0).optional(),
  trusted_proxies: z.array(z.string()).optional(),
  headers: headerSchema,
  request_buffers: z.number().min(0).optional(),
  response_buffers: z.number().min(0).optional(),
  stream_timeout: z.number().min(0).optional(),
  stream_close_delay: z.number().min(0).optional(),
  rewrite: z.object({
    method: z.string().optional(),
    uri: z.string().optional(),
    strip_path_prefix: z.string().optional(),
    strip_path_suffix: z.string().optional(),
    uri_substring: z.array(z.object({
      find: z.string().optional(),
      replace: z.string().optional(),
      limit: z.number().optional()
    })).optional(),
    path_regexp: z.array(z.object({
      find: z.string().optional(),
      replace: z.string().optional()
    })).optional(),
    query: z.object({
      rename: z.array(z.object({
        key: z.string().optional(),
        val: z.string().optional()
      })).optional(),
      set: z.array(z.object({
        key: z.string().optional(),
        val: z.string().optional()
      })).optional(),
      add: z.array(z.object({
        key: z.string().optional(),
        val: z.string().optional()
      })).optional(),
      replace: z.array(z.object({
        key: z.string().optional(),
        search: z.string().optional(),
        search_regexp: z.string().optional(),
        replace: z.string().optional()
      })).optional(),
      delete: z.array(z.string()).optional()
    }).optional()
  }).optional(),
  handle_response: z.array(z.object({
    match: z.object({
      status_code: z.array(z.number()).optional(),
      headers: z.record(z.array(z.string())).optional()
    }).optional(),
    status_code: z.string().optional(),
    routes: z.array(z.object({
      group: z.string().optional(),
      match: z.array(z.object({})).optional(),
      handle: z.array(z.object({})).optional(),
      terminal: z.boolean().optional()
    })).optional()
  })).optional(),
  verbose_logs: z.boolean().optional()
}) satisfies z.ZodType<ReverseProxyConfig>

// This ensures our form data matches the ReverseProxyConfig interface
export type ReverseProxyFormData = z.infer<typeof reverseProxySchema>

interface ReverseProxyFormProps {
  defaultValues: ReverseProxyFormData
  onSubmit: (values: ReverseProxyFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ReverseProxyForm({ defaultValues, onSubmit, isSubmitting }: ReverseProxyFormProps) {
  const form = useForm<ReverseProxyFormData>({
    resolver: zodResolver(reverseProxySchema),
    defaultValues,
  })

  const handleSubmit = async (values: ReverseProxyFormData) => {
    try {
      // First clean the headers config
      const cleanedData = cleanHeadersConfig(values)
      
      // Create a minimal Caddy config structure for transformation
      const tempConfig: CaddyConfig = {
        apps: {
          http: {
            servers: {
              temp: {
                routes: [{
                  handle: [{
                    ...cleanedData
                  }]
                }]
              }
            }
          }
        }
      }

      // Transform the headers format
      const transformedConfig = transformReverseProxyHeaders(tempConfig)
      
      // Extract the transformed handler data
      const transformedData = transformedConfig.apps?.http?.servers?.temp?.routes?.[0]?.handle?.[0]
      
      if (!transformedData) {
        throw new Error('Failed to transform reverse proxy configuration')
      }

      console.log('Transformed ReverseProxy Form Values:', JSON.stringify(transformedData, null, 2))
      await onSubmit(transformedData as ReverseProxyFormData)
    } catch (error) {
      console.error('Error transforming form data:', error)
      throw error
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <Tabs defaultValue="upstreams" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upstreams">Upstreams</TabsTrigger>
            <TabsTrigger value="load-balancing">Load Balancing</TabsTrigger>
            <TabsTrigger value="health-checks">Health Checks</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upstreams">
            <UpstreamsConfig form={form} />
          </TabsContent>
          
          <TabsContent value="load-balancing">
            <LoadBalancingConfig form={form} />
          </TabsContent>
          
          <TabsContent value="health-checks">
            <HealthChecksConfig form={form} />
          </TabsContent>
          
          <TabsContent value="headers">
            <HeadersConfig form={form} />
          </TabsContent>
        </Tabs>

        <Button 
          type="button"
          className="w-full"
          disabled={isSubmitting}
          onClick={() => handleSubmit(form.getValues())}
        >
          {isSubmitting ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </Form>
  )
} 