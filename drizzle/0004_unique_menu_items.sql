DELETE FROM menu_items
WHERE id NOT IN (
  SELECT MIN(id)
  FROM menu_items
  GROUP BY label, url, position
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_unique_item
ON menu_items(label, url, position);
