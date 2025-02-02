"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { ReverseProxyFormData } from "./reverse-proxy-form"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface UpstreamsConfigProps {
  form: UseFormReturn<ReverseProxyFormData>
}

export function UpstreamsConfig({ form }: UpstreamsConfigProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "upstreams"
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4">
            <FormField
              control={form.control}
              name={`upstreams.${index}.dial`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="127.0.0.1:3000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`upstreams.${index}.max_requests`}
              render={({ field }) => (
                <FormItem className="w-36">
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Max Requests"
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ dial: "", max_requests: undefined })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Upstream
      </Button>
    </div>
  )
} 