# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app .

# Environment variables
ENV NODE_ENV=production \
    PORT=3002 \
    MONGODB_URI=mongodb://mongo:27017/customer-service

# Expose port and health check
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3002/health || exit 1

# Run the service
USER node
CMD ["node", "server.js"]