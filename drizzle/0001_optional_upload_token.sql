DROP INDEX "projects_name_unique";--> statement-breakpoint
ALTER TABLE `files` ALTER COLUMN "uploadToken" TO "uploadToken" text;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);