"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { ReverseProxyFormData } from "./reverse-proxy-form"
import { Card, CardContent } from "@/components/ui/card"

const SELECTION_POLICIES = {
  client_ip_hash: "Client IP Hash",
  cookie: "Cookie",
  first: "First",
  header: "Header",
  ip_hash: "IP Hash",
  least_conn: "Least Connections",
  query: "Query",
  random: "Random",
  random_choose: "Random Choose",
  round_robin: "Round Robin",
  uri_hash: "URI Hash",
  weighted_round_robin: "Weighted Round Robin"
} as const

interface LoadBalancingConfigProps {
  form: UseFormReturn<ReverseProxyFormData>
}

export function LoadBalancingConfig({ form }: LoadBalancingConfigProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <FormField
          control={form.control}
          name="load_balancing.selection_policy.policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selection Policy</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a load balancing policy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SELECTION_POLICIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="load_balancing.retries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retries</FormLabel>
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
            name="load_balancing.try_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Try Duration (s)</FormLabel>
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
            name="load_balancing.try_interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Try Interval (s)</FormLabel>
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

        {/* TODO: Add retry_match configuration with matchers */}
        {/* This will be a more complex configuration that needs its own component */}
        {/* We can add a button to open a dialog for configuring matchers */}
      </CardContent>
    </Card>
  )
} 