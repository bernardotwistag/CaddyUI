"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useVersionCheck } from "@/hooks/version/use-version-check";
import {
  ArrowUpCircle,
  CheckCircle2,
  Copy,
  Check,
  Rocket,
  Container,
  Terminal,
  RefreshCw,
} from "lucide-react";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently ignore.
    }
  };

  return (
    <div className="relative group">
      <pre className="bg-muted rounded-md p-4 pr-12 overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        title="Copy"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function HelpPage() {
  const { data, isLoading, isFetching, refetch } = useVersionCheck();

  const updateAvailable = data?.updateAvailable ?? false;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Help &amp; Updates</h1>
          <p className="text-muted-foreground mt-1">
            How to keep your Caddy UI deployment up to date.
          </p>
        </div>

        {/* Version status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {updateAvailable ? (
                <ArrowUpCircle className="h-5 w-5 text-green-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              Version
            </CardTitle>
            <CardDescription>
              Update status is checked against the GitHub repository.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-28">Installed</span>
              <Badge variant="secondary" className="font-mono">
                v{data?.current ?? "…"}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-28">Latest</span>
              {isLoading ? (
                <span className="text-sm text-muted-foreground">Checking…</span>
              ) : data?.latest ? (
                <Badge variant={updateAvailable ? "default" : "secondary"} className="font-mono">
                  v{data.latest}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {data?.error ?? "Unable to check"}
                </span>
              )}
            </div>

            {updateAvailable && (
              <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
                A new version is available. Follow the redeploy steps below to update.
              </div>
            )}
            {!updateAvailable && data?.latest && (
              <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                You&apos;re running the latest version. 🎉
              </div>
            )}

            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "Checking…" : "Check for updates"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Coolify */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Update with Coolify
            </CardTitle>
            <CardDescription>
              If you deployed through Coolify (Docker image), this is the recommended path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Open your Caddy UI application in the Coolify dashboard.</li>
              <li>
                Click <strong>Redeploy</strong>. Coolify pulls the latest{" "}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  nebulatrader/caddy-ui:latest
                </code>{" "}
                image and restarts the container.
              </li>
              <li>
                Optional: enable a deploy webhook so a push to <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">main</code> redeploys automatically.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Docker Compose */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Container className="h-5 w-5" />
              Update with Docker Compose
            </CardTitle>
            <CardDescription>Pull the new image and recreate the container.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock
              code={`docker compose pull
docker compose up -d`}
            />
          </CardContent>
        </Card>

        {/* Docker CLI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Update with Docker CLI
            </CardTitle>
            <CardDescription>
              Pull the latest image, stop the old container, and start a fresh one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock
              code={`docker pull nebulatrader/caddy-ui:latest
docker stop caddy-ui && docker rm caddy-ui
docker run -d \\
  --name caddy-ui \\
  -p 3000:3000 \\
  -e CADDY_ADMIN_URL=http://your-caddy-host:2019 \\
  nebulatrader/caddy-ui:latest`}
            />
            <p className="text-xs text-muted-foreground">
              Set <code className="font-mono">CADDY_ADMIN_URL</code> to your Caddy admin API endpoint.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <p className="text-xs text-muted-foreground">
          Images are published to Docker Hub automatically on every push to{" "}
          <code className="font-mono">main</code> via GitHub Actions.
        </p>
      </div>
    </DashboardLayout>
  );
}
