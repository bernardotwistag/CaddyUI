import { ShieldAlert } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Setup required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Caddy UI is locked because no admin password is configured. Set the{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ADMIN_PASSWORD</code>{" "}
          environment variable and restart to continue.
        </p>

        <div className="mt-6 rounded-md bg-muted p-3 text-left text-xs font-mono overflow-x-auto">
          <div className="text-muted-foreground mb-1"># Docker</div>
          docker run -e ADMIN_PASSWORD=your-strong-password ... nebulatrader/caddy-ui:latest
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          In Coolify, add <code className="font-mono">ADMIN_PASSWORD</code> under the
          application&apos;s Environment Variables, then redeploy.
        </p>
      </div>
    </div>
  );
}
