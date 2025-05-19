#!/usr/bin/env bun

// Script to update .env file with Stripe price IDs from fixtures output
// Run with: bun .stripe/update-env.js

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if fixture output file was provided
const fixtureOutputPath = process.argv[2];
if (!fixtureOutputPath) {
  console.error('❌ Please provide the path to the fixture output file');
  console.error('Usage: bun .stripe/update-env.js <fixture-output-file>');
  process.exit(1);
}

// Load fixture output
let fixtureOutput;
try {
  const fixtureOutputContent = fs.readFileSync(fixtureOutputPath, 'utf8');
  fixtureOutput = JSON.parse(fixtureOutputContent);
} catch (error) {
  console.error(`❌ Error reading fixture output file: ${error.message}`);
  process.exit(1);
}

// Extract price IDs from fixture output
const priceIdMap = {
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

console.log('✅ Updated .env file with Stripe price IDs from fixture output'); 