CREATE TABLE `coupons` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`code` text NOT NULL UNIQUE,`description` text,`discount_type` text DEFAULT 'percentage' NOT NULL,`amount` real NOT NULL,`min_cart_total` real DEFAULT 0 NOT NULL,`max_discount` real,`usage_limit` integer,`usage_limit_per_user` integer,`product_scope` text DEFAULT 'all' NOT NULL,`product_slugs` text,`allowed_emails` text,`start_at` text,`end_at` text,`active` integer DEFAULT 1 NOT NULL,`created_at` text NOT NULL,`updated_at` text NOT NULL);
--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`coupon_id` integer NOT NULL,`checkout_key` text NOT NULL UNIQUE,`booking_reference` text,`user_id` text,`email` text NOT NULL,`discount_amount` real NOT NULL,`created_at` text NOT NULL,FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`));
--> statement-breakpoint
CREATE INDEX `idx_coupon_redemptions_coupon` ON `coupon_redemptions` (`coupon_id`);
--> statement-breakpoint
CREATE INDEX `idx_coupon_redemptions_email` ON `coupon_redemptions` (`coupon_id`,`email`);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `coupon_code` text;
--> statement-breakpoint
ALTER TABLE `bookings` ADD `discount_amount` real DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `bookings` ADD `cart_subtotal` real;
--> statement-breakpoint
ALTER TABLE `bookings` ADD `checkout_key` text;
