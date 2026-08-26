CREATE TABLE `lodging_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lodging_categories_slug_unique` ON `lodging_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`position` text DEFAULT 'main' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`open_new_tab` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `post_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_categories_slug_unique` ON `post_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_categories_slug_unique` ON `service_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `site_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_key` text NOT NULL,
	`eyebrow` text,
	`title` text NOT NULL,
	`description` text,
	`image` text,
	`buttons` text DEFAULT '[]' NOT NULL,
	`meta` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_pages_page_key_unique` ON `site_pages` (`page_key`);--> statement-breakpoint
ALTER TABLE `lodgings` ADD `category_id` integer REFERENCES lodging_categories(id);--> statement-breakpoint
ALTER TABLE `posts` ADD `category_id` integer REFERENCES post_categories(id);--> statement-breakpoint
ALTER TABLE `services` ADD `category_id` integer REFERENCES service_categories(id);