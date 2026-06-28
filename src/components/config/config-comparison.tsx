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
import { addSnapshot, useConfigHistory } from "@/lib/config-history";
import { History, RotateCcw } from "lucide-react";

export function ConfigComparison() {
  const { data: currentConfig, isLoading, dataUpdatedAt } = useQueryConfig();
  const [editedConfig, setEditedConfig] = useState<{ value: string; basedOn: number } | null>(null);
  const [caddyfileConfig, setCaddyfileConfig] = useState<string>("");
  const [isValid, setIsValid] = useState(false);
  const [mode, setMode] = useState<"json" | "caddyfile">("json");

  const updateConfig = useUpdateConfig();
  const { convertCaddyfileToJson } = useConfigConverter();
  const snapshots = useConfigHistory();

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

      const prior = currentConfigJson;
      await updateConfig.mutateAsync(configToUpdate);
      if (prior) addSnapshot(prior); // keep a restore point of what was running
      setEditedConfig(null);
      toast.success("Configuration updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update configuration: ${message}`);
    }
  };

  const handleRestore = async (snapshotConfig: string) => {
    try {
      const prior = currentConfigJson;
      await updateConfig.mutateAsync(JSON.parse(snapshotConfig));
      if (prior) addSnapshot(prior);
      setEditedConfig(null);
      toast.success("Configuration restored");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to restore configuration: ${message}`);
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

      {snapshots.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            History
            <span className="text-xs font-normal text-muted-foreground">
              (restore points saved before each change)
            </span>
          </h3>
          <ul className="divide-y">
            {snapshots.map((snap) => (
              <li key={snap.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  {new Date(snap.timestamp).toLocaleString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateConfig.isPending}
                  onClick={() => handleRestore(snap.config)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
