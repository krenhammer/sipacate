#!/bin/bash

# Check if the Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed. Please install it first."
    echo "Installation instructions: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Ensure the user is logged in to Stripe
echo "🔑 Checking Stripe login status..."
if ! stripe whoami &> /dev/null; then
    echo "You are not logged in to Stripe. Please login first."
    stripe login
fi

# Get the current port from the .env file or use the default port
PORT=$(grep "PORT=" .env 2>/dev/null | cut -d '=' -f2)
PORT=${PORT:-3000}

echo "🚀 Starting Stripe webhook listener..."
echo "Forwarding events to http://localhost:${PORT}/api/auth/stripe/webhook"

# Start listening for webhook events
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to http://localhost:${PORT}/api/auth/stripe/webhook

# Note: This will print your webhook signing secret which you should add to your .env file
# as STRIPE_WEBHOOK_SECRET 