"use client";

import {
  Form,
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ReverseProxyForm, ReverseProxyFormData } from "./reverse-proxy/reverse-proxy-form"
import { reverseProxySchema } from "./reverse-proxy/reverse-proxy-form"

// Define the available handler types
export const handlerTypes = {
  // acme_server: "ACME Server",
  // authentication: "Authentication",
  // copy_response: "Copy Response",
  // copy_response_headers: "Copy Response Headers",
  // encode: "Encode",
  // error: "Error",
  // file_server: "File Server",
  // headers: "Headers",
  // intercept: "Intercept",
  // invoke: "Invoke",
  // log_append: "Log Append",
  // map: "Map",
  // metrics: "Metrics",
  // push: "Push",
  // request_body: "Request Body",
  reverse_proxy: "Reverse Proxy",
  // rewrite: "Rewrite",
  // static_response: "Static Response",
  // subroute: "Subroute",
  // templates: "Templates",
  // tracing: "Tracing",
  // vars: "Variables"
  origin: "Origin"
} as const

// Create a type from the keys of handlerTypes
type HandlerType = keyof typeof handlerTypes

export const serverFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(Object.keys(handlerTypes) as [HandlerType, ...HandlerType[]]),
  reverseProxyConfig: reverseProxySchema.optional()
})

export type ServerFormData = z.infer<typeof serverFormSchema>

interface ServerFormProps {
  defaultValues: ServerFormData
  onSubmit: (values: ServerFormData) => Promise<void>
  submitText: string
  isSubmitting?: boolean
}

export function ServerForm({ defaultValues, onSubmit, isSubmitting }: ServerFormProps) {
  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverFormSchema),
    defaultValues,
  })

  const handleReverseProxySubmit = async (values: ReverseProxyFormData) => {
    console.log('ServerForm handleReverseProxySubmit called')
    const payload = {
      ...form.getValues(),
      reverseProxyConfig: values
    }
    console.log('Full Payload:', JSON.stringify(payload, null, 2))
    await onSubmit(payload)
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host Name</FormLabel>
              <FormControl>
                <Input placeholder="dashboard.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handler Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select handler type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(handlerTypes).map(([value, label]) => (
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
        
        {form.watch("type") === "reverse_proxy" && (
          <ReverseProxyForm
            defaultValues={defaultValues.reverseProxyConfig as ReverseProxyFormData}
            onSubmit={handleReverseProxySubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Form>
  )
} 