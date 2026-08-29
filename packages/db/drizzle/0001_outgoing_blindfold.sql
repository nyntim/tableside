ALTER TABLE "menu_items" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "dietary_tags" jsonb DEFAULT '[]'::jsonb NOT NULL;