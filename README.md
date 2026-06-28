# Caddy UI

A modern web dashboard for managing [Caddy](https://caddyserver.com/) reverse proxy instances through their [admin API](https://caddyserver.com/docs/api). Built with Next.js 15, React 19, and Radix UI.

## Features

- **Dashboard** — overview of HTTP entrypoints, routers, services, and route details at a glance
- **HTTP Server Management** — add, edit, and delete servers and routes with support for reverse proxy, file server, and multiple handler types
- **Configuration Editor** — view and edit the full Caddy config in JSON or Caddyfile syntax with Monaco Editor, side-by-side comparison, and import/export
- **Upstream Monitoring** — track upstream servers, request counts, and failure metrics

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (for local development)
- A running Caddy instance with the [admin API](https://caddyserver.com/docs/caddyfile/options#admin) enabled
- Docker (optional, for containerized deployment)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/bernardotwistag/CaddyUI.git
cd CaddyUI
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Edit `.env` and set `CADDY_ADMIN_URL` to your Caddy admin API address:

```env
CADDY_ADMIN_URL=http://localhost:2019
```

### 3. Install dependencies and run

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Docker

```bash
docker build -t caddy-ui .
docker run -d -p 3000:3000 -e CADDY_ADMIN_URL=http://your-caddy-host:2019 caddy-ui
```

### Docker Compose

```bash
# Edit docker-compose.yml and set CADDY_ADMIN_URL
docker compose up -d
```

### Docker Hub / GHCR

A pre-built image is available:

```bash
docker run -d -p 3000:3000 -e CADDY_ADMIN_URL=http://your-caddy-host:2019 nebulatrader/caddy-ui:latest
```

### Coolify

1. Create a new application in Coolify using **Docker Image** as the build pack
2. Set the image to `nebulatrader/caddy-ui:latest`
3. Add environment variable `CADDY_ADMIN_URL` pointing to your Caddy admin API
4. Set the port to `80` and optionally map a host port (e.g. `3080:80`)
5. Deploy

> **Note:** If your Caddy instance runs as `caddy-docker-proxy` alongside Coolify, use the Docker network hostname (e.g. `http://coolify-proxy:2019`) as the `CADDY_ADMIN_URL` — both containers must be on the same Docker network.

## Configuration

| Variable | Description | Default |
|---|---|---|
| `CADDY_ADMIN_URL` | URL of the Caddy admin API | `http://localhost:2019` |

### Enabling the Caddy Admin API

The admin API must be enabled and accessible from wherever Caddy UI is running.

**Standard Caddy** — add to your Caddyfile:

```caddyfile
{
    admin 0.0.0.0:2019
}
```

**caddy-docker-proxy** — the admin API defaults to `localhost:2019` and ignores the Caddyfile global block. Patch it at runtime:

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"listen":"tcp/0.0.0.0:2019"}' \
  http://localhost:2019/config/admin/
```

This resets on every container restart. To make it persistent, use a systemd service or startup script that re-applies the patch after each restart.

## Architecture

```
Browser → Caddy UI (:3000) → /api/caddy-proxy/* → Caddy Admin API (:2019)
```

The app includes a built-in API proxy (`/api/caddy-proxy/[...path]`) that forwards requests to the Caddy admin API with CORS handling. This avoids browser CORS issues when the Caddy API is on a different origin.

## Tech Stack

- **Next.js 15** with Turbopack
- **React 19** + Radix UI components
- **Tailwind CSS** with dark/light theme support
- **Monaco Editor** for JSON and Caddyfile editing
- **TanStack React Query** for data fetching
- **React Hook Form** + Zod for form validation
- **Lucide** icons

## Development

```bash
yarn dev        # Start dev server with Turbopack
yarn build      # Production build
yarn start      # Start production server
yarn lint       # Run ESLint
```

## License

MIT
