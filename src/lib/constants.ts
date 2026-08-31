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

/**
 * The nine ranks.
 *
 * `minPoints` MUST match `rank_tiers.min_xp` in the database, which is the
 * authority: a trigger on `profiles` derives `current_rank_id` from `total_xp`
 * against that table (migration 0018). These thresholds used to be 100/300/600
 * /1000/1500/2200/3000/5000 while the database used the values below, so the
 * rank shown by client-side `rankFor()` disagreed with the rank stored on the
 * profile and used for achievement criteria — a seeker could read as Faqih in
 * one place and Talib in another. Change both or neither.
 *
 * `theme` is live too: `ranks.ts` re-exports these and `RunSummary` renders
 * `rank.theme` beside the rank icon on the payoff screen, so these colours are
 * seen by every player who finishes a run. They were nine raw Tailwind palette
 * classes picked with no relation to each other; they are tokens now, ordered
 * as a deliberate cool-to-warm climb that ends on the brand gold, so the ramp
 * itself reads as ascent rather than nine unrelated hues.
 */
export const RANKS: Rank[] = [
  { level: 1, title: 'Mubtadi', icon: Sprout, theme: 'text-success', minPoints: 0 },
  { level: 2, title: 'Talib', icon: BookOpen, theme: 'text-info', minPoints: 500 },
  { level: 3, title: 'Hafiz', icon: BookMarked, theme: 'text-info-bright', minPoints: 1500 },
  { level: 4, title: 'Faqih', icon: Scale, theme: 'text-special', minPoints: 3000 },
  { level: 5, title: 'Muhaddith', icon: ScrollText, theme: 'text-special-bright', minPoints: 5000 },
  { level: 6, title: 'Mufassir', icon: Search, theme: 'text-secondary', minPoints: 8000 },
  { level: 7, title: 'Shaykh', icon: MosqueIcon, theme: 'text-warning', minPoints: 12000 },
  { level: 8, title: 'Imam', icon: Crown, theme: 'text-medal-gold', minPoints: 18000 },
  { level: 9, title: 'Mujaddid', icon: Flame, theme: 'text-primary', minPoints: 25000 },
];

/**
 * NOTE: nothing imports this. The live category list comes from the database
 * via `quiz-service.ts`; this survives as scaffold data.
 *
 * Its colours were still shipping, though: Tailwind scans this directory and
 * emitted every class named here into the stylesheet, which is how ten dead
 * entries came to be the last raw palette classes in the bundle. They were also
 * pale-tint-on-dark-text chips, so anything reviving this list would have
 * painted light boxes onto a dark app. Tokens now: correct if it is ever wired
 * up, and costing nothing if it is not.
 *
 * Do not name a palette class literally in a comment here. The scanner is a
 * regex over the file's bytes and has no idea what a comment is, so writing one
 * out is enough to put it back in the bundle. That is not hypothetical: the
 * first draft of this very note re-emitted the two classes it was describing.
 */
export const CATEGORIES: Category[] = [
  { id: 'holy-quran', title: 'Quran', description: 'Surahs, verses, themes, and memorization', icon: Book, color: 'bg-success/10 text-success hover:bg-success/20' },
  { id: 'hadith-sciences', title: 'Hadith', description: 'Prophetic sayings and their authenticity', icon: BookCopy, color: 'bg-info/10 text-info hover:bg-info/20' },
  { id: 'prophetic-biography', title: 'Prophets', description: 'Life of Prophet Muhammad (PBUH) & others.', icon: StarIcon, color: 'bg-warning/10 text-warning hover:bg-warning/20' },
  { id: 'islamic-law', title: 'Fiqh', description: 'Practical religious rulings.', icon: Scale, color: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest' },
  { id: 'islamic-history', title: 'History', description: 'Golden age achievements.', icon: History, color: 'bg-warning/10 text-warning-bright hover:bg-warning/20' },
  { id: 'allahs-names', title: 'Aqeedah', description: "Allah's Names & Attributes", icon: Gem, color: 'bg-info/10 text-info-bright hover:bg-info/20' },
  { id: 'islamic-ethics', title: 'Ethics', description: 'Character development and morals.', icon: Heart, color: 'bg-special/10 text-special-bright hover:bg-special/20' },
  { id: 'arabic-language', title: 'Arabic', description: 'Learn the language of the Quran.', icon: Languages, color: 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20' },
  { id: 'five-pillars', title: 'Pillars', description: 'Practice of fundamental obligations.', icon: Landmark, color: 'bg-success/10 text-success-bright hover:bg-success/20' },
  { id: 'contemporary-issues', title: 'Contemporary Issues', description: 'Modern Islamic perspectives.', icon: ShieldQuestion, color: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest' },
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
      difficulty: 'Beginner',
      points: 10,
    },
    {
      id: 'an2',
      type: 'true-false',
      text: "The name 'Al-Khaliq' means 'The Provider'.",
      answer: false,
      explanation: "'Al-Khaliq' means 'The Creator', while 'Ar-Razzaq' means 'The Provider'.",
      difficulty: 'Beginner',
      points: 10,
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
      difficulty: 'Beginner',
      points: 5,
    },
    {
      id: 'hq2',
      type: 'multiple-choice',
      text: 'Which Surah is known as the "Heart of the Quran"?',
      options: ['Surah Al-Fatiha', 'Surah Al-Baqarah', 'Surah Yasin', 'Surah Al-Ikhlas'],
      answer: 'Surah Yasin',
      explanation: 'Surah Yasin (Chapter 36) is often referred to as the Heart of the Quran due to its powerful themes.',
      difficulty: 'Intermediate',
      points: 15,
    },
     {
      id: 'hq3',
      type: 'true-false',
      text: "The first revealed verses of the Quran are from Surah Al-Alaq.",
      answer: true,
      explanation: "The first five verses of Surah Al-Alaq were the first to be revealed to Prophet Muhammad (PBUH) in the cave of Hira.",
      difficulty: 'Beginner',
      points: 10,
    },
    {
      id: 'hq4',
      type: 'multiple-choice',
      text: "Which Surah is recited in every Rak'ah of Salah?",
      options: ['Surah Al-Ikhlas', 'Surah Al-Fatiha', 'Surah An-Nas', 'Surah Al-Kawthar'],
      answer: 'Surah Al-Fatiha',
      explanation: "Surah Al-Fatiha, 'The Opening', is an essential part of every unit (Rak'ah) of Islamic prayer.",
      difficulty: 'Beginner',
      points: 5,
    },
    {
      id: 'hq5',
      type: 'multiple-choice',
      text: "What is the longest Surah in the Quran?",
      options: ['Surah Al-Imran', 'Surah An-Nisa', 'Surah Al-Baqarah', 'Surah Al-Maidah'],
      answer: 'Surah Al-Baqarah',
      explanation: "Surah Al-Baqarah (The Cow) is the longest chapter in the Quran, with 286 verses.",
      difficulty: 'Beginner',
      points: 10,
    },
    {
      id: 'hq6',
      type: 'true-false',
      text: "All Surahs in the Quran begin with 'Bismillah-ir-Rahman-ir-Rahim'.",
      answer: false,
      explanation: "All Surahs begin with the Bismillah except for Surah At-Tawbah (Chapter 9).",
      difficulty: 'Intermediate',
      points: 15,
    },
    {
      id: 'hq7',
      type: 'multiple-choice',
      text: "Which Surah is equivalent to one-third of the Quran in reward?",
      options: ['Surah Al-Fatiha', 'Surah Yasin', 'Surah Al-Ikhlas', 'Surah Al-Mulk'],
      answer: 'Surah Al-Ikhlas',
      explanation: "Prophet Muhammad (PBUH) said that reciting Surah Al-Ikhlas (Chapter 112) is equivalent to reciting one-third of the Quran.",
      difficulty: 'Intermediate',
      points: 15,
    }
  ],
  'hadith-sciences': [
    {
        id: 'hs1',
        type: 'multiple-choice',
        text: 'What does the term "Sahih" mean in Hadith classification?',
        options: ['Authentic', 'Weak', 'Fabricated', 'Good'],
        answer: 'Authentic',
        explanation: '"Sahih" is the highest level of authentication for a hadith, meaning it has a connected and reliable chain of narrators.',
        difficulty: 'Beginner',
        points: 10,
    },
    {
        id: 'hs2',
        type: 'multiple-choice',
        text: 'Who is the author of "Sahih al-Bukhari"?',
        options: ['Imam Muslim', 'Imam Abu Dawood', 'Imam al-Bukhari', 'Imam at-Tirmidhi'],
        answer: 'Imam al-Bukhari',
        explanation: 'Sahih al-Bukhari is one of the most famous and respected hadith collections, compiled by Imam Muhammad al-Bukhari.',
        difficulty: 'Beginner',
        points: 10,
    },
    {
        id: 'hs3',
        type: 'true-false',
        text: 'A "Da\'if" (weak) hadith can be used to derive major legal rulings (Ahkam).',
        answer: false,
        explanation: 'Weak (Da\'if) hadith are generally not used for deriving primary legal rulings, though they may sometimes be used for virtues of deeds (Fada\'il al-A\'mal).',
        difficulty: 'Intermediate',
        points: 15,
    }
  ],
  'prophetic-biography': [
    {
      id: 'pb1',
      type: 'multiple-choice',
      text: 'In which city was Prophet Muhammad (PBUH) born?',
      options: ['Madinah', 'Jerusalem', 'Makkah', 'Taif'],
      answer: 'Makkah',
      explanation: 'Prophet Muhammad (PBUH) was born in the city of Makkah in the Year of the Elephant.',
      difficulty: 'Beginner',
      points: 5,
    },
  ],
  'islamic-law': [
    {
      id: 'il1',
      type: 'true-false',
      text: 'Wudu (ablution) is required before performing Salah (prayer).',
      answer: true,
      explanation: 'Wudu is a state of ritual purity necessary for performing prayers and other acts of worship.',
      difficulty: 'Beginner',
      points: 5,
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
      difficulty: 'Beginner',
      points: 10,
    },
  ],
  'islamic-history': [
    {
        id: 'ih1',
        type: 'multiple-choice',
        text: 'Who was the first Caliph after the death of Prophet Muhammad (PBUH)?',
        options: ['Umar ibn Al-Khattab', 'Ali ibn Abi Talib', 'Uthman ibn Affan', 'Abu Bakr As-Siddiq'],
        answer: 'Abu Bakr As-Siddiq',
        explanation: 'Abu Bakr As-Siddiq was the closest companion of the Prophet and was chosen as the first Caliph of the Muslim Ummah.',
        difficulty: 'Beginner',
        points: 10,
    },
    {
        id: 'ih2',
        type: 'multiple-choice',
        text: 'Which famous battle took place in the second year of Hijra?',
        options: ['Battle of Uhud', 'Battle of Badr', 'Battle of the Trench', 'Battle of Tabuk'],
        answer: 'Battle of Badr',
        explanation: 'The Battle of Badr was a key early Islamic battle fought in 624 CE (2 AH) and resulted in a decisive victory for the Muslims.',
        difficulty: 'Intermediate',
        points: 15,
    },
    {
        id: 'ih3',
        type: 'true-false',
        text: 'The "Golden Age of Islam" is generally considered to have occurred during the Abbasid Caliphate.',
        answer: true,
        explanation: 'The Abbasid Caliphate (c. 750–1258) saw a flourishing of science, culture, and philosophy, often referred to as the Islamic Golden Age.',
        difficulty: 'Intermediate',
        points: 15,
    }
  ],
  'islamic-ethics': [],
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
    color: 'border-accent',
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
    color: 'border-primary',
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
  'islamic-history': {
    id: 'islamic-history',
    name: 'Islamic History',
    icon: '🏛️',
    description: "Comprehensive Islamic civilization and historical events",
    difficulty: "Intermediate",
    questions: 200,
    completed: 0,
    mastery: 0,
    estimatedTime: 'Approx. 3-4 hours',
    xpReward: 2500,
    unlocked: true,
    color: "border-warning/40",
    topics: [
      { id: 'ih-rashidun', name: 'The Rightly Guided Caliphs', description: 'Study the rule of Abu Bakr, Umar, Uthman, and Ali.', questions: 40, completed: 0, difficulty: 'Beginner', unlocked: true },
      { id: 'ih-umayyad', name: 'The Umayyad Caliphate', description: 'Explore the expansion and administration of the Umayyad dynasty.', questions: 40, completed: 0, difficulty: 'Intermediate', unlocked: false },
      { id: 'ih-abbasid', name: 'The Abbasid Golden Age', description: 'Learn about the scientific and cultural flourishing in Baghdad.', questions: 40, completed: 0, difficulty: 'Intermediate', unlocked: false },
    ],
    achievements: [
        { id: 1, name: 'History Beginner', description: 'Complete the "Rightly Guided Caliphs" topic.', icon: '📜', unlocked: false, progress: 0, target: 40 },
        { id: 2, name: 'Caliphate Chronicler', description: 'Master all Caliphate topics.', icon: '👑', unlocked: false },
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
    color: "border-warning/40",
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
    color: "border-warning-bright/40",
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
    estimatedTime: 'Approx. 3-4 hours',
    xpReward: 3000,
    unlocked: true,
    color: "border-special/40",
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
    estimatedTime: 'Approx. 1-2 hours',
    xpReward: 1500,
    unlocked: true,
    color: "border-tertiary/40",
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
            color: 'border-muted',
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
