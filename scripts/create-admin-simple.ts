// Simple script to create an admin user
import { SQLiteConnector } from "@auth/drizzle-adapter"
import Database from "better-sqlite3"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { hash } from "@node-rs/argon2"
import { createId } from "@paralleldrive/cuid2"

const EMAIL = "admin@example.com"
const PASSWORD = "adminpassword123"

async function main() {
  try {
    console.log("Setting up admin user...")

    // Initialize database
    const sqlite = new Database("better-auth.db")
    const db = drizzle(sqlite)
    
    // Check if admin user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq("users.email", EMAIL),
    })

    if (existingUser) {
      console.log("Admin user already exists")
      
      // Update role to admin if needed
      if (existingUser.role !== "admin") {
        await db.update("users").set({ role: "admin" }).where(eq("users.email", EMAIL)).execute()
        console.log("Updated user role to admin")
      }
    } else {
      // Hash password
      const hashedPassword = await hash(PASSWORD)
      
      // Create user with admin role
      const userId = createId()
      
      await db.insert("users").values({
        id: userId,
        name: "Admin User",
        email: EMAIL,
        emailVerified: new Date().toISOString(),
        role: "admin",
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).execute()
      
      console.log("Created admin user with email:", EMAIL)
      console.log("Password:", PASSWORD)
    }

    console.log("Admin setup complete!")
  } catch (error) {
    console.error("Error setting up admin user:", error)
    process.exit(1)
  }
}

main().catch(console.error) 