import { NextResponse } from "next/server";
import { isNewerVersion } from "@/lib/utils/version";

const CURRENT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
const REPO = process.env.GITHUB_REPO || "bernardotwistag/CaddyUI";
const BRANCH = process.env.GITHUB_BRANCH || "main";

// Cache the upstream check for an hour so we don't hammer GitHub.
export const revalidate = 3600;

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
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/package.json`,
      { next: { revalidate: 3600 } }
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
