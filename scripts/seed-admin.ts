import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import { nanoid } from "nanoid"
import { hash } from "@node-rs/argon2"
import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import * as schema from "../auth-schema"

async function main() {
  console.log("Creating admin user and test organization...")
  
  try {
    // Initialize the database
    const sqlite = new Database("better-auth.db")
    const db = drizzle(sqlite, { schema })
    
    // Check if admin user exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@example.com")
    })
    
    let userId = existingUser?.id
    
    if (!existingUser) {
      // Create admin user if not exists
      const id = createId()
      const hashedPassword = await hash("adminpassword123")
      
      await db.insert(schema.users).values({
        id,
        name: "Admin User",
        email: "admin@example.com",
        emailVerified: true,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Add password separately in accounts table
      await db.insert(schema.accounts).values({
        id: createId(),
        userId: id,
        providerId: "credentials",
        accountId: id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      userId = id
      console.log("Admin user created:", { email: "admin@example.com", password: "adminpassword123" })
    } else {
      console.log("Admin user already exists:", { email: "admin@example.com" })
      
      // Update role to admin if needed
      if (existingUser.role !== "admin") {
        await db.update(schema.users)
          .set({ role: "admin" })
          .where(eq(schema.users.id, existingUser.id))
        
        console.log("Updated user role to admin")
      }
    }
    
    // Create a test organization if none exists
    const existingOrg = await db.query.organizations.findFirst()
    
    if (!existingOrg) {
      const orgId = createId()
      
      // Create organization
      await db.insert(schema.organizations).values({
        id: orgId,
        name: "Test Organization",
        slug: "test-org",
        createdAt: new Date()
      })
      
      // Add admin as member/owner
      await db.insert(schema.members).values({
        id: createId(),
        userId: userId!,
        organizationId: orgId,
        role: "owner",
        createdAt: new Date()
      })
      
      console.log("Test organization created with admin as owner")
    } else {
      console.log("Organization already exists:", existingOrg)
      
      // Ensure admin is a member
      const isMember = await db.query.members.findFirst({
        where: (members, { eq, and }) => 
          and(
            eq(members.userId, userId!),
            eq(members.organizationId, existingOrg.id)
          )
      })
      
      if (!isMember) {
        await db.insert(schema.members).values({
          id: createId(),
          userId: userId!,
          organizationId: existingOrg.id,
          role: "owner",
          createdAt: new Date()
        })
        
        console.log("Added admin user as organization owner")
      }
    }
    
    console.log("Setup complete!")
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  }
  
  process.exit(0)
}

main().catch(console.error) 