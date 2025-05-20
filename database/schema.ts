import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
    jsonb // Added for metadata
} from "drizzle-orm/pg-core";

// Using varchar(255) for IDs assuming they are CUIDs or similar standard length identifiers
const idColumn = varchar("id", { length: 255 }).primaryKey();
const createdAtColumn = timestamp("created_at", { precision: 3, mode: 'date' }).notNull().defaultNow();
const updatedAtColumn = timestamp("updated_at", { precision: 3, mode: 'date' }).notNull().defaultNow(); // Consider adding .onUpdateNow() if needed

export const users = pgTable("users", {
    id: idColumn,
    name: varchar("name", { length: 255 }).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false), // Changed default
    image: text("image"),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
    role: varchar("role", { length: 50 }).default("user"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", { precision: 3, mode: 'date' }),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
});

export const organizations = pgTable("organization", {
    id: idColumn,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(), // Added unique constraint assumption
    logo: text("logo"),
    metadata: jsonb("metadata"), // Using jsonb for flexible metadata
    createdAt: createdAtColumn,
    // Assuming updatedAt is desired for organizations too
    updatedAt: updatedAtColumn
});

export const sessions = pgTable("sessions", {
    id: idColumn,
    expiresAt: timestamp("expires_at", { precision: 3, mode: 'date' }).notNull(),
    token: text("token").notNull().unique(), // Using text for potentially long tokens
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: varchar("impersonated_by", { length: 255 }), // Assuming user ID length
    activeOrganizationId: varchar("active_organization_id", { length: 255 }).references(() => organizations.id, { onDelete: 'set null' }) // Set null on delete?
});

export const accounts = pgTable("accounts", {
    id: idColumn,
    accountId: varchar("account_id", { length: 255 }).notNull(), // Likely external ID
    providerId: varchar("provider_id", { length: 255 }).notNull(), // e.g., 'google', 'credentials'
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { precision: 3, mode: 'date' }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { precision: 3, mode: 'date' }),
    scope: text("scope"),
    password: text("password"), // Storing hashed passwords
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
    // Consider adding unique constraint on (providerId, accountId)
});

export const members = pgTable("member", {
    id: idColumn,
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organization_id", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(), // e.g., 'admin', 'member'
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn // Added updatedAt assumption
    // Consider adding unique constraint on (userId, organizationId)
});

export const invitations = pgTable("invitation", {
    id: idColumn,
    email: varchar("email", { length: 255 }).notNull(),
    inviterId: varchar("inviter_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Inviter user
    organizationId: varchar("organization_id", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // e.g., 'pending', 'accepted'
    expiresAt: timestamp("expires_at", { precision: 3, mode: 'date' }).notNull(),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn // Added updatedAt assumption
    // Consider adding unique constraint on (email, organizationId) for pending invites?
});

export const verifications = pgTable("verifications", {
    id: idColumn,
    identifier: varchar("identifier", { length: 255 }).notNull(), // e.g., email address
    value: text("value").notNull(), // e.g., verification code/token
    expiresAt: timestamp("expires_at", { precision: 3, mode: 'date' }).notNull(),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

// Assuming 'teams' are distinct from 'organizations' and belong to an organization
export const teams = pgTable("team", {
    id: idColumn,
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: varchar("organization_id", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
    // Consider adding unique constraint on (name, organizationId)
});

// Add team_members junction table
export const teamMembers = pgTable("team_member", {
    id: idColumn,
    teamId: varchar("team_id", { length: 255 })
        .notNull()
        .references(() => teams.id, { onDelete: "cascade" }),
    memberId: varchar("member_id", { length: 255 })
        .notNull()
        .references(() => members.id, { onDelete: "cascade" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
    // Consider adding unique constraint on (teamId, memberId)
});

export const subscriptions = pgTable("subscriptions", {
    id: idColumn, // Could be Stripe Subscription ID or internal ID
    plan: varchar("plan", { length: 100 }).notNull(), // e.g., 'basic', 'pro'
    referenceId: varchar("reference_id", { length: 255 }).notNull().unique(), // Link to user or organization ID
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
    status: varchar("status", { length: 50 }).notNull(), // e.g., 'active', 'canceled', 'trialing'
    periodStart: timestamp("period_start", { precision: 3, mode: 'date' }),
    periodEnd: timestamp("period_end", { precision: 3, mode: 'date' }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end"),
    seats: integer("seats"),
    trialStart: timestamp("trial_start", { precision: 3, mode: 'date' }),
    trialEnd: timestamp("trial_end", { precision: 3, mode: 'date' }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

export const apikeys = pgTable("apikey", {
    id: idColumn,
    name: varchar("name", { length: 255 }),
    start: varchar("start", { length: 50 }),
    prefix: varchar("prefix", { length: 50 }),
    key: text("key").notNull(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at", { precision: 3, mode: 'date' }),
    enabled: boolean("enabled").default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(false),
    rateLimitTimeWindow: integer("rate_limit_time_window"),
    rateLimitMax: integer("rate_limit_max"),
    requestCount: integer("request_count").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamp("last_request", { precision: 3, mode: 'date' }),
    expiresAt: timestamp("expires_at", { precision: 3, mode: 'date' }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn,
    permissions: text("permissions"),
    metadata: jsonb("metadata")
});

export const assistants = pgTable("assistant", {
    id: idColumn,
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    instructions: text("instructions"),
    knowledge: text("knowledge"),
    organizationId: varchar("organization_id", { length: 255 })
        .references(() => organizations.id, { onDelete: "set null" }),
    createdById: varchar("created_by", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

export const assistantFiles = pgTable("assistant_file", {
    id: idColumn,
    assistantId: varchar("assistant_id", { length: 255 })
        .notNull()
        .references(() => assistants.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(), // md, docx, image
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

// Plan Template Schema
export const planTemplates = pgTable("plan_template", {
    id: idColumn,
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdById: varchar("created_by", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organization_id", { length: 255 })
        .references(() => organizations.id, { onDelete: "set null" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

export const planSteps = pgTable("plan_step", {
    id: idColumn,
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    planTemplateId: varchar("plan_template_id", { length: 255 })
        .notNull()
        .references(() => planTemplates.id, { onDelete: "cascade" }),
    createdById: varchar("created_by", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organization_id", { length: 255 })
        .references(() => organizations.id, { onDelete: "set null" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

export const planItems = pgTable("plan_item", {
    id: idColumn,
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 50 }).notNull(), // List, Document
    instructions: text("instructions"),
    systemPrompt: text("system_prompt"),
    userPrompt: text("user_prompt"),
    createdById: varchar("created_by", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    organizationId: varchar("organization_id", { length: 255 })
        .references(() => organizations.id, { onDelete: "set null" }),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});

// Junction table to maintain order of plan items in a step
export const planStepItems = pgTable("plan_step_item", {
    id: idColumn,
    planStepId: varchar("plan_step_id", { length: 255 })
        .notNull()
        .references(() => planSteps.id, { onDelete: "cascade" }),
    planItemId: varchar("plan_item_id", { length: 255 })
        .notNull()
        .references(() => planItems.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    createdAt: createdAtColumn,
    updatedAt: updatedAtColumn
});