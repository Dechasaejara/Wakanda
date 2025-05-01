ALTER TABLE "questions" ALTER COLUMN "language" SET DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "points" SET DEFAULT 2;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "points" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "time_limit" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "subject" varchar(100);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "topic" varchar(100);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "subtopic" varchar(100);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "grade_level" varchar(100);--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" jsonb;