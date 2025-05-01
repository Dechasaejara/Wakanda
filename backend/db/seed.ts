import { seed } from "drizzle-seed";
import { db } from "./drizzle";
import {
  Users,
  Profiles,
  Badges,
  Modules,
  Lessons,
  Questions,
  Challenges,
  ChallengeQuestions,

} from "./schema";

async function main() {
  await seed(db, {
    Users,
    Profiles,
    Badges,
    Modules,
    Lessons,
    Questions,
    Challenges,
    ChallengeQuestions,
  });
}
main();
