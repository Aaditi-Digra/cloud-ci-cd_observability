# --- Stage 1: Build & Dependencies ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# --- Stage 2: Production Runtime ---
FROM node:18-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies and application code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY app.js ./

# Set environment variable and switch to non-root user
ENV NODE_ENV=production
USER appuser

# Expose app port
EXPOSE 3000

# Start application
CMD ["node", "app.js"]