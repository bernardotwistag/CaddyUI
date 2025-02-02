"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { ReverseProxyFormData } from "./reverse-proxy-form"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

interface HealthChecksConfigProps {
  form: UseFormReturn<ReverseProxyFormData>
}

export function HealthChecksConfig({ form }: HealthChecksConfigProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Checks</TabsTrigger>
            <TabsTrigger value="passive">Passive Checks</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="health_checks.active.path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/health" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URI</FormLabel>
                    <FormControl>
                      <Input placeholder="/health" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={65535}
                        placeholder="8080"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <Input placeholder="GET" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="health_checks.active.interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval (s)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="30"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout (s)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="5"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.max_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Size (bytes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="1048576"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="health_checks.active.passes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="2"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.fails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fails</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="2"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.active.expect_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Status</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={100}
                        max={599}
                        placeholder="200"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="health_checks.active.follow_redirects"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Follow Redirects</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="passive" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="health_checks.passive.fail_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fail Duration (s)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="30"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.passive.max_fails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Fails</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="1"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="health_checks.passive.unhealthy_request_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unhealthy Request Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="health_checks.passive.unhealthy_latency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unhealthy Latency (ms)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 