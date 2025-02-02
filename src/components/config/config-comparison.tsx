"use client";

import { useState, useEffect } from "react";
import { useQueryConfig } from "@/hooks/caddy/use-query-config";
import { Button } from "@/components/ui/button";
import { useUpdateConfig } from "@/hooks/caddy/use-update-config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { JsonEditor } from "@/components/config/json-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CaddyfileEditor } from "@/components/config/caddyfile-editor";
import { useConfigConverter } from "@/hooks/caddy/use-config-converter";

export function ConfigComparison() {
  const { data: currentConfig, isLoading } = useQueryConfig();
  const [newConfig, setNewConfig] = useState<string>("");
  const [caddyfileConfig, setCaddyfileConfig] = useState<string>("");
  const [isValid, setIsValid] = useState(false);
  const [mode, setMode] = useState<"json" | "caddyfile">("json");
  
  const updateConfig = useUpdateConfig();
  const { convertCaddyfileToJson } = useConfigConverter();

  useEffect(() => {
    if (currentConfig) {
      const jsonString = JSON.stringify(currentConfig, null, 2);
      setNewConfig(jsonString);      
    }
  }, [currentConfig]);

  const handleUpdate = async () => {
    if (!isValid) {
      toast.error("Invalid configuration");
      return;
    }

    try {
      const configToUpdate = mode === "json" 
        ? JSON.parse(newConfig)
        : await convertCaddyfileToJson(caddyfileConfig);
        
      await updateConfig.mutateAsync(configToUpdate);
      toast.success("Configuration updated successfully");
    } catch (error) {
      toast.error(`Failed to update configuration: ${error}`);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Current Configuration</h3>
          <div className="mt-[48px]">
            <JsonEditor
              value={JSON.stringify(currentConfig, null, 2)}
              readOnly
              onValidityChange={() => {}}
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold mb-2">New Configuration</h3>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "json" | "caddyfile")}>
            <TabsList>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="caddyfile">Caddyfile</TabsTrigger>
            </TabsList>
            <TabsContent value="caddyfile">
              <CaddyfileEditor
                value={caddyfileConfig}
                onChange={setCaddyfileConfig}
                onValidityChange={setIsValid}
              />
            </TabsContent>
            <TabsContent value="json">
              <JsonEditor
                value={newConfig}
                onChange={setNewConfig}
                onValidityChange={setIsValid}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleUpdate} 
          disabled={!isValid || updateConfig.isPending}
        >
          Update Configuration
        </Button>
      </div>
    </div>
  );
} 