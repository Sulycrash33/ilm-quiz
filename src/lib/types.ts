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
