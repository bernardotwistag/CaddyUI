"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { ReverseProxyFormData } from "./reverse-proxy-form"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { X, Plus } from "lucide-react"
import { HeaderFieldPath } from "./types"

interface HeadersConfigProps {
  form: UseFormReturn<ReverseProxyFormData>
}

interface HeaderOperationProps {
  title: string
  name: "add" | "set" | "delete"
  type: "request" | "response"
  form: UseFormReturn<ReverseProxyFormData>
}

function HeaderOperation({ title, name, type, form }: HeaderOperationProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error i have no idea why this is not working
    name: `headers.${type}.${name}` as HeaderFieldPath
  })

  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>{title}</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ header: "", values: [] })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Header
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>{title}</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ header: "", values: [] })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Header
        </Button>
      </div>
      
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <FormField
              control={form.control}
              // @ts-expect-error Dynamic path construction
              name={`headers.${type}.${name}.${index}.header` as const}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Header Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="X-Custom-Header" 
                      {...field} 
                      value={String(field.value || '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="h-10 w-10 mt-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            // @ts-expect-error Dynamic path construction
            name={`headers.${type}.${name}.${index}.values` as const}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Values</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter comma-separated values"
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    onChange={(e) => field.onChange(e.target.value.split(',').map(v => v.trim()))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  )
}

function HeaderReplace({ name, form }: { name: "request" | "response", form: UseFormReturn<ReverseProxyFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error Dynamic path construction
    name: `headers.${name}.replace` as const
  })

  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>Replace Headers</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ 
              search: "",
              search_regexp: "",
              replace: ""
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Replace Rule
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Replace Headers</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ 
            search: "",
            search_regexp: "",
            replace: ""
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Replace Rule
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`headers.${name}.replace.${index}.search`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input placeholder="Text to search" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`headers.${name}.replace.${index}.search_regexp`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Regexp</FormLabel>
                  <FormControl>
                    <Input placeholder="Regular expression" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`headers.${name}.replace.${index}.replace`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replace With</FormLabel>
                <FormControl>
                  <Input placeholder="Replacement text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

export function HeadersConfig({ form }: HeadersConfigProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="request" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request">Request Headers</TabsTrigger>
            <TabsTrigger value="response">Response Headers</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-6">
            <HeaderOperation 
              title="Add Headers" 
              name="add"
              type="request" 
              form={form} 
            />
            <HeaderOperation 
              title="Set Headers" 
              name="set"
              type="request" 
              form={form} 
            />
            <HeaderOperation 
              title="Delete Headers" 
              name="delete"
              type="request" 
              form={form} 
            />
            <HeaderReplace name="request" form={form} />
          </TabsContent>

          <TabsContent value="response" className="space-y-6">
            <HeaderOperation 
              title="Add Headers" 
              name="add"
              type="response" 
              form={form} 
            />
            <HeaderOperation 
              title="Set Headers" 
              name="set"
              type="response" 
              form={form} 
            />
            <HeaderOperation 
              title="Delete Headers" 
              name="delete"
              type="response" 
              form={form} 
            />
            <HeaderReplace name="response" form={form} />

            <FormField
              control={form.control}
              name="headers.response.deferred"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Deferred Response</FormLabel>
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
        </Tabs>
      </CardContent>
    </Card>
  )
} 