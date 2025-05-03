ALTER TABLE "user_progress" ALTER COLUMN "module_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "subject" varchar(100);--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "grade_Level" varchar(100);--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "difficulty" varchar(100);--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "topic" varchar(100);--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "unit" varchar(100);