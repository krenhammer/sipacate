#!/usr/bin/env bun

// Stripe seed script for creating products and prices using fixtures
// Run with: bun .stripe/stripe-seed.ts

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { homedir } from 'os';

// Check for --help flag
if (process.argv.includes('--help')) {
  console.log(`
Stripe Seed Script - Creates products and prices in Stripe using fixture data

Usage:
  bun .stripe/stripe-seed.ts [options]

Options:
  --help     Show this help message

Description:
  This script creates subscription products and prices in Stripe's test mode
  using the fixture data from .stripe/fixtures/subscription-plans.json.
  It then updates the .env file with the created price IDs.

  The script requires a valid Stripe test mode API key (sk_test_*) from either:
  1. Stripe CLI config (in ~/.config/stripe/config.toml)
  2. STRIPE_SECRET_KEY environment variable
  `);
  process.exit(0);
}

// Load environment variables
dotenv.config();

interface StripeFixture {
  name: string;
  path: string;
  method: string;
  params: Record<string, any>;
  resource?: {
    id: string;
    [key: string]: any;
  };
}

interface FixtureOutput {
  fixtures: StripeFixture[];
  [key: string]: any;
}

// Helper to load Stripe API key from user's Stripe CLI config (test mode only)
function loadStripeApiKey(): string {
  try {
    const stripeConfigPath = path.join(homedir(), '.config', 'stripe', 'config.toml');
    
    if (fs.existsSync(stripeConfigPath)) {
      const configContent = fs.readFileSync(stripeConfigPath, 'utf8');
      
      // Look for test mode API key specifically
      const testApiKeyMatch = configContent.match(/test_mode_api_key\s*=\s*["']([^"']+)["']/);
      if (testApiKeyMatch && testApiKeyMatch[1]) {
        const apiKey = testApiKeyMatch[1];
        // Verify it's a test key (starts with sk_test_)
        if (apiKey.startsWith('sk_test_')) {
          return apiKey;
        }
      }
      
      // Alternative format might be used
      const apiKeyMatch = configContent.match(/api_key\s*=\s*["']([^"']+)["']/);
      if (apiKeyMatch && apiKeyMatch[1]) {
        const apiKey = apiKeyMatch[1];
        // Only use if it's a test key
        if (apiKey.startsWith('sk_test_')) {
          return apiKey;
        }
      }
    }
  } catch (error) {
    console.error('Error reading Stripe CLI config:', error);
  }
  
  // Fallback to environment variable, but only if it's a test key
  const envApiKey = process.env.STRIPE_SECRET_KEY;
  if (envApiKey && envApiKey.startsWith('sk_test_')) {
    return envApiKey;
  }
  
  throw new Error('Could not find a valid Stripe test mode API key. Make sure you have a test mode key in your Stripe CLI config or STRIPE_SECRET_KEY environment variable');
}

// Load and process fixture data
async function processFixtures(): Promise<FixtureOutput> {
  try {
    // Read the fixture file
    const fixturePath = path.resolve(process.cwd(), '.stripe/fixtures/subscription-plans.json');
    const fixtureContent = fs.readFileSync(fixturePath, 'utf8');
    const fixtureData = JSON.parse(fixtureContent);
    
    // Get Stripe API key
    const apiKey = loadStripeApiKey();
    const stripe = new Stripe(apiKey);
    
    console.log('🚀 Starting Stripe seed process in test mode...');
    
    // Process each fixture in sequence
    const fixtures = [...fixtureData.fixtures];
    const resourceMap: Record<string, any> = {};
    
    for (const fixture of fixtures) {
      console.log(`Processing fixture: ${fixture.name}`);
      
      // Replace any template variables in the params
      const processedParams = JSON.parse(
        JSON.stringify(fixture.params).replace(
          /\${([^:]+):([^}]+)}/g,
          (_, fixtureName, propName) => {
            return resourceMap[fixtureName]?.[propName] || null;
          }
        )
      );
      
      // Execute the appropriate Stripe API call
      let resource;
      if (fixture.path === '/v1/products' && fixture.method === 'post') {
        resource = await stripe.products.create(processedParams);
      } else if (fixture.path === '/v1/prices' && fixture.method === 'post') {
        resource = await stripe.prices.create(processedParams);
      } else {
        console.warn(`Unsupported fixture type: ${fixture.path} ${fixture.method}`);
        continue;
      }
      
      // Store the result for template variable replacement
      resourceMap[fixture.name] = resource;
      fixture.resource = resource;
      
      console.log(`✅ Created ${fixture.path.replace('/v1/', '')}: ${resource.id}`);
    }
    
    return { fixtures, ...fixtureData._meta };
  } catch (error) {
    console.error('Error processing fixtures:', error);
    throw error;
  }
}

// Update .env file with price IDs
function updateEnvFile(fixtureOutput: FixtureOutput): void {
  // Extract price IDs from fixture output
  const priceIdMap: Record<string, string | null> = {
    'STRIPE_BASIC_PRICE_ID': null,
    'STRIPE_PRO_PRICE_ID': null,
    'STRIPE_ENTERPRISE_PRICE_ID': null
  };

  for (const fixture of fixtureOutput.fixtures) {
    if (fixture.name === 'basic-price' && fixture.resource) {
      priceIdMap.STRIPE_BASIC_PRICE_ID = fixture.resource.id;
    } else if (fixture.name === 'pro-price' && fixture.resource) {
      priceIdMap.STRIPE_PRO_PRICE_ID = fixture.resource.id;
    } else if (fixture.name === 'enterprise-price' && fixture.resource) {
      priceIdMap.STRIPE_ENTERPRISE_PRICE_ID = fixture.resource.id;
    }
  }

  // Check if we found all needed price IDs
  const missingPrices = Object.entries(priceIdMap)
    .filter(([_, value]) => value === null)
    .map(([key, _]) => key);

  if (missingPrices.length > 0) {
    console.warn(`⚠️ Warning: Could not find the following price IDs in fixture output: ${missingPrices.join(', ')}`);
  }

  // Update .env file
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Process each update
  for (const [key, value] of Object.entries(priceIdMap)) {
    if (value === null) continue;
    
    const regex = new RegExp(`^${key}=.*`, 'm');
    
    if (regex.test(envContent)) {
      // Replace existing value
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new key-value pair
      envContent += `\n${key}=${value}`;
    }
  }

  // Write updated content back to .env file
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Updated .env file with Stripe price IDs');
}

// Main function
async function main() {
  try {
    const fixtureOutput = await processFixtures();
    updateEnvFile(fixtureOutput);
    console.log('✅ Stripe seed completed successfully');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 