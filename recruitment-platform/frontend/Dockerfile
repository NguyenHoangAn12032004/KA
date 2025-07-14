# Development Dockerfile for Frontend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command (will be overridden by docker-compose)
CMD ["npm", "start"]
