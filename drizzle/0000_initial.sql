CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`name` text NOT NULL,
	`uploadToken` text NOT NULL,
	`content` blob,
	FOREIGN KEY (`project`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`name` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`projectToken` text NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`username` text NOT NULL,
	`token` text PRIMARY KEY NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`administrator` integer DEFAULT false NOT NULL,
	`passwordHash` text NOT NULL
);
