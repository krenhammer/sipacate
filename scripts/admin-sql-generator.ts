import { hash } from "@node-rs/argon2"
import { createId } from "@paralleldrive/cuid2"

async function main() {
  try {
    // For demo purposes, we'll use simple credentials
    const adminEmail = "admin@example.com"
    const adminPassword = "adminpassword123"
    const userId = createId()
    const now = new Date().toISOString()

    // Hash the password
    const hashedPassword = await hash(adminPassword)

    // Generate SQL commands
    console.log(`-- SQL commands to create/update admin user`)
    console.log(`-- Admin email: ${adminEmail}`)
    console.log(`-- Admin password: ${adminPassword}`)
    console.log(`-- Run these commands manually on your database`)
    console.log(`-- ------------------------------------------------`)
    console.log(``)
    
    // SQL to update existing user to admin
    console.log(`-- Option 1: Update existing user to admin (if user exists)`)
    console.log(`UPDATE users SET role = 'admin', emailVerified = '${now}' WHERE email = '${adminEmail}';`)
    console.log(``)
    
    // SQL to create new admin user
    console.log(`-- Option 2: Create new admin user (if user doesn't exist)`)
    console.log(`INSERT INTO users (id, name, email, emailVerified, role, password, created_at, updated_at)`)
    console.log(`VALUES (`)
    console.log(`  '${userId}',`)
    console.log(`  'Admin User',`)
    console.log(`  '${adminEmail}',`)
    console.log(`  '${now}',`)
    console.log(`  'admin',`)
    console.log(`  '${hashedPassword}',`)
    console.log(`  '${now}',`)
    console.log(`  '${now}'`)
    console.log(`);`)
    console.log(``)
    
    // SQL to create test organization
    const orgId = createId()
    console.log(`-- Option 3: Create a test organization and add admin as owner`)
    console.log(`INSERT INTO organization (id, name, slug, created_at, updated_at)`)
    console.log(`VALUES (`)
    console.log(`  '${orgId}',`)
    console.log(`  'Test Organization',`)
    console.log(`  'test-org',`)
    console.log(`  '${now}',`)
    console.log(`  '${now}'`)
    console.log(`);`)
    console.log(``)
    
    // SQL to add admin as organization owner
    const memberId = createId()
    console.log(`-- Add admin as organization owner (run after creating org)`)
    console.log(`INSERT INTO member (id, organization_id, user_id, role, created_at, updated_at)`)
    console.log(`VALUES (`)
    console.log(`  '${memberId}',`)
    console.log(`  '${orgId}',`)
    console.log(`  '${userId}', -- Use actual user ID if updating existing user`)
    console.log(`  'owner',`)
    console.log(`  '${now}',`)
    console.log(`  '${now}'`)
    console.log(`);`)

  } catch (error) {
    console.error("Error generating SQL:", error)
    process.exit(1)
  }
}

main().catch(console.error) 