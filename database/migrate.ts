import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const runMigrate = async () => {
    const url = process.env.DATABASE_URL

    if (!url) {
        throw new Error("DATABASE_URL is required")
    }

    const sql = neon(url)
    const db = drizzle(sql)

    console.log("⏳ Running migrations...")

    const start = Date.now()

    await migrate(db, { migrationsFolder: "migrations" })

    const end = Date.now()

    console.log("✅ Migrations completed in", end - start, "ms")

    process.exit(0)
}

runMigrate().catch((err) => {
    console.error("❌ Migration failed")
    console.error(err)
    process.exit(1)
}) 