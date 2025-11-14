# Use Node.js LTS version
FROM node:20-alpine

# Install git and build dependencies for better-sqlite3
RUN apk add --no-cache git python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Create volume for persistent data
VOLUME ["/app/data"]

# Start the bot
CMD ["node", "index.js"]
