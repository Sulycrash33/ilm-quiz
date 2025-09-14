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
