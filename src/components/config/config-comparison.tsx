"use client";

import { useState, useMemo, useCallback } from "react";
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
  const { data: currentConfig, isLoading, dataUpdatedAt } = useQueryConfig();
  const [editedConfig, setEditedConfig] = useState<{ value: string; basedOn: number } | null>(null);
  const [caddyfileConfig, setCaddyfileConfig] = useState<string>("");
  const [isValid, setIsValid] = useState(false);
  const [mode, setMode] = useState<"json" | "caddyfile">("json");

  const updateConfig = useUpdateConfig();
  const { convertCaddyfileToJson } = useConfigConverter();

  const currentConfigJson = useMemo(
    () => currentConfig ? JSON.stringify(currentConfig, null, 2) : "",
    [currentConfig]
  );

  const newConfig = editedConfig && editedConfig.basedOn === dataUpdatedAt
    ? editedConfig.value
    : currentConfigJson;

  const handleConfigChange = useCallback((value: string) => {
    setEditedConfig({ value, basedOn: dataUpdatedAt });
  }, [dataUpdatedAt]);

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
      setEditedConfig(null);
      toast.success("Configuration updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update configuration: ${message}`);
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
              value={currentConfigJson}
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
                onChange={handleConfigChange}
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
