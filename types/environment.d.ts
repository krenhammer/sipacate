import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

declare global {
  interface Env {
    DB: D1Database;
    db: DrizzleD1Database<typeof schema>;
  }

  // Extend Next.js API route types to include Cloudflare bindings
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_ENV?: string;
      // Add other environment variables as needed
    }
  }
} 