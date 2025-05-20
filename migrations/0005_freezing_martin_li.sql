CREATE TABLE "plan_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"instructions" text,
	"system_prompt" text,
	"user_prompt" text,
	"created_by" varchar(255) NOT NULL,
	"organization_id" varchar(255),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_step_item" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"plan_step_id" varchar(255) NOT NULL,
	"plan_item_id" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_step" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"plan_template_id" varchar(255) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"organization_id" varchar(255),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_template" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_by" varchar(255) NOT NULL,
	"organization_id" varchar(255),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_item" ADD CONSTRAINT "plan_item_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_item" ADD CONSTRAINT "plan_item_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_step_item" ADD CONSTRAINT "plan_step_item_plan_step_id_plan_step_id_fk" FOREIGN KEY ("plan_step_id") REFERENCES "public"."plan_step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_step_item" ADD CONSTRAINT "plan_step_item_plan_item_id_plan_item_id_fk" FOREIGN KEY ("plan_item_id") REFERENCES "public"."plan_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_step" ADD CONSTRAINT "plan_step_plan_template_id_plan_template_id_fk" FOREIGN KEY ("plan_template_id") REFERENCES "public"."plan_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_step" ADD CONSTRAINT "plan_step_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_step" ADD CONSTRAINT "plan_step_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_template" ADD CONSTRAINT "plan_template_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_template" ADD CONSTRAINT "plan_template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;