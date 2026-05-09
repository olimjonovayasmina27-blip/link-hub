# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency files containing type definitions
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies safely
RUN npm install
RUN npx prisma generate

# Copy source maps and build
COPY . .
RUN npx tsc

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

# Execute database structure migrations, then run the express API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
