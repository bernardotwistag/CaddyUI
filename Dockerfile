# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Enable Corepack and use correct Yarn version
RUN corepack enable && corepack prepare yarn@4.1.1 --activate

# Install dependencies first
COPY package.json yarn.lock ./
RUN yarn config set nodeLinker node-modules && \
    yarn install --frozen-lockfile

# Add missing ESLint dependencies
RUN yarn add -D eslint-plugin-react-hooks @types/eslint

# Copy source code
COPY . .

# Build with standalone output
RUN yarn build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone/. ./

# Expose the port the app runs on
EXPOSE 3000

# Liveness check — hits /api/health on whatever PORT the server listens on
# (Coolify sets PORT=80, docker-compose defaults to 3000).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const p=process.env.PORT||3000;fetch('http://127.0.0.1:'+p+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start the application
CMD ["node", "server.js"]