CREATE TYPE "public"."cycle_action_type" AS ENUM('start', 'close', 'reopen', 'run', 'expire');--> statement-breakpoint
CREATE TYPE "public"."cycle_state" AS ENUM('scheduled', 'registration_open', 'registration_closed', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."raffle_outcome_status" AS ENUM('selected', 'not_selected');--> statement-breakpoint
CREATE TYPE "public"."spot_status" AS ENUM('available', 'assigned', 'reserved', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'RESIDENT');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"result_id" uuid NOT NULL,
	"resident_id" text NOT NULL,
	"spot_id" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignment_cycle_resident_unique" UNIQUE("cycle_id","resident_id"),
	CONSTRAINT "assignment_cycle_spot_unique" UNIQUE("cycle_id","spot_id"),
	CONSTRAINT "assignment_result_resident_unique" UNIQUE("result_id","resident_id")
);
--> statement-breakpoint
CREATE TABLE "cycle_action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"actor_id" text NOT NULL,
	"action" "cycle_action_type" NOT NULL,
	"reason" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raffle_cycle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_quarter" text NOT NULL,
	"registration_closes_at" timestamp with time zone NOT NULL,
	"state" "cycle_state" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raffle_cycle_target_quarter_unique" UNIQUE("target_quarter")
);
--> statement-breakpoint
CREATE TABLE "raffle_outcome" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"resident_id" text NOT NULL,
	"status" "raffle_outcome_status" NOT NULL,
	"spot_id" text,
	CONSTRAINT "raffle_outcome_result_resident_unique" UNIQUE("result_id","resident_id"),
	CONSTRAINT "raffle_outcome_result_spot_unique" UNIQUE("result_id","spot_id")
);
--> statement-breakpoint
CREATE TABLE "raffle_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"actor_id" text NOT NULL,
	"ran_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raffle_result_cycle_id_unique" UNIQUE("cycle_id")
);
--> statement-breakpoint
CREATE TABLE "registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"resident_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registration_cycle_resident_unique" UNIQUE("cycle_id","resident_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "spot" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "spot_status" DEFAULT 'available' NOT NULL,
	"current_resident_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'RESIDENT' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"plate" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_cycle_id_raffle_cycle_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."raffle_cycle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_result_id_raffle_result_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."raffle_result"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_resident_id_user_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_spot_id_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spot"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_action" ADD CONSTRAINT "cycle_action_cycle_id_raffle_cycle_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."raffle_cycle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_action" ADD CONSTRAINT "cycle_action_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_outcome" ADD CONSTRAINT "raffle_outcome_result_id_raffle_result_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."raffle_result"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_outcome" ADD CONSTRAINT "raffle_outcome_resident_id_user_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_outcome" ADD CONSTRAINT "raffle_outcome_spot_id_spot_id_fk" FOREIGN KEY ("spot_id") REFERENCES "public"."spot"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_result" ADD CONSTRAINT "raffle_result_cycle_id_raffle_cycle_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."raffle_cycle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_result" ADD CONSTRAINT "raffle_result_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_cycle_id_raffle_cycle_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."raffle_cycle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_resident_id_user_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spot" ADD CONSTRAINT "spot_current_resident_id_user_id_fk" FOREIGN KEY ("current_resident_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assignment_resident_idx" ON "assignment" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "cycle_action_cycle_time_idx" ON "cycle_action" USING btree ("cycle_id","occurred_at");--> statement-breakpoint
CREATE INDEX "registration_cycle_idx" ON "registration" USING btree ("cycle_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");