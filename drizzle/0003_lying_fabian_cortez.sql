CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_targets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`period` text NOT NULL,
	`goal_count` integer NOT NULL,
	`category_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_targets`("id", "user_id", "period", "goal_count", "category_id", "created_at") SELECT "id", "user_id", "period", "goal_count", "category_id", "created_at" FROM `targets`;--> statement-breakpoint
DROP TABLE `targets`;--> statement-breakpoint
ALTER TABLE `__new_targets` RENAME TO `targets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `targets_user_id_period_category_id_unique` ON `targets` (`user_id`,`period`,`category_id`);--> statement-breakpoint
ALTER TABLE `applications` ADD `user_id` integer NOT NULL REFERENCES users(id);