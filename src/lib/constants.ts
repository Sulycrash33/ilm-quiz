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
  Globe,
  Star as StarIcon,
  BookCopy,
  Gem,
  Languages,
  History,
  Plus
} from 'lucide-react';
import type { Rank, Category, Question, Topic, CategoryAchievement, CategoryDetails } from './types';
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
  { id: 'holy-quran', title: 'Quran', description: 'Surahs, verses, themes, and memorization', icon: Book, color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { id: 'hadith-sciences', title: 'Hadith', description: 'Prophetic sayings and their authenticity', icon: BookCopy, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { id: 'prophetic-biography', title: 'Prophets', description: 'Life of Prophet Muhammad (PBUH) & others.', icon: StarIcon, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { id: 'islamic-law', title: 'Fiqh', description: 'Practical religious rulings.', icon: Scale, color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' },
  { id: 'islamic-civilization', title: 'History', description: 'Golden age achievements.', icon: History, color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { id: 'allahs-names', title: 'Aqeedah', description: "Allah's Names & Attributes", icon: Gem, color: 'bg-sky-100 text-sky-800 hover:bg-sky-200' },
  { id: 'islamic-ethics', title: 'Ethics', description: 'Character development and morals.', icon: Heart, color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
  { id: 'arabic-language', title: 'Arabic', description: 'Learn the language of the Quran.', icon: Languages, color: 'bg-teal-100 text-teal-800 hover:bg-teal-200' },
  { id: 'five-pillars', title: 'Pillars', description: 'Practice of fundamental obligations.', icon: Landmark, color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
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
     {
      id: 'hq3',
      type: 'true-false',
      text: "The first revealed verses of the Quran are from Surah Al-Alaq.",
      answer: true,
      explanation: "The first five verses of Surah Al-Alaq were the first to be revealed to Prophet Muhammad (PBUH) in the cave of Hira.",
    },
    {
      id: 'hq4',
      type: 'multiple-choice',
      text: "Which Surah is recited in every Rak'ah of Salah?",
      options: ['Surah Al-Ikhlas', 'Surah Al-Fatiha', 'Surah An-Nas', 'Surah Al-Kawthar'],
      answer: 'Surah Al-Fatiha',
      explanation: "Surah Al-Fatiha, 'The Opening', is an essential part of every unit (Rak'ah) of Islamic prayer.",
    }
  ],
    'hadith-sciences': [],
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
  'arabic-language': [],
};

export const DAILY_HADITH = {
  text: "The best among you are those who have the best manners and character.",
  source: "Sahih al-Bukhari 6029"
};

const CATEGORY_DETAILS_DATA: Record<string, CategoryDetails> = {
  'allahs-names': {
    id: 'allahs-names',
    name: "Allah's Names & Attributes",
    icon: '✨',
    description: "Learn the 99 beautiful names of Allah",
    difficulty: "Beginner",
    questions: 150,
    completed: 45,
    mastery: 30,
    estimatedTime: "Approx. 1-2 hours",
    xpReward: 1500,
    unlocked: true,
    color: 'border-emerald-300',
    topics: [
      { id: 'an-meaning', name: 'Meanings of Names 1-20', description: 'Understand the meanings of the first 20 names.', questions: 20, completed: 20, difficulty: 'Beginner', unlocked: true },
      { id: 'an-application', name: 'Applying Names in Dua', description: 'Learn how to use the names of Allah in your supplications.', questions: 25, completed: 10, difficulty: 'Intermediate', unlocked: true },
      { id: 'an-groups', name: 'Groups of Names', description: 'Study names related to mercy, power, and wisdom.', questions: 30, completed: 15, difficulty: 'Intermediate', unlocked: false },
    ],
    achievements: [
        { id: 1, name: 'Name Knower', description: 'Complete your first topic on Allah\'s Names.', icon: '🌟', unlocked: true },
        { id: 2, name: 'Attribute Admirer', description: 'Master the "Meanings" topic.', icon: '📜', unlocked: false, progress: 10, target: 20 },
    ]
  },
  'holy-quran': {
    id: 'holy-quran',
    name: 'Holy Quran',
    icon: '📖',
    description: 'Surahs, verses, themes, and memorization',
    difficulty: 'All Levels',
    questions: 300,
    completed: 78,
    mastery: 26,
    estimatedTime: 'Approx. 4-5 hours',
    xpReward: 5000,
    unlocked: true,
    color: 'border-blue-300',
    topics: [
      { id: 'quran-revelation', name: 'Revelation of the Quran', description: 'Learn about the historical context and timeline of the Quranic revelation.', questions: 20, completed: 20, difficulty: 'Beginner', unlocked: true },
      { id: 'quran-makkan-surahs', name: 'Makkan Surahs', description: 'Study the themes and characteristics of Surahs revealed in Makkah.', questions: 30, completed: 15, difficulty: 'Intermediate', unlocked: true },
      { id: 'quran-madani-surahs', name: 'Madani Surahs', description: 'Explore the legal rulings and community-building themes of Madani Surahs.', questions: 30, completed: 10, difficulty: 'Intermediate', unlocked: true },
      { id: 'quran-tafsir', name: 'Science of Tafsir', description: 'Introduction to the principles of Quranic interpretation.', questions: 35, completed: 0, difficulty: 'Advanced', unlocked: false },
      { id: 'quran-memorization', name: 'Memorization Techniques', description: 'Tips and tricks for Hifdh (memorizing) the Quran.', questions: 35, completed: 0, difficulty: 'Beginner', unlocked: false },
    ],
    achievements: [
      { id: 1, name: 'Quranic Novice', description: 'Complete the "Revelation" topic.', icon: '🌟', unlocked: true, },
      { id: 2, name: 'Surah Specialist', description: 'Master both Makkan and Madani Surah topics.', icon: '📜', unlocked: false, progress: 25, target: 60 },
      { id: 3, name: 'Tafsir Explorer', description: 'Unlock the "Science of Tafsir" topic.', icon: '🔍', unlocked: false, },
      { id: 4, name: 'Quran Competitor', description: 'Get a perfect score in challenge mode.', icon: '🏆', unlocked: false }
    ],
  },
   'hadith-sciences': {
    id: 'hadith-sciences',
    name: 'Hadith Sciences',
    icon: '📜',
    description: "Prophetic sayings and their authenticity",
    difficulty: "Intermediate",
    questions: 200,
    completed: 23,
    mastery: 11,
    estimatedTime: 'Approx. 3-4 hours',
    xpReward: 2500,
    unlocked: true,
    color: "border-amber-300",
    topics: [],
    achievements: [],
  },
  'prophetic-biography': {
    id: 'prophetic-biography',
    name: 'Prophetic Biography',
    icon: '⭐',
    description: "Life of Prophet Muhammad (PBUH)",
    difficulty: "Beginner",
    questions: 180,
    completed: 67,
    mastery: 37,
    estimatedTime: 'Approx. 2-3 hours',
    xpReward: 2000,
    unlocked: true,
    color: "border-yellow-300",
    topics: [],
    achievements: [],
  },
  'islamic-law': {
    id: 'islamic-law',
    name: 'Islamic Law (Fiqh)',
    icon: '⚖️',
    description: "Practical religious rulings",
    difficulty: "Advanced",
    questions: 250,
    completed: 12,
    mastery: 5,
    unlocked: true,
    color: "border-purple-300",
    topics: [],
    achievements: [],
  },
  'five-pillars': {
    id: 'five-pillars',
    name: 'Five Pillars',
    icon: '🕌',
    description: "Fundamental obligations of Islam",
    difficulty: "Beginner",
    questions: 120,
    completed: 89,
    mastery: 74,
    unlocked: true,
    color: "border-teal-300",
    topics: [],
    achievements: [],
  },
};

// Add placeholder data for other categories
CATEGORIES.forEach(cat => {
    if (!CATEGORY_DETAILS_DATA[cat.id]) {
        const isUnlocked = Math.random() > 0.3; // 70% chance of being unlocked
        CATEGORY_DETAILS_DATA[cat.id] = {
            id: cat.id,
            name: cat.title,
            icon: '❓',
            description: cat.description,
            difficulty: 'Mixed',
            questions: Math.floor(Math.random() * 100) + 50, // 50-150 questions
            completed: isUnlocked ? Math.floor(Math.random() * 40) : 0,
            mastery: isUnlocked ? Math.floor(Math.random() * 50) : 0,
            estimatedTime: `Approx. ${Math.floor(Math.random() * 2) + 1}-${Math.floor(Math.random() * 2) + 2} hours`,
            xpReward: (Math.floor(Math.random() * 10) + 5) * 100, // 500-1500 XP
            unlocked: isUnlocked,
            color: 'border-gray-300',
            topics: [
              { id: `${cat.id}-1`, name: 'Introduction', description: 'Basic concepts.', questions: 20, completed: 0, difficulty: 'Beginner', unlocked: isUnlocked },
              { id: `${cat.id}-2`, name: 'Core Concepts', description: 'Deeper dive into the subject.', questions: 30, completed: 0, difficulty: 'Intermediate', unlocked: false },
            ],
            achievements: [
              { id: 1, name: 'First Step', description: `Complete a quiz in ${cat.title}.`, icon: '🌟', unlocked: false },
            ],
        };
    }
});

export const CATEGORY_DETAILS = CATEGORY_DETAILS_DATA;
