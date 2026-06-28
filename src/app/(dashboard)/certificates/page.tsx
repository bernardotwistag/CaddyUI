"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryConfig } from "@/hooks/caddy/use-query-config";
import { useQueryCAInfo } from "@/hooks/caddy/use-query-ca-info";
import { parseAllRoutes } from "@/lib/caddy/parse-route";
import type { CaddyTlsIssuer } from "@/lib/caddy/types";
import { ShieldCheck, Globe, Building2, Download, Lock } from "lucide-react";

const ISSUER_LABELS: Record<string, string> = {
  acme: "ACME",
  zerossl: "ZeroSSL",
  internal: "Internal (self-signed)",
};

function issuerLabel(issuer: CaddyTlsIssuer): string {
  const base = issuer.module ? ISSUER_LABELS[issuer.module] ?? issuer.module : "ACME (default)";
  return issuer.ca ? `${base} — ${issuer.ca}` : base;
}

export default function CertificatesPage() {
  const { data: config, isLoading, error } = useQueryConfig();
  const { data: caInfo, isLoading: caLoading } = useQueryCAInfo("local");

  // Hostnames Caddy manages certificates for (automatic HTTPS).
  const domains = Array.from(
    new Set(
      parseAllRoutes(config)
        .map((r) => r.host)
        .filter((h) => h && h !== "default")
    )
  ).sort();

  const policies = config?.apps?.tls?.automation?.policies ?? [];
  const issuers = policies.flatMap((p) => p.issuers ?? []);
  const manualCerts = config?.apps?.tls?.certificates?.load_files ?? [];

  const downloadRoot = () => {
    if (!caInfo?.root_certificate) return;
    const blob = new Blob([caInfo.root_certificate], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caddy-local-root.crt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            TLS and automatic HTTPS managed by Caddy.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Error loading configuration: {error.message}
          </div>
        ) : isLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <>
            {/* Automatic HTTPS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Automatic HTTPS
                </CardTitle>
                <CardDescription>
                  Caddy automatically obtains and renews certificates for these domains.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {domains.length ? (
                  <div className="flex flex-wrap gap-2">
                    {domains.map((d) => (
                      <Badge key={d} variant="secondary" className="gap-1 font-mono">
                        <Globe className="h-3 w-3" />
                        {d}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No host-matched domains found in the configuration.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Issuers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Certificate Issuers
                </CardTitle>
                <CardDescription>
                  Certificate authorities configured in the TLS automation policies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {issuers.length ? (
                  <ul className="space-y-2">
                    {issuers.map((issuer, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span>{issuerLabel(issuer)}</span>
                        {issuer.email && (
                          <span className="text-muted-foreground">({issuer.email})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No explicit issuers configured — Caddy uses its defaults
                    (Let&apos;s Encrypt, then ZeroSSL) for public domains.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Manually loaded certs */}
            {manualCerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Manually Loaded Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm font-mono">
                    {manualCerts.map((c, i) => (
                      <li key={i} className="text-muted-foreground">{c.certificate}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Local CA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Local Certificate Authority
                </CardTitle>
                <CardDescription>
                  Caddy&apos;s internal CA, used for internal/self-signed certificates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {caLoading ? (
                  <Skeleton className="h-16" />
                ) : caInfo ? (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div>{caInfo.name || caInfo.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Root CN</div>
                        <div className="font-mono">{caInfo.root_common_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Intermediate CN</div>
                        <div className="font-mono">{caInfo.intermediate_common_name}</div>
                      </div>
                    </div>
                    {caInfo.root_certificate && (
                      <Button variant="outline" size="sm" onClick={downloadRoot}>
                        <Download className="h-4 w-4 mr-2" />
                        Download root certificate
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    No internal CA available (the PKI app may not be enabled).
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
