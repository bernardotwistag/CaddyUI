import { NextRequest } from 'next/server';

const CADDY_ADMIN_URL = process.env.CADDY_ADMIN_URL || 'http://localhost:2019';

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

async function proxyRequest(request: NextRequest, method: string) {
  const origin = request.headers.get('origin');
  const path = request.nextUrl.pathname.replace('/api/caddy-proxy', '') || '/';

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (method !== 'GET' && method !== 'DELETE') {
      const body = await request.json();
      fetchOptions.body = JSON.stringify(body);
    }

    const url = `${CADDY_ADMIN_URL}${path}`;
    console.log(`[caddy-proxy] ${method} ${url}`);

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[caddy-proxy] ${method} ${path} -> ${response.status}: ${errorBody}`);
      return new Response(
        JSON.stringify({
          error: `Caddy API error: ${response.statusText}`,
          status: response.status,
          details: errorBody,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        }
      );
    }

    const data = await response.text();
    return new Response(data || '{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to proxy request to Caddy';
    console.error(`[caddy-proxy] ${method} ${path} failed:`, error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
