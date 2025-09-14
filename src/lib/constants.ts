import {
  Sprout,
  BookOpen,
  BookMarked,
  Scale,
  ScrollText,
  Search,
  Crown,
  Flame,
  Book,
  Heart,
  Landmark,
  ShieldQuestion,
  Users,
  Briefcase,
  PiggyBank,
  Handshake,
  Palette,
  Atom,
  BrainCircuit,
  Globe
} from 'lucide-react';
import type { Rank, Category, Question } from './types';
import { MosqueIcon } from '@/components/icons/MosqueIcon';

export const RANKS: Rank[] = [
  { level: 1, title: 'Mubtadi', icon: Sprout, theme: 'text-green-500', minPoints: 0 },
  { level: 2, title: 'Talib', icon: BookOpen, theme: 'text-blue-500', minPoints: 100 },
  { level: 3, title: 'Hafiz', icon: BookMarked, theme: 'text-yellow-500', minPoints: 300 },
  { level: 4, title: 'Faqih', icon: Scale, theme: 'text-purple-500', minPoints: 600 },
  { level: 5, title: 'Muhaddith', icon: ScrollText, theme: 'text-amber-700', minPoints: 1000 },
  { level: 6, title: 'Mufassir', icon: Search, theme: 'text-gray-500', minPoints: 1500 },
  { level: 7, title: 'Shaykh', icon: MosqueIcon, theme: 'text-emerald-500', minPoints: 2200 },
  { level: 8, title: 'Imam', icon: Crown, theme: 'text-blue-700', minPoints: 3000 },
  { level: 9, title: 'Mujaddid', icon: Flame, theme: 'text-red-500', minPoints: 5000 },
];

export const CATEGORIES: Category[] = [
  { id: 'allahs-names', title: "Allah's Names & Attributes", description: "Explore the Asma ul-Husna.", icon: Heart },
  { id: 'holy-quran', title: 'Holy Quran', description: 'Surahs, verses, themes, and more.', icon: Book },
  { id: 'prophetic-biography', title: 'Prophetic Biography', description: 'Life of Prophet Muhammad (PBUH).', icon: Users },
  { id: 'islamic-law', title: 'Islamic Law (Fiqh)', description: 'Practical religious rulings.', icon: Scale },
  { id: 'five-pillars', title: 'Five Pillars', description: 'Practice of fundamental obligations.', icon: Landmark },
  { id: 'islamic-ethics', title: 'Islamic Ethics (Akhlaq)', description: 'Character development and morals.', icon: BrainCircuit },
  { id: 'islamic-civilization', title: 'Islamic Civilization', description: 'Golden age achievements.', icon: Globe },
  { id: 'contemporary-issues', title: 'Contemporary Issues', description: 'Modern Islamic perspectives.', icon: ShieldQuestion },
];

export const QUESTIONS: Record<string, Question[]> = {
  'allahs-names': [
    {
      id: 'an1',
      type: 'multiple-choice',
      text: "Which name of Allah means 'The Most Merciful'?",
      options: ['Al-Ghafoor', 'Ar-Rahman', 'Al-Jabbar', 'Al-Mumin'],
      answer: 'Ar-Rahman',
      explanation: "Ar-Rahman refers to Allah's encompassing mercy for all of creation.",
    },
    {
      id: 'an2',
      type: 'true-false',
      text: "The name 'Al-Khaliq' means 'The Provider'.",
      answer: false,
      explanation: "'Al-Khaliq' means 'The Creator', while 'Ar-Razzaq' means 'The Provider'.",
    },
  ],
  'holy-quran': [
    {
      id: 'hq1',
      type: 'multiple-choice',
      text: 'How many Surahs are in the Holy Quran?',
      options: ['114', '100', '124', '99'],
      answer: '114',
      explanation: 'The Quran is composed of 114 chapters, or Surahs, of varying lengths.',
    },
    {
      id: 'hq2',
      type: 'multiple-choice',
      text: 'Which Surah is known as the "Heart of the Quran"?',
      options: ['Surah Al-Fatiha', 'Surah Al-Baqarah', 'Surah Yasin', 'Surah Al-Ikhlas'],
      answer: 'Surah Yasin',
      explanation: 'Surah Yasin (Chapter 36) is often referred to as the Heart of the Quran due to its powerful themes.',
    },
  ],
  'prophetic-biography': [
    {
      id: 'pb1',
      type: 'multiple-choice',
      text: 'In which city was Prophet Muhammad (PBUH) born?',
      options: ['Madinah', 'Jerusalem', 'Makkah', 'Taif'],
      answer: 'Makkah',
      explanation: 'Prophet Muhammad (PBUH) was born in the city of Makkah in the Year of the Elephant.',
    },
  ],
  'islamic-law': [
    {
      id: 'il1',
      type: 'true-false',
      text: 'Wudu (ablution) is required before performing Salah (prayer).',
      answer: true,
      explanation: 'Wudu is a state of ritual purity necessary for performing prayers and other acts of worship.',
    },
  ],
  'five-pillars': [
    {
      id: 'fp1',
      type: 'multiple-choice',
      text: 'Which of these is NOT one of the Five Pillars of Islam?',
      options: ['Shahadah (Faith)', 'Salah (Prayer)', 'Jihad (Struggle)', 'Zakat (Charity)'],
      answer: 'Jihad (Struggle)',
      explanation: 'While Jihad is an important concept in Islam, the Five Pillars are Shahadah, Salah, Zakat, Sawm (Fasting), and Hajj (Pilgrimage).',
    },
  ],
  'islamic-ethics': [],
  'islamic-civilization': [],
  'contemporary-issues': [],
};

export const DAILY_HADITH = {
  text: "The best among you are those who have the best manners and character.",
  source: "Sahih al-Bukhari 6029"
};
