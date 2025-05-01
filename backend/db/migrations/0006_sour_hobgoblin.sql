ALTER TABLE "questions" ADD COLUMN "order" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_order_unique" UNIQUE("order");