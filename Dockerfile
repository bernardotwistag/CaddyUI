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
ENV CADDY_ADMIN_URL=http://54.216.186.77:2019

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone/. ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]