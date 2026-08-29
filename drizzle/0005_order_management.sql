ALTER TABLE bookings ADD COLUMN admin_notes TEXT;
--> statement-breakpoint
ALTER TABLE bookings ADD COLUMN updated_at TEXT;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS booking_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  changed_by TEXT,
  created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_booking_history_reference ON booking_status_history(booking_reference);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS email_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
