import { NextResponse } from "next/server";
import { isNewerVersion } from "@/lib/utils/version";

const CURRENT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
const REPO = process.env.GITHUB_REPO || "bernardotwistag/CaddyUI";
const BRANCH = process.env.GITHUB_BRANCH || "main";

// Run fresh on every request — the client (react-query) throttles how often
// this is actually called, so the result stays timely without a stale cache.
export const dynamic = "force-dynamic";

interface VersionInfo {
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  repo: string;
  error?: string;
}

export async function GET() {
  const base: VersionInfo = {
    current: CURRENT_VERSION,
    latest: null,
    updateAvailable: false,
    repo: REPO,
  };

  try {
    // Cache-bust GitHub's raw-file CDN edge cache in ~5 min buckets so a fresh
    // release is picked up promptly, while no-store keeps Next from caching it.
    const bucket = Math.floor(Date.now() / 300_000);
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/package.json?cb=${bucket}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error(`[version] GitHub check failed: ${res.status} ${res.statusText}`);
      return NextResponse.json({ ...base, error: `Version check failed (${res.status})` });
    }

    const pkg = (await res.json()) as { version?: string };
    const latest = pkg.version ?? null;

    return NextResponse.json({
      ...base,
      latest,
      updateAvailable: latest ? isNewerVersion(latest, CURRENT_VERSION) : false,
    });
  } catch (error) {
    console.error("[version] check error:", error);
    const message = error instanceof Error ? error.message : "Version check failed";
    return NextResponse.json({ ...base, error: message });
  }
}
