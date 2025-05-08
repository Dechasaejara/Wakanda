// types.ts
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export type AnswerStatus = "correct" | "incorrect" | "timeout" | null;

// Types based on your schema

export type RoleType =
  | "student"
  | "teacher"
  | "admin"
  | "member"
  | "moderator"
  | "partner"
  | "contributor"
  | "user";
export type QuizType =
  | "lesson"
  | "final"
  | "practice"
  | "challenge"
  | "exam"
  | "assessment";
export type DifficultyType = "beginner" | "intermediate" | "advanced";
export type ProgressType = "pending" | "in_progress" | "completed" | "failed";
export type BadgeType =
  | "none"
  | "basic"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum";

export interface User {
  id: number;
  code: string;
  username: string;
  role: RoleType;
  userImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob?: string;
  schoolName?: string;
  schoolType?: string;
  gradeLevel?: string;
  classSection?: string;
  languageCode?: string;
  badge: BadgeType;
  points: number;
  heart: number;
  latitude?: number;
  longitude?: number;
  showOnLeaderboard: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  earnedAt?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  slug: string;
  parent?: string;
  level: number;
  order?: number;
  requiredPoints: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  // Additional frontend properties
  completedLessons?: number;
  totalLessons?: number;
  isUnlocked?: boolean;
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  slug: string;
  order: number;
  points: number;
  completionTime: number;
  difficulty: DifficultyType;
  createdAt: string;
  updatedAt: string;
  // Additional frontend properties
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface Question {
  id: number;
  order?: number;
  lessonId?: number;
  subject?: string;
  unit?: string;
  topic?: string;
  subtopic?: string;
  gradeLevel?: string;
  type: QuizType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: DifficultyType;
  language?: string;
  reference?: string;
  tags?: string[];
  points: number;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: number;
  userId: number;
  name: string;
  userImage?: string;
  rank: number;
  points: number;
}

export interface UserProgressEntry {
  id: number;
  userId: number;
  moduleId?: number;
  lessonId?: number;
  completed: boolean;
  score: number;
  subject?: string;
  gradeLevel?: string;
  difficulty?: string;
  topic?: string;
  unit?: string;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt?: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyType;
  points: number;
  createdAt: string;
  updatedAt: string;
  // Additional frontend properties
  estimatedTime?: string;
  isCompleted?: boolean;
}

export interface ChallengeQuestion {
  id: number;
  challengeId: number;
  questionId: number;
}

export interface QuizResult {
  correct: number;
  total: number;
  percentage: number;
  points?: number;
}

export interface UserProgressSummary {
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: number;
  type:
    | "lesson_completed"
    | "challenge_completed"
    | "badge_earned"
    | "module_completed";
  title: string;
  description: string;
  timestamp: string;
  points?: number;
}
