# Dockerfile

# 1. Base Image (Dependencies)
# Use a specific Node.js version for consistency
FROM node:20-alpine AS base
WORKDIR /app
# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# 2. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
# Copy your .env.production file here or use build-time args
# COPY .env.production ./.env.production
ENV NEXT_TELEMETRY_DISABLED 1
# Build the Next.js application
RUN npm run build

# 3. Production/Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy the standalone output from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# You'll need to add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]