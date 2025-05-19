import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema" // Import schema
import * as relations from "./relations" // Import relations

export const tables = { ...schema, ...relations } // Export schema tables and relations

// Type for the Drizzle instance
export type DB = ReturnType<typeof connectDb>

/**
 * Connects to the Neon database using environment variables.
 */
export const connectDb = () => {
    const url = process.env.DATABASE_URL

    if (!url) {
        throw new Error("DATABASE_URL is required")
    }

    // Optional: Increase connection pool size or configure other options
    // neonConfig.poolQueryClient = false; // Example: Disable connection pooling if needed

    const sql = neon(url);

    return drizzle(sql, { schema: { ...schema, ...relations }, logger: true })
}

// Cache the db instance to avoid reconnecting repeatedly
let db: DB | null = null;

export function getDb(): DB {
    if (!db) {
        db = connectDb()
    }
    return db
}

// Check for db client in context for API routes
export function getDbFromContext(context: { env?: { db?: DB } } = {}) {
    // Remove the D1-specific context check if it's no longer relevant
    // For serverless/edge environments, creating a new connection per request might be intended.
    // Check if context provides a db instance (might still be useful in some setups)
    // if (context.env?.db) {
    //     return context.env.db;
    // } else {
        return getDb();
    // }
}

// Initialize db before exporting to prevent null references
db = getDb();

// Export the initialized db instance for direct import
export { db }
