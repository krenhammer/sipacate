#!/bin/bash

# Stripe seed script for creating products and prices using fixtures
# Run with: bash .stripe/seed.sh

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Stripe seed process...${NC}"

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
  echo -e "${RED}❌ Stripe CLI is not installed. Please install it first.${NC}"
  echo "Visit https://stripe.com/docs/stripe-cli for installation instructions."
  exit 1
fi

# Create a temporary file for the fixture output
TEMP_OUTPUT=$(mktemp)

# Run the fixtures
echo -e "${YELLOW}Creating subscription plans and prices...${NC}"
stripe fixtures .stripe/fixtures/subscription-plans.json --output json 

# Update the environment variables with the price IDs
echo -e "${YELLOW}Updating environment variables...${NC}"
bun .stripe/update-env.js "$TEMP_OUTPUT"

# Clean up
rm "$TEMP_OUTPUT"

echo -e "${GREEN}✅ Stripe seed completed successfully${NC}" 