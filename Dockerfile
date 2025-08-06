# Dockerfile

# Build argument for environment
ARG ENVIRONMENT=dev

# 1. Base Image (Dependencies)
FROM node:20-alpine AS base
WORKDIR /app

    # Install dependencies based on lock file for better reproducibility
    COPY package*.json pnpm-lock.yaml ./
    RUN npm install --production --no-optional && npm cache clean --force

# 2. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev dependencies)
COPY package*.json pnpm-lock.yaml ./
RUN npm install --ignore-scripts

COPY . .

# Copy environment-specific configuration
ARG ENVIRONMENT
COPY .env.${ENVIRONMENT} ./.env.local

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV ENVIRONMENT=${ENVIRONMENT}

# Build the application
RUN npm run build

# 3. Production/Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ARG ENVIRONMENT
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV ENVIRONMENT=${ENVIRONMENT}

# Create nextjs user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
COPY --from=builder /app/public ./public

# Copy the standalone server and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy node_modules for any missing dependencies
COPY --from=base --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy environment file
COPY --from=builder --chown=nextjs:nodejs /app/.env.local ./.env.local

# Copy utility scripts
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs

# Expose the port
EXPOSE 3000

# Set hostname to accept connections from any interface
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Command to run the app
CMD ["node", "server.js"]