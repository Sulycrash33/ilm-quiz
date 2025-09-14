import type { LucideIcon } from 'lucide-react';

export interface Rank {
  level: number;
  title: string;
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  theme: string;
  minPoints: number;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-the-blank';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answer: string | boolean;
  explanation: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  points?: number;
  timeLimit?: number;
}

// Achievement System Types
export interface Reward {
  coins: number;
  xp: number;
  badge?: string;
  title?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: Reward;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  reward: Reward;
  timeLeft: string;
  completed: boolean;
}

// Category Detail Page Types
export interface Topic {
  id: string;
  name: string;
  description: string;
  questions: number;
  completed: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  unlocked: boolean;
}

export interface CategoryAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface CategoryDetails {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: string;
  questions: number;
  completed: number;
  mastery: number;
  estimatedTime: string;
  xpReward: number;
  unlocked: boolean;
  color: string;
  topics: Topic[];
  achievements: CategoryAchievement[];
}

// Leaderboard Types
export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  rank_title: string;
  streak?: number;
  country: string;
  avatar: string;
  badge?: string;
  questionsAnswered?: number;
}

export interface CategoryLeader {
  category: string;
  icon: string;
  leader: string;
  points: number;
  rank_title: string;
  country: string;
}

    