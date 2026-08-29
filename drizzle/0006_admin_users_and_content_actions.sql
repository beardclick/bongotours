ALTER TABLE `user_profiles` ADD `active` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE `user_profiles` ADD `deleted_at` text;
--> statement-breakpoint
CREATE TABLE `content_tombstones` (
	`entity` text NOT NULL,
	`content_key` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`entity`, `content_key`)
);
