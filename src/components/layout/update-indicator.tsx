"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVersionCheck } from "@/hooks/version/use-version-check";

export function UpdateIndicator() {
  const { data } = useVersionCheck();

  useEffect(() => {
    if (!data?.updateAvailable || !data.latest) return;

    // Only toast once per session per version, so navigating between
    // pages (which remounts this component) doesn't re-fire it.
    const key = `caddy-ui:update-toast:${data.latest}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    toast.info(`Update available — v${data.latest}`, {
      description: `You're running v${data.current}. See how to update.`,
      duration: 10000,
      action: {
        label: "View",
        onClick: () => {
          window.location.href = "/help";
        },
      },
    });
  }, [data]);

  if (!data?.updateAvailable) return null;

  return (
    <Button variant="ghost" size="sm" asChild className="relative gap-1.5">
      <Link href="/help" title={`Update available: v${data.latest}`}>
        <ArrowUpCircle className="h-4 w-4 text-green-500" />
        <span className="hidden sm:inline">Update available</span>
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
      </Link>
    </Button>
  );
}
