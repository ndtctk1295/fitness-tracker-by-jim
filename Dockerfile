# Dockerfile

# 1. Base Image (Dependencies)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
# Copy the production environment file for build time
COPY .env.production ./.env.production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production/Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the standalone output from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy all utility scripts (for manual use at runtime)
COPY --from=builder /app/scripts ./scripts

# You'll need to add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]