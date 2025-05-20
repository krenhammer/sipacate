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
    let url = process.env.DATABASE_URL

    if (!url) {
        console.error("DATABASE_URL is missing");
        throw new Error("DATABASE_URL is required");
    }
    
    // Check for truncation and fix if needed
    if (url.endsWith('-')) {
        console.warn("DATABASE_URL appears to be truncated, attempting to fix...");
        // This is a workaround - in production you should ensure the full URL is used
        url = "postgresql://neondb_owner:npg_aX5ArxUP0yKd@ep-super-night-a4n4bw56-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
    }

    try {
        // Optional: Increase connection pool size or configure other options
        // neonConfig.poolQueryClient = false; // Example: Disable connection pooling if needed
        
        const sql = neon(url);
        return drizzle(sql, { schema: { ...schema, ...relations }, logger: true });
    } catch (error) {
        console.error("Failed to connect to database:", error);
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Cache the db instance to avoid reconnecting repeatedly
let db: DB | null = null;

export function getDb(): DB {
    if (!db) {
        try {
            db = connectDb();
        } catch (error) {
            console.error("Failed to initialize database:", error);
            // Return a placeholder DB object that will throw errors when used
            // This prevents null reference errors in the app but still indicates the failure
            throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return db;
}

// Check for db client in context for API routes
export function getDbFromContext(context: { env?: { db?: DB } } = {}) {
    try {
        return getDb();
    } catch (error) {
        console.error("Failed to get DB from context:", error);
        throw error;
    }
}

// Initialize db but handle potential errors
try {
    db = getDb();
    console.log("Database initialized successfully");
} catch (error) {
    console.error("Error initializing database:", error);
    // Don't assign db = null, as it's already null
}

// Export the initialized db instance for direct import
export { db }
