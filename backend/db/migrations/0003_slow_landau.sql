ALTER TABLE "questions" ALTER COLUMN "quiz_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."quiz_type";--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('lesson', 'final', 'practice', 'challenge', 'exam', 'assessment');--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "quiz_type" SET DATA TYPE "public"."quiz_type" USING "quiz_type"::"public"."quiz_type";