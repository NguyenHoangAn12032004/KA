# Development Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Development command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]
