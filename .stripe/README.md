# Stripe Fixtures

This directory contains Stripe CLI fixtures used to set up products and prices for the application's subscription plans.

## What are Stripe Fixtures?

Stripe fixtures are JSON files that define Stripe API resources in a declarative way. They allow for repeatable and consistent setup of your Stripe test environment. Using fixtures instead of script-based setup offers several advantages:

- **Declarative approach**: Define what you want, not how to create it
- **Idempotency**: Can be run multiple times without creating duplicates
- **References**: Resources can reference each other (e.g., prices can reference products)
- **Version control**: Easy to track changes to your Stripe configuration

## Available Fixtures

- `fixtures/subscription-plans.json`: Defines the subscription plans (products and prices) for the application

## How to Use

1. Make sure you have the Stripe CLI installed and authenticated:
   ```bash
   stripe login
   ```

2. Run the seed script to create all resources:
   ```bash
   bun stripe:seed
   # or directly:
   bun .stripe/stripe-seed.ts
   ```

This will:
1. Create products and prices in your Stripe account (test mode only)
2. Update your `.env` file with the new price IDs

## How It Works

The `stripe-seed.ts` script:
1. Loads the Stripe fixtures from `.stripe/fixtures/subscription-plans.json`
2. Uses the Stripe API to create products and prices
3. Captures all created resource IDs
4. Extracts the price IDs for each plan
5. Updates your `.env` file with these IDs

The script also looks for your Stripe test mode API key in:
1. Your Stripe CLI config file (~/.config/stripe/config.toml)
2. The STRIPE_SECRET_KEY environment variable

## Modifying Plans

To modify the subscription plans:

1. Edit the fixture file at `.stripe/fixtures/subscription-plans.json`
2. Run the seed script again
3. The changes will be reflected in your Stripe account

## References

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Fixtures Documentation](https://stripe.com/docs/cli/fixtures) 