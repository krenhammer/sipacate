CREATE TABLE "apikey" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"start" varchar(50),
	"prefix" varchar(50),
	"key" text NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp (3),
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT false,
	"rate_limit_time_window" integer,
	"rate_limit_max" integer,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp (3),
	"expires_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"permissions" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;