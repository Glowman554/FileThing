CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"project" text NOT NULL,
	"name" text NOT NULL,
	"uploadToken" text
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"name" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"projectToken" text NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"username" text NOT NULL,
	"token" text PRIMARY KEY NOT NULL,
	"creationDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"username" text PRIMARY KEY NOT NULL,
	"administrator" boolean DEFAULT false NOT NULL,
	"passwordHash" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_username_users_username_fk" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_username_users_username_fk" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE cascade ON UPDATE cascade;