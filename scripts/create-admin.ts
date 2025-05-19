import { auth } from "@/lib/auth"

async function main() {
  console.log("Creating admin user...")
  
  try {
    // Check if admin user exists
    const adminUser = await auth.getUser({ email: "admin@example.com" })
    
    if (adminUser) {
      console.log("Admin user already exists")
      
      // Ensure the user has admin role
      if (adminUser.role !== "admin") {
        // Update the user role to admin
        await auth.database.db
          .update(auth.database.schema.users)
          .set({ role: "admin" })
          .where(auth.database.schema.users.id.eq(adminUser.id))
          .execute()
        
        console.log("Updated user role to admin")
      }
    } else {
      // Create a new admin user
      const user = await auth.createUser({
        email: "admin@example.com",
        password: "adminpassword123",
        name: "Admin User",
        role: "admin",
        emailVerified: true
      })
      
      console.log("Admin user created:", { 
        id: user.id, 
        email: "admin@example.com", 
        password: "adminpassword123" 
      })
    }
    
    console.log("Setup complete!")
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
  
  process.exit(0)
}

main().catch(console.error) 