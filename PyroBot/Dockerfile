FROM node:20-slim

# Set working directory
WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application files
COPY . .

# Create data directory for database
RUN mkdir -p /app/data

# Run the bot
CMD ["node", "index.js"]
