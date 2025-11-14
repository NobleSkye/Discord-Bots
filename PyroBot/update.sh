#!/bin/bash

# PyroBot Update Script
# This script safely updates the bot from GitHub while preserving local configuration

set -e

echo "🔄 PyroBot Update Script"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    echo "Please run this script from the PyroBot directory"
    exit 1
fi

# Backup .env file if it exists
if [ -f .env ]; then
    echo -e "${BLUE}📦 Backing up .env file...${NC}"
    cp .env .env.backup
    echo -e "${GREEN}✓ .env backed up to .env.backup${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found (this is okay for first run)${NC}"
fi

# Backup database if it exists
if [ -d data ] && [ -f data/pyrobot.db ]; then
    echo -e "${BLUE}📦 Backing up database...${NC}"
    cp data/pyrobot.db data/pyrobot.db.backup
    echo -e "${GREEN}✓ Database backed up to data/pyrobot.db.backup${NC}"
fi

# Stash any local changes (except .env)
echo -e "${BLUE}📝 Stashing local changes...${NC}"
git stash push -m "Auto-stash before update $(date +%Y-%m-%d_%H:%M:%S)"

# Fetch latest changes
echo -e "${BLUE}🌐 Fetching latest changes from GitHub...${NC}"
git fetch origin

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# Pull latest changes
echo -e "${BLUE}⬇️  Pulling latest changes...${NC}"
git pull origin $CURRENT_BRANCH

# Restore .env file if it was backed up
if [ -f .env.backup ]; then
    echo -e "${BLUE}♻️  Restoring .env file...${NC}"
    mv .env.backup .env
    echo -e "${GREEN}✓ .env restored${NC}"
fi

# Check if .env.example was updated and .env exists
if [ -f .env.example ] && [ -f .env ]; then
    echo ""
    echo -e "${YELLOW}📋 Checking for new environment variables...${NC}"
    
    # Extract variable names from both files
    ENV_EXAMPLE_VARS=$(grep -v '^#' .env.example | grep '=' | cut -d '=' -f1 | sort)
    ENV_VARS=$(grep -v '^#' .env | grep '=' | cut -d '=' -f1 | sort)
    
    # Find variables in .env.example that are not in .env
    NEW_VARS=$(comm -23 <(echo "$ENV_EXAMPLE_VARS") <(echo "$ENV_VARS"))
    
    if [ -n "$NEW_VARS" ]; then
        echo -e "${YELLOW}⚠ New environment variables found in .env.example:${NC}"
        echo "$NEW_VARS"
        echo ""
        echo -e "${YELLOW}Please add these to your .env file manually.${NC}"
    else
        echo -e "${GREEN}✓ No new environment variables${NC}"
    fi
fi

# Install/update dependencies
echo ""
echo -e "${BLUE}📦 Installing/updating dependencies...${NC}"
if [ -f package.json ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies updated${NC}"
else
    echo -e "${YELLOW}⚠ No package.json found${NC}"
fi

# Show git log of changes
echo ""
echo -e "${BLUE}📜 Recent changes:${NC}"
git log --oneline -5

echo ""
echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review changes above"
echo "2. Check .env file for any new required variables"
echo "3. Restart the bot: docker-compose restart (if using Docker)"
echo "   or: npm start (if running directly)"
echo ""
echo -e "${YELLOW}💾 Backups created:${NC}"
[ -f .env ] && echo "   - .env.backup"
[ -f data/pyrobot.db.backup ] && echo "   - data/pyrobot.db.backup"
echo ""
