import { NextResponse } from "next/server";

// Always evaluated at request time — never statically cached.
export const dynamic = "force-dynamic";

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: VERSION,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
