ALTER TABLE `targets` RENAME COLUMN "period_range" TO "period";--> statement-breakpoint
CREATE TABLE `application_status_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`status` text NOT NULL,
	`changed_at` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `targets_user_id_period_category_id_unique` ON `targets` (`user_id`,`period`,`category_id`);