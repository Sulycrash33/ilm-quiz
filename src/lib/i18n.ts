export type Locale = "en" | "ha" | "fr" | "ar" | "ms" | "id"

export interface Translations {
  // Common
  welcome: string
  welcomeBack: string
  loading: string
  save: string
  cancel: string
  delete: string
  edit: string
  close: string
  back: string
  next: string
  continue: string
  confirm: string
  success: string
  error: string

  // Navigation
  home: string
  learning: string
  rankings: string
  shop: string
  profile: string
  settings: string
  logout: string

  // Home Dashboard
  todayProgress: string
  xpGained: string
  focusLevel: string
  inProgress: string
  lessonOf: string
  minsRemaining: string
  complete: string
  completedLabel: string
  prayerTimes: string
  dailyMission: string
  continueButton: string

  // Quiz
  question: string
  of: string
  timeRemaining: string
  submit: string
  nextQuestion: string
  correct: string
  incorrect: string
  explanation: string
  pointsEarned: string
  quizComplete: string
  score: string
  accuracy: string
  tryAgain: string
  questionsBeingPrepared: string
  backToCategories: string
  xpThisRound: string
  coinsWord: string
  bestTotal: string
  playAgain: string
  couldNotLoadQuestion: string
  exitQuiz: string
  streakWord: string
  roundXp: string
  whyItsRight: string
  sourceLabel: string
  streakBonus: string
  lifelineFiftyFifty: string
  lifelineFiftyFiftyDesc: string
  lifelineAskImam: string
  lifelineAskImamDesc: string
  lifelineSkip: string
  lifelineSkipDesc: string
  lifelineDoublePoints: string
  lifelineDoublePointsDesc: string
  lifelineTimeBoost: string
  lifelineTimeBoostDesc: string

  // Categories
  knowledgeCategories: string
  categories: string
  questionsAvailable: string
  questionsAnswered: string
  progress: string
  startQuiz: string
  comingSoon: string

  // Leaderboard
  communityLeaderboard: string
  seeWhoIsLeading: string
  yourRanking: string
  keepLearning: string
  weeklyRankings: string
  dailyRankings: string
  monthlyRankings: string
  allTimeRankings: string

  // Profile
  overview: string
  achievements: string
  statistics: string
  activity: string
  totalXp: string
  dayStreak: string
  globalRank: string
  progressTo: string
  learningProgress: string
  recentAchievements: string
  categoryPerformance: string
  learningStreaks: string
  currentStreak: string
  longestStreak: string
  totalActiveDays: string
  recentActivity: string

  // Store
  ilmStore: string
  enhanceLearning: string
  lifelines: string
  powerups: string
  cosmetics: string
  bundles: string
  chests: string
  buy: string
  owned: string
  specialOffer: string
  limitedTime: string

  // Achievements
  achievementsAndChallenges: string
  trackProgress: string
  unlocked: string
  xpEarned: string
  activeChallenges: string
  weeklyChallenge: string
  monthMaster: string
  quizMarathon: string
  daysLeft: string

  // Community
  communityHub: string
  connectLearnGrow: string
  studyGroups: string
  forum: string
  challenges: string
  mentorship: string
  activeLearners: string
  studyGroupsCount: string
  forumPosts: string
  activeChallengesCount: string
  startDiscussion: string
  joinGroup: string
  viewDiscussions: string
  becomeAMentor: string
  findAMENTor: string
  applyToBe: string
  browseMentors: string

  // Multiplayer
  multiplayerQuiz: string
  competeWithFriends: string
  createRoom: string
  joinRoom: string
  enterRoomCode: string
  hostQuiz: string
  shareCode: string
  waitingForPlayers: string
  readyUp: string
  notReady: string
  startQuizButton: string
  needPlayers: string
  leaveRoom: string
  roomCode: string
  players: string
  liveLeaderboard: string
  questionNumber: string
  getReady: string

  // Rewards
  rewardsCenter: string
  claimRewards: string
  tryYourLuck: string
  dailyLoginRewards: string
  spinTheWheel: string
  spinForFree: string
  nextFreeSpin: string
  mysteryChests: string
  openChests: string
  buyMoreChests: string
  weeklyChallengeProgress: string

  // Admin
  adminDashboard: string
  categoryManagement: string
  userManagement: string
  questionBank: string
  reviewQueue: string
  analyticsDashboard: string
  totalUsers: string
  activeToday: string
  questions: string
  quizzesTaken: string
  quickActions: string
  generateQuestions: string
  manageCategories: string
  recentActivityAdmin: string
  topCategories: string
  systemStatus: string
  operational: string
  searchUsers: string
  allRoles: string
  admin: string
  reviewer: string
  user: string
  active: string
  suspended: string
  pending: string
  suspend: string
  activate: string
  searchQuestions: string
  allDifficulties: string
  easy: string
  medium: string
  hard: string
  allStatus: string
  published: string
  draft: string
  rejected: string
  viewDetails: string
  publish: string
  userGrowth: string
  quizPerformance: string
  userRetention: string
  geographicDistribution: string
  topUsers: string
  last7Days: string
  last30Days: string
  allTime: string

  // Settings
  language: string
  notifications: string
  privacy: string
  about: string
  help: string
  feedback: string

  // Auth
  signIn: string
  signUp: string
  email: string
  password: string
  forgotPassword: string
  dontHaveAccount: string
  alreadyHaveAccount: string
  orContinueWith: string
}

const enTranslations: Translations = {
  // Common
  welcome: "Welcome",
  welcomeBack: "Welcome Back",
  loading: "Loading...",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  close: "Close",
  back: "Back",
  next: "Next",
  continue: "Continue",
  confirm: "Confirm",
  success: "Success",
  error: "Error",

  // Navigation
  home: "Home",
  learning: "Learning",
  rankings: "Rankings",
  shop: "Shop",
  profile: "Profile",
  settings: "Settings",
  logout: "Logout",

  // Home Dashboard
  todayProgress: "Today's Progress",
  xpGained: "XP Gained",
  focusLevel: "Focus Level",
  inProgress: "In Progress",
  lessonOf: "Lesson {current} of {total}",
  minsRemaining: "{mins} mins remaining",
  complete: "{percent}% complete",
  completedLabel: "Completed",
  prayerTimes: "Prayer Times",
  dailyMission: "Daily Mission",
  continueButton: "CONTINUE",

  // Quiz
  question: "Question",
  of: "of",
  timeRemaining: "Time Remaining",
  submit: "Submit",
  nextQuestion: "Next Question",
  correct: "Correct!",
  incorrect: "Incorrect",
  explanation: "Explanation",
  pointsEarned: "+{points} XP",
  quizComplete: "Quiz Complete!",
  score: "Score",
  accuracy: "Accuracy",
  tryAgain: "Try Again",
  questionsBeingPrepared: "Questions for the \u201c{category}\u201d category are being prepared.",
  backToCategories: "Back to Categories",
  xpThisRound: "XP this round",
  coinsWord: "Coins",
  bestTotal: "Best total",
  playAgain: "Play again",
  couldNotLoadQuestion: "Could not load question",
  exitQuiz: "Exit Quiz",
  streakWord: "streak",
  roundXp: "Round XP",
  whyItsRight: "Why it's right",
  sourceLabel: "Source",
  streakBonus: "{multiplier}\u00d7 streak bonus",
  lifelineFiftyFifty: "50/50",
  lifelineFiftyFiftyDesc: "Remove two wrong answers",
  lifelineAskImam: "Ask Imam",
  lifelineAskImamDesc: "Get a helpful hint",
  lifelineSkip: "Skip",
  lifelineSkipDesc: "Skip to next question",
  lifelineDoublePoints: "2x Points",
  lifelineDoublePointsDesc: "Double points for this question",
  lifelineTimeBoost: "Time+",
  lifelineTimeBoostDesc: "Add 15 seconds",

  // Categories
  knowledgeCategories: "Knowledge Categories",
  categories: "Categories",
  questionsAvailable: "questions available",
  questionsAnswered: "questions answered",
  progress: "Progress",
  startQuiz: "Start Quiz",
  comingSoon: "Coming Soon",

  // Leaderboard
  communityLeaderboard: "Community Leaderboard",
  seeWhoIsLeading: "See who is leading the quest for knowledge",
  yourRanking: "Your Ranking",
  keepLearning: "Keep learning to climb higher!",
  weeklyRankings: "Weekly Rankings",
  dailyRankings: "Daily Rankings",
  monthlyRankings: "Monthly Rankings",
  allTimeRankings: "All Time Rankings",

  // Profile
  overview: "Overview",
  achievements: "Achievements",
  statistics: "Statistics",
  activity: "Activity",
  totalXp: "Total XP",
  dayStreak: "Day Streak",
  globalRank: "Global Rank",
  progressTo: "Progress to Level {level}",
  learningProgress: "Learning Progress",
  recentAchievements: "Recent Achievements",
  categoryPerformance: "Category Performance",
  learningStreaks: "Learning Streaks",
  currentStreak: "Current Streak",
  longestStreak: "Longest Streak",
  totalActiveDays: "Total Active Days",
  recentActivity: "Recent Activity",

  // Store
  ilmStore: "ILM Store",
  enhanceLearning: "Enhance your learning journey",
  lifelines: "Lifelines",
  powerups: "Power-ups",
  cosmetics: "Cosmetics",
  bundles: "Bundles",
  chests: "Chests",
  buy: "Buy",
  owned: "Owned",
  specialOffer: "Special Offer: 2x Coins!",
  limitedTime: "LIMITED TIME",

  // Achievements
  achievementsAndChallenges: "Achievements & Challenges",
  trackProgress: "Track your progress and earn rewards",
  unlocked: "UNLOCKED",
  xpEarned: "XP EARNED",
  activeChallenges: "ACTIVE CHALLENGES",
  weeklyChallenge: "Weekly Challenge",
  monthMaster: "Month Master",
  quizMarathon: "Quiz Marathon",
  daysLeft: "{days} days left",

  // Community
  communityHub: "Community Hub",
  connectLearnGrow: "Connect, learn, and grow together",
  studyGroups: "Study Groups",
  forum: "Forum",
  challenges: "Challenges",
  mentorship: "Mentorship",
  activeLearners: "ACTIVE LEARNERS",
  studyGroupsCount: "STUDY GROUPS",
  forumPosts: "FORUM POSTS",
  activeChallengesCount: "ACTIVE CHALLENGES",
  startDiscussion: "Start a Discussion",
  joinGroup: "Join Group",
  viewDiscussions: "View Discussions",
  becomeAMentor: "Become a Mentor",
  findAMENTor: "Find a Mentor",
  applyToBe: "Apply to be a Mentor",
  browseMentors: "Browse Mentors",

  // Multiplayer
  multiplayerQuiz: "Multiplayer Quiz",
  competeWithFriends: "Compete with friends in real-time",
  createRoom: "Create Room",
  joinRoom: "Join Room",
  enterRoomCode: "Enter room code",
  hostQuiz: "Host a quiz for your friends",
  shareCode: "Share this code with friends to join",
  waitingForPlayers: "Waiting for players...",
  readyUp: "Ready Up",
  notReady: "Not Ready",
  startQuizButton: "Start Quiz",
  needPlayers: "Need 2+ Players",
  leaveRoom: "Leave Room",
  roomCode: "Room Code",
  players: "Players",
  liveLeaderboard: "LIVE LEADERBOARD",
  questionNumber: "Question {current}/{total}",
  getReady: "Get ready...",

  // Rewards
  rewardsCenter: "Rewards Center",
  claimRewards: "Claim your rewards and try your luck",
  tryYourLuck: "Try your luck",
  dailyLoginRewards: "Daily Login Rewards",
  spinTheWheel: "Spin the Wheel",
  spinForFree: "Spin for Free!",
  nextFreeSpin: "Next free spin in {hours} hours",
  mysteryChests: "Mystery Chests",
  openChests: "Open chests to earn coins, XP, and exclusive items!",
  buyMoreChests: "Buy More Chests",
  weeklyChallengeProgress: "Weekly Challenge Progress",

  // Admin
  adminDashboard: "Admin Dashboard",
  categoryManagement: "Category Management",
  userManagement: "User Management",
  questionBank: "Question Bank",
  reviewQueue: "Review Queue",
  analyticsDashboard: "Analytics Dashboard",
  totalUsers: "Total Users",
  activeToday: "Active Today",
  questions: "Questions",
  quizzesTaken: "Quizzes Taken",
  quickActions: "Quick Actions",
  generateQuestions: "Generate Questions",
  manageCategories: "Manage Categories",
  recentActivityAdmin: "Recent Activity",
  topCategories: "Top Categories",
  systemStatus: "System Status",
  operational: "Operational",
  searchUsers: "Search users...",
  allRoles: "All Roles",
  admin: "Admin",
  reviewer: "Reviewer",
  user: "User",
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
  suspend: "Suspend",
  activate: "Activate",
  searchQuestions: "Search questions...",
  allDifficulties: "All Difficulties",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  allStatus: "All Status",
  published: "Published",
  draft: "Draft",
  rejected: "Rejected",
  viewDetails: "View",
  publish: "Publish",
  userGrowth: "User Growth",
  quizPerformance: "Quiz Performance",
  userRetention: "User Retention",
  geographicDistribution: "Geographic Distribution",
  topUsers: "Top Users by XP",
  last7Days: "Last 7 Days",
  last30Days: "Last 30 Days",
  allTime: "All Time",

  // Settings
  language: "Language",
  notifications: "Notifications",
  privacy: "Privacy",
  about: "About",
  help: "Help",
  feedback: "Feedback",

  // Auth
  signIn: "Sign In",
  signUp: "Sign Up",
  email: "Email",
  password: "Password",
  forgotPassword: "Forgot Password?",
  dontHaveAccount: "Don't have an account?",
  alreadyHaveAccount: "Already have an account?",
  orContinueWith: "Or continue with",
}

// Malay/Indonesian translations - culturally meaningful, not direct translations
const msTranslations: Translations = {
  // Common
  welcome: "Selamat Datang",
  welcomeBack: "Selamat Kembali",
  loading: "Memuatkan...",
  save: "Simpan",
  cancel: "Batal",
  delete: "Padam",
  edit: "Sunting",
  close: "Tutup",
  back: "Kembali",
  next: "Seterusnya",
  continue: "Teruskan",
  confirm: "Sahkan",
  success: "Berjaya",
  error: "Ralat",

  // Navigation
  home: "Utama",
  learning: "Pembelajaran",
  rankings: "Penarafan",
  shop: "Kedai",
  profile: "Profil",
  settings: "Tetapan",
  logout: "Log Keluar",

  // Home Dashboard
  todayProgress: "Kemajuan Hari Ini",
  xpGained: "XP Diperoleh",
  focusLevel: "Tahap Fokus",
  inProgress: "Sedang Berjalan",
  lessonOf: "Pelajaran {current} daripada {total}",
  minsRemaining: "{mins} minit lagi",
  complete: "{percent}% selesai",
  completedLabel: "Selesai",
  prayerTimes: "Waktu Solat",
  dailyMission: "Misi Harian",
  continueButton: "TERUSKAN",

  // Quiz
  question: "Soalan",
  of: "daripada",
  timeRemaining: "Masa Tinggal",
  submit: "Hantar",
  nextQuestion: "Soalan Seterusnya",
  correct: "Betul!",
  incorrect: "Salah",
  explanation: "Penjelasan",
  pointsEarned: "+{points} XP",
  quizComplete: "Kuiz Selesai!",
  score: "Skor",
  accuracy: "Ketepatan",
  tryAgain: "Cuba Lagi",
  questionsBeingPrepared: "Soalan untuk kategori \u201c{category}\u201d sedang disediakan.",
  backToCategories: "Kembali ke Kategori",
  xpThisRound: "XP pusingan ini",
  coinsWord: "Syiling",
  bestTotal: "Jumlah terbaik",
  playAgain: "Main semula",
  couldNotLoadQuestion: "Tidak dapat memuatkan soalan",
  exitQuiz: "Keluar Kuiz",
  streakWord: "rentetan",
  roundXp: "XP Pusingan",
  whyItsRight: "Kenapa ia betul",
  sourceLabel: "Sumber",
  streakBonus: "Bonus rentetan {multiplier}\u00d7",
  lifelineFiftyFifty: "50/50",
  lifelineFiftyFiftyDesc: "Buang dua jawapan salah",
  lifelineAskImam: "Tanya Imam",
  lifelineAskImamDesc: "Dapatkan petunjuk",
  lifelineSkip: "Langkau",
  lifelineSkipDesc: "Langkau ke soalan seterusnya",
  lifelineDoublePoints: "Mata 2x",
  lifelineDoublePointsDesc: "Gandakan mata untuk soalan ini",
  lifelineTimeBoost: "Masa+",
  lifelineTimeBoostDesc: "Tambah 15 saat",

  // Categories
  knowledgeCategories: "Kategori Ilmu",
  categories: "Kategori",
  questionsAvailable: "soalan tersedia",
  questionsAnswered: "soalan dijawab",
  progress: "Kemajuan",
  startQuiz: "Mulakan Kuiz",
  comingSoon: "Akan Datang",

  // Leaderboard
  communityLeaderboard: "Papan Pemimpin Komuniti",
  seeWhoIsLeading: "Lihat siapa yang mendahului pencarian ilmu",
  yourRanking: "Penarafan Anda",
  keepLearning: "Terus belajar untuk naik lebih tinggi!",
  weeklyRankings: "Penarafan Mingguan",
  dailyRankings: "Penarafan Harian",
  monthlyRankings: "Penarafan Bulanan",
  allTimeRankings: "Penarafan Sepanjang Masa",

  // Profile
  overview: "Gambaran Keseluruhan",
  achievements: "Pencapaian",
  statistics: "Statistik",
  activity: "Aktiviti",
  totalXp: "Jumlah XP",
  dayStreak: "Lega Hari",
  globalRank: "Penarafan Global",
  progressTo: "Kemajuan ke Tahap {level}",
  learningProgress: "Kemajuan Pembelajaran",
  recentAchievements: "Pencapaian Terkini",
  categoryPerformance: "Prestasi Kategori",
  learningStreaks: "Lega Pembelajaran",
  currentStreak: "Lega Semasa",
  longestStreak: "Lega Terpanjang",
  totalActiveDays: "Jumlah Hari Aktif",
  recentActivity: "Aktiviti Terkini",

  // Store
  ilmStore: "Kedai ILM",
  enhanceLearning: "Tingkatkan perjalanan pembelajaran anda",
  lifelines: "Garis Nyawa",
  powerups: "Peningkatan Kuasa",
  cosmetics: "Kosmetik",
  bundles: "Pek",
  chests: "Peti",
  buy: "Beli",
  owned: "Dimiliki",
  specialOffer: "Tawaran Istimewa: 2x Syiling!",
  limitedTime: "MASA TERHAD",

  // Achievements
  achievementsAndChallenges: "Pencapaian & Cabaran",
  trackProgress: "Jejak kemajuan anda dan dapatkan ganjaran",
  unlocked: "DIBUKA",
  xpEarned: "XP DIPEROLEH",
  activeChallenges: "CABARAN AKTIF",
  weeklyChallenge: "Cabaran Mingguan",
  monthMaster: "Tuan Bulanan",
  quizMarathon: "Maraton Kuiz",
  daysLeft: "{days} hari lagi",

  // Community
  communityHub: "Pusat Komuniti",
  connectLearnGrow: "Berhubung, belajar, dan berkembang bersama",
  studyGroups: "Kumpulan Belajar",
  forum: "Forum",
  challenges: "Cabaran",
  mentorship: "Mentorship",
  activeLearners: "PELAJAR AKTIF",
  studyGroupsCount: "KUMPULAN BELAJAR",
  forumPosts: "POST FORUM",
  activeChallengesCount: "CABARAN AKTIF",
  startDiscussion: "Mulakan Perbincangan",
  joinGroup: "Sertai Kumpulan",
  viewDiscussions: "Lihat Perbincangan",
  becomeAMentor: "Jadi Mentor",
  findAMENTor: "Cari Mentor",
  applyToBe: "Memohon menjadi Mentor",
  browseMentors: "Semak Mentor",

  // Multiplayer
  multiplayerQuiz: "Kuiz Berbilang Pemain",
  competeWithFriends: "Bertanding dengan rakan secara masa nyata",
  createRoom: "Cipta Bilik",
  joinRoom: "Sertai Bilik",
  enterRoomCode: "Masukkan kod bilik",
  hostQuiz: "Anjur kuiz untuk rakan anda",
  shareCode: "Kongsi kod ini dengan rakan untuk menyertai",
  waitingForPlayers: "Menunggu pemain...",
  readyUp: "Bersedia",
  notReady: "Belum Bersedia",
  startQuizButton: "Mulakan Kuiz",
  needPlayers: "Perlukan 2+ Pemain",
  leaveRoom: "Tinggalkan Bilik",
  roomCode: "Kod Bilik",
  players: "Pemain",
  liveLeaderboard: "PEMIMPIN LANGSUNG",
  questionNumber: "Soalan {current}/{total}",
  getReady: "Bersedia...",

  // Rewards
  rewardsCenter: "Pusat Ganjaran",
  claimRewards: "Tuntut ganjaran anda dan cuba nasib",
  tryYourLuck: "Cuba nasib anda",
  dailyLoginRewards: "Ganjaran Log Masuk Harian",
  spinTheWheel: "Putar Roda",
  spinForFree: "Putar Percuma!",
  nextFreeSpin: "Putaran percuma seterusnya dalam {hours} jam",
  mysteryChests: "Peti Misteri",
  openChests: "Buka peti untuk mendapat syiling, XP, dan item eksklusif!",
  buyMoreChests: "Beli Lebih Banyak Peti",
  weeklyChallengeProgress: "Kemajuan Cabaran Mingguan",

  // Admin
  adminDashboard: "Papan Pemuka Admin",
  categoryManagement: "Pengurusan Kategori",
  userManagement: "Pengurusan Pengguna",
  questionBank: "Bank Soalan",
  reviewQueue: "Baris Semakan",
  analyticsDashboard: "Papan Pemuka Analitik",
  totalUsers: "Jumlah Pengguna",
  activeToday: "Aktif Hari Ini",
  questions: "Soalan",
  quizzesTaken: "Kuiz Diambil",
  quickActions: "Tindakan Pantas",
  generateQuestions: "Jana Soalan",
  manageCategories: "Urus Kategori",
  recentActivityAdmin: "Aktiviti Terkini",
  topCategories: "Kategori Teratas",
  systemStatus: "Status Sistem",
  operational: "Beroperasi",
  searchUsers: "Cari pengguna...",
  allRoles: "Semua Peranan",
  admin: "Admin",
  reviewer: "Penyemak",
  user: "Pengguna",
  active: "Aktif",
  suspended: "Digantung",
  pending: "Menunggu",
  suspend: "Gantung",
  activate: "Aktifkan",
  searchQuestions: "Cari soalan...",
  allDifficulties: "Semua Kesukaran",
  easy: "Mudah",
  medium: "Sederhana",
  hard: "Sukar",
  allStatus: "Semua Status",
  published: "Diterbitkan",
  draft: "Draf",
  rejected: "Ditolak",
  viewDetails: "Lihat",
  publish: "Terbit",
  userGrowth: "Pertumbuhan Pengguna",
  quizPerformance: "Prestasi Kuiz",
  userRetention: "Pengekalan Pengguna",
  geographicDistribution: "Taburan Geografi",
  topUsers: "Pengguna Teratas mengikut XP",
  last7Days: "7 Hari Lepas",
  last30Days: "30 Hari Lepas",
  allTime: "Sepanjang Masa",

  // Settings
  language: "Bahasa",
  notifications: "Pemberitahuan",
  privacy: "Privasi",
  about: "Tentang",
  help: "Bantuan",
  feedback: "Maklum Balas",

  // Auth
  signIn: "Log Masuk",
  signUp: "Daftar",
  email: "E-mel",
  password: "Kata Laluan",
  forgotPassword: "Lupa Kata Laluan?",
  dontHaveAccount: "Tiada akaun?",
  alreadyHaveAccount: "Sudah ada akaun?",
  orContinueWith: "Atau teruskan dengan",
}

// Indonesian translations - culturally meaningful, adapted for Indonesian context
const idTranslations: Translations = {
  // Common
  welcome: "Selamat Datang",
  welcomeBack: "Selamat Kembali",
  loading: "Memuat...",
  save: "Simpan",
  cancel: "Batal",
  delete: "Hapus",
  edit: "Ubah",
  close: "Tutup",
  back: "Kembali",
  next: "Selanjutnya",
  continue: "Lanjutkan",
  confirm: "Konfirmasi",
  success: "Berhasil",
  error: "Kesalahan",

  // Navigation
  home: "Beranda",
  learning: "Belajar",
  rankings: "Peringkat",
  shop: "Toko",
  profile: "Profil",
  settings: "Pengaturan",
  logout: "Keluar",

  // Home Dashboard
  todayProgress: "Kemajuan Hari Ini",
  xpGained: "XP Diperoleh",
  focusLevel: "Tingkat Fokus",
  inProgress: "Sedang Berlangsung",
  lessonOf: "Pelajaran {current} dari {total}",
  minsRemaining: "{mins} menit lagi",
  complete: "{percent}% selesai",
  completedLabel: "Selesai",
  prayerTimes: "Waktu Sholat",
  dailyMission: "Misi Harian",
  continueButton: "LANJUTKAN",

  // Quiz
  question: "Soal",
  of: "dari",
  timeRemaining: "Sisa Waktu",
  submit: "Kirim",
  nextQuestion: "Soal Selanjutnya",
  correct: "Benar!",
  incorrect: "Salah",
  explanation: "Penjelasan",
  pointsEarned: "+{points} XP",
  quizComplete: "Kuis Selesai!",
  score: "Skor",
  accuracy: "Akurasi",
  tryAgain: "Coba Lagi",
  questionsBeingPrepared: "Pertanyaan untuk kategori \u201c{category}\u201d sedang disiapkan.",
  backToCategories: "Kembali ke Kategori",
  xpThisRound: "XP putaran ini",
  coinsWord: "Koin",
  bestTotal: "Total terbaik",
  playAgain: "Main lagi",
  couldNotLoadQuestion: "Tidak dapat memuat pertanyaan",
  exitQuiz: "Keluar Kuis",
  streakWord: "beruntun",
  roundXp: "XP Putaran",
  whyItsRight: "Mengapa ini benar",
  sourceLabel: "Sumber",
  streakBonus: "Bonus beruntun {multiplier}\u00d7",
  lifelineFiftyFifty: "50/50",
  lifelineFiftyFiftyDesc: "Hapus dua jawaban salah",
  lifelineAskImam: "Tanya Imam",
  lifelineAskImamDesc: "Dapatkan petunjuk",
  lifelineSkip: "Lewati",
  lifelineSkipDesc: "Lewati ke pertanyaan berikutnya",
  lifelineDoublePoints: "Poin 2x",
  lifelineDoublePointsDesc: "Gandakan poin untuk pertanyaan ini",
  lifelineTimeBoost: "Waktu+",
  lifelineTimeBoostDesc: "Tambah 15 detik",

  // Categories
  knowledgeCategories: "Kategori Ilmu",
  categories: "Kategori",
  questionsAvailable: "soal tersedia",
  questionsAnswered: "soal terjawab",
  progress: "Kemajuan",
  startQuiz: "Mulai Kuis",
  comingSoon: "Segera Hadir",

  // Leaderboard
  communityLeaderboard: "Papan Peringkat Komunitas",
  seeWhoIsLeading: "Lihat siapa yang memimpin pencarian ilmu",
  yourRanking: "Peringkat Anda",
  keepLearning: "Terus belajar untuk naik lebih tinggi!",
  weeklyRankings: "Peringkat Mingguan",
  dailyRankings: "Peringkat Harian",
  monthlyRankings: "Peringkat Bulanan",
  allTimeRankings: "Peringkat Sepanjang Masa",

  // Profile
  overview: "Ringkasan",
  achievements: "Pencapaian",
  statistics: "Statistik",
  activity: "Aktivitas",
  totalXp: "Total XP",
  dayStreak: "Runtutan Hari",
  globalRank: "Peringkat Global",
  progressTo: "Kemajuan ke Level {level}",
  learningProgress: "Kemajuan Belajar",
  recentAchievements: "Pencapaian Terbaru",
  categoryPerformance: "Performa Kategori",
  learningStreaks: "Runtutan Belajar",
  currentStreak: "Runtutan Saat Ini",
  longestStreak: "Runtutan Terpanjang",
  totalActiveDays: "Total Hari Aktif",
  recentActivity: "Aktivitas Terbaru",

  // Store
  ilmStore: "Toko ILM",
  enhanceLearning: "Tingkatkan perjalanan belajar Anda",
  lifelines: "Nawa Hidup",
  powerups: "Penguat Daya",
  cosmetics: "Kosmetik",
  bundles: "Paket",
  chests: "Peti",
  buy: "Beli",
  owned: "Dimiliki",
  specialOffer: "Penawaran Spesial: 2x Koin!",
  limitedTime: "TERBATAS",

  // Achievements
  achievementsAndChallenges: "Pencapaian & Tantangan",
  trackProgress: "Pantau kemajuan Anda dan dapatkan hadiah",
  unlocked: "TERBUKA",
  xpEarned: "XP DIPEROLEH",
  activeChallenges: "TANTANGAN AKTIF",
  weeklyChallenge: "Tantangan Mingguan",
  monthMaster: "Tuan Bulanan",
  quizMarathon: "Maraton Kuis",
  daysLeft: "{days} hari lagi",

  // Community
  communityHub: "Pusat Komunitas",
  connectLearnGrow: "Terhubung, belajar, dan berkembang bersama",
  studyGroups: "Kelompok Belajar",
  forum: "Forum",
  challenges: "Tantangan",
  mentorship: "Mentoring",
  activeLearners: "PELAJAR AKTIF",
  studyGroupsCount: "KELOMPOK BELAJAR",
  forumPosts: "POSTINGAN FORUM",
  activeChallengesCount: "TANTANGAN AKTIF",
  startDiscussion: "Mulai Diskusi",
  joinGroup: "Gabung Kelompok",
  viewDiscussions: "Lihat Diskusi",
  becomeAMentor: "Jadi Mentor",
  findAMENTor: "Cari Mentor",
  applyToBe: "Melamar menjadi Mentor",
  browseMentors: "Lihat Mentor",

  // Multiplayer
  multiplayerQuiz: "Kuis Bermain Bareng",
  competeWithFriends: "Bertanding dengan teman secara langsung",
  createRoom: "Buat Ruangan",
  joinRoom: "Gabung Ruangan",
  enterRoomCode: "Masukkan kode ruangan",
  hostQuiz: "Adakan kuis untuk teman-teman Anda",
  shareCode: "Bagikan kode ini ke teman untuk bergabung",
  waitingForPlayers: "Menunggu pemain...",
  readyUp: "Siap",
  notReady: "Belum Siap",
  startQuizButton: "Mulai Kuis",
  needPlayers: "Perlu 2+ Pemain",
  leaveRoom: "Tinggalkan Ruangan",
  roomCode: "Kode Ruangan",
  players: "Pemain",
  liveLeaderboard: "PERINGKAT LANGSUNG",
  questionNumber: "Soal {current}/{total}",
  getReady: "Bersiaplah...",

  // Rewards
  rewardsCenter: "Pusat Hadiah",
  claimRewards: "Klaim hadiah Anda dan coba keberuntungan",
  tryYourLuck: "Coba keberuntungan Anda",
  dailyLoginRewards: "Hadiah Login Harian",
  spinTheWheel: "Putar Roda",
  spinForFree: "Putar Gratis!",
  nextFreeSpin: "Putaran gratis berikutnya dalam {hours} jam",
  mysteryChests: "Peti Misteri",
  openChests: "Buka peti untuk mendapatkan koin, XP, dan item eksklusif!",
  buyMoreChests: "Beli Lebih Banyak Peti",
  weeklyChallengeProgress: "Kemajuan Tantangan Mingguan",

  // Admin
  adminDashboard: "Dasbor Admin",
  categoryManagement: "Manajemen Kategori",
  userManagement: "Manajemen Pengguna",
  questionBank: "Bank Soal",
  reviewQueue: "Antrian Review",
  analyticsDashboard: "Dasbor Analitik",
  totalUsers: "Total Pengguna",
  activeToday: "Aktif Hari Ini",
  questions: "Soal",
  quizzesTaken: "Kuis Diikerjakan",
  quickActions: "Aksi Cepat",
  generateQuestions: "Buat Soal",
  manageCategories: "Kelola Kategori",
  recentActivityAdmin: "Aktivitas Terbaru",
  topCategories: "Kategori Teratas",
  systemStatus: "Status Sistem",
  operational: "Beroperasi",
  searchUsers: "Cari pengguna...",
  allRoles: "Semua Peran",
  admin: "Admin",
  reviewer: "Reviewer",
  user: "Pengguna",
  active: "Aktif",
  suspended: "Ditangguhkan",
  pending: "Menunggu",
  suspend: "Tangguhkan",
  activate: "Aktifkan",
  searchQuestions: "Cari soal...",
  allDifficulties: "Semua Tingkat",
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
  allStatus: "Semua Status",
  published: "Diterbitkan",
  draft: "Draf",
  rejected: "Ditolak",
  viewDetails: "Lihat",
  publish: "Terbit",
  userGrowth: "Pertumbuhan Pengguna",
  quizPerformance: "Performa Kuis",
  userRetention: "Retensi Pengguna",
  geographicDistribution: "Distribusi Geografis",
  topUsers: "Pengguna Teratas berdasarkan XP",
  last7Days: "7 Hari Terakhir",
  last30Days: "30 Hari Terakhir",
  allTime: "Sepanjang Masa",

  // Settings
  language: "Bahasa",
  notifications: "Notifikasi",
  privacy: "Privasi",
  about: "Tentang",
  help: "Bantuan",
  feedback: "Umpan Balik",

  // Auth
  signIn: "Masuk",
  signUp: "Daftar",
  email: "Email",
  password: "Kata Sandi",
  forgotPassword: "Lupa Kata Sandi?",
  dontHaveAccount: "Belum punya akun?",
  alreadyHaveAccount: "Sudah punya akun?",
  orContinueWith: "Atau lanjutkan dengan",
}

// Hausa translations
const haTranslations: Translations = {
  // Common
  welcome: "Barka da zuwa",
  welcomeBack: "Barka da dawowa",
  loading: "Ana lodawa...",
  save: "Ajiye",
  cancel: "Soke",
  delete: "Share",
  edit: "Gyara",
  close: "Rufe",
  back: "Baya",
  next: "Na gaba",
  continue: "Ci gaba",
  confirm: "Tabbatar",
  success: "Nasara",
  error: "Kuskure",

  // Navigation
  home: "Gida",
  learning: "Koyo",
  rankings: "Matsayi",
  shop: "Shago",
  profile: "Bayani",
  settings: "Saitunan",
  logout: "Fita",

  // Home Dashboard
  todayProgress: "Ci gaban Yau",
  xpGained: "XP da Aka Samu",
  focusLevel: "Matakin Mayar da Hankali",
  inProgress: "Ana Ci Gaba",
  lessonOf: "Darasi {current} na {total}",
  minsRemaining: "Sauran mintuna {mins}",
  complete: "An kammala kashi {percent}%",
  completedLabel: "An Kammala",
  prayerTimes: "Lokutan Sallah",
  dailyMission: "Manufar Yau",
  continueButton: "CI GABA",

  // Quiz
  question: "Tambaya",
  of: "na",
  timeRemaining: "Lokacin da Ya Rage",
  submit: "Mika",
  nextQuestion: "Tambaya ta Gaba",
  correct: "Daidai ne!",
  incorrect: "Ba Daidai Ba",
  explanation: "Bayani",
  pointsEarned: "+{points} XP",
  quizComplete: "An Kammala Jarabawa!",
  score: "Maki",
  accuracy: "Daidaito",
  tryAgain: "Sake Gwadawa",
  questionsBeingPrepared: "Ana shirya tambayoyi don rukunin \u201c{category}\u201d.",
  backToCategories: "Koma zuwa Rukunoni",
  xpThisRound: "XP na wannan zagaye",
  coinsWord: "Tsabar Kudi",
  bestTotal: "Jimlar Mafi Kyau",
  playAgain: "Sake Wasa",
  couldNotLoadQuestion: "Ba a iya loda tambaya ba",
  exitQuiz: "Fita Jarabawa",
  streakWord: "jere",
  roundXp: "XP na Zagaye",
  whyItsRight: "Me ya sa daidai ne",
  sourceLabel: "Tushe",
  streakBonus: "Karin jere {multiplier}\u00d7",
  lifelineFiftyFifty: "50/50",
  lifelineFiftyFiftyDesc: "Cire amsoshi biyu marasa daidai",
  lifelineAskImam: "Tambayi Limami",
  lifelineAskImamDesc: "Samu shawara",
  lifelineSkip: "Tsallake",
  lifelineSkipDesc: "Tsallake zuwa tambaya ta gaba",
  lifelineDoublePoints: "Ninki Maki 2",
  lifelineDoublePointsDesc: "Ninka maki don wannan tambaya",
  lifelineTimeBoost: "Karin Lokaci",
  lifelineTimeBoostDesc: "Kara dakika 15",

  // Categories
  knowledgeCategories: "Rukunin Ilimi",
  categories: "Rukunoni",
  questionsAvailable: "tambayoyi akwai",
  questionsAnswered: "tambayoyin da aka amsa",
  progress: "Ci gaba",
  startQuiz: "Fara Jarabawa",
  comingSoon: "Ana Zuwa",

  // Leaderboard
  communityLeaderboard: "Jerin Fitattu na Al'umma",
  seeWhoIsLeading: "Duba wanda ke jagorantar neman ilimi",
  yourRanking: "Matsayinka",
  keepLearning: "Ci gaba da koyo don hawa sama!",
  weeklyRankings: "Matsayi na Mako-mako",
  dailyRankings: "Matsayi na Yau da Kullum",
  monthlyRankings: "Matsayi na Wata-wata",
  allTimeRankings: "Matsayi na Dukan Lokaci",

  // Profile
  overview: "Bayyani",
  achievements: "Nasarori",
  statistics: "Kididdiga",
  activity: "Ayyuka",
  totalXp: "Jimlar XP",
  dayStreak: "Kwanakin Jere",
  globalRank: "Matsayi na Duniya",
  progressTo: "Ci gaba zuwa Mataki {level}",
  learningProgress: "Ci Gaban Koyo",
  recentAchievements: "Nasarorin Kwanan Nan",
  categoryPerformance: "Aikin Kowane Rukuni",
  learningStreaks: "Jerin Koyo",
  currentStreak: "Jerin Yanzu",
  longestStreak: "Mafi Tsawon Jere",
  totalActiveDays: "Jimlar Kwanakin Aiki",
  recentActivity: "Ayyukan Kwanan Nan",

  // Store
  ilmStore: "Shagon ILM",
  enhanceLearning: "Inganta tafiyar koyonka",
  lifelines: "Taimako",
  powerups: "Karfafawa",
  cosmetics: "Kayan Ado",
  bundles: "Fakiti",
  chests: "Akwatuna",
  buy: "Saya",
  owned: "Mallakarka",
  specialOffer: "Tayi na Musamman: Ninki Biyu na Tsabar Kudi!",
  limitedTime: "LOKACI KADAN",

  // Achievements
  achievementsAndChallenges: "Nasarori & Kalubale",
  trackProgress: "Bibiyi ci gabanka ka sami lada",
  unlocked: "AN BUDE",
  xpEarned: "XP DA AKA SAMU",
  activeChallenges: "KALUBALE MASU AIKI",
  weeklyChallenge: "Kalubalen Mako",
  monthMaster: "Gwanin Wata",
  quizMarathon: "Gasar Jarabawa",
  daysLeft: "Sauran kwanaki {days}",

  // Community
  communityHub: "Cibiyar Al'umma",
  connectLearnGrow: "Hada kai, koyo, da bunkasa tare",
  studyGroups: "Kungiyoyin Karatu",
  forum: "Dandali",
  challenges: "Kalubale",
  mentorship: "Ba da Shawara",
  activeLearners: "MASU KOYO MASU AIKI",
  studyGroupsCount: "KUNGIYOYIN KARATU",
  forumPosts: "SAKON DANDALI",
  activeChallengesCount: "KALUBALE MASU AIKI",
  startDiscussion: "Fara Tattaunawa",
  joinGroup: "Shiga Kungiya",
  viewDiscussions: "Duba Tattaunawa",
  becomeAMentor: "Zama Mai Ba da Shawara",
  findAMENTor: "Nemo Mai Ba da Shawara",
  applyToBe: "Nema Zama Mai Ba da Shawara",
  browseMentors: "Duba Masu Ba da Shawara",

  // Multiplayer
  multiplayerQuiz: "Jarabawa ta Jama'a",
  competeWithFriends: "Yi Gasa da Abokai a Ainihin Lokaci",
  createRoom: "Kirkiri Daki",
  joinRoom: "Shiga Daki",
  enterRoomCode: "Shigar da Lambar Daki",
  hostQuiz: "Karbi Bakuncin Jarabawa ga Abokanka",
  shareCode: "Raba wannan lambar da abokai domin su shiga",
  waitingForPlayers: "Ana Jiran 'Yan Wasa...",
  readyUp: "Shirya",
  notReady: "Ban Shirya Ba",
  startQuizButton: "Fara Jarabawa",
  needPlayers: "Ana Bukatar 'Yan Wasa 2+",
  leaveRoom: "Bar Daki",
  roomCode: "Lambar Daki",
  players: "'Yan Wasa",
  liveLeaderboard: "JERIN FITATTU KAI TSAYE",
  questionNumber: "Tambaya {current}/{total}",
  getReady: "Ku Shirya...",

  // Rewards
  rewardsCenter: "Cibiyar Ladan",
  claimRewards: "Karbi Ladan Ka Ka Gwada Sa'arka",
  tryYourLuck: "Gwada Sa'arka",
  dailyLoginRewards: "Ladan Shiga na Yau da Kullum",
  spinTheWheel: "Juya Dabaran",
  spinForFree: "Juya Kyauta!",
  nextFreeSpin: "Juyi na gaba na kyauta cikin awa {hours}",
  mysteryChests: "Akwatunan Asiri",
  openChests: "Bude akwatuna don samun tsabar kudi, XP, da abubuwa na musamman!",
  buyMoreChests: "Sayi Karin Akwatuna",
  weeklyChallengeProgress: "Ci Gaban Kalubalen Mako",

  // Admin
  adminDashboard: "Dashboard na Admin",
  categoryManagement: "Sarrafa Rukuni",
  userManagement: "Sarrafa Masu Amfani",
  questionBank: "Ma'ajin Tambayoyi",
  reviewQueue: "Jerin Bitar",
  analyticsDashboard: "Dashboard na Nazari",
  totalUsers: "Jimlar Masu Amfani",
  activeToday: "Masu Aiki Yau",
  questions: "Tambayoyi",
  quizzesTaken: "Jarabawowin da Aka Yi",
  quickActions: "Ayyuka Cikin Sauri",
  generateQuestions: "Kirkiri Tambayoyi",
  manageCategories: "Sarrafa Rukunoni",
  recentActivityAdmin: "Ayyukan Kwanan Nan",
  topCategories: "Manyan Rukunoni",
  systemStatus: "Halin Tsarin",
  operational: "Yana Aiki",
  searchUsers: "Nemo masu amfani...",
  allRoles: "Dukan Matsayi",
  admin: "Admin",
  reviewer: "Mai Bita",
  user: "Mai Amfani",
  active: "Yana Aiki",
  suspended: "An Dakatar",
  pending: "Ana Jira",
  suspend: "Dakatar",
  activate: "Kunna",
  searchQuestions: "Nemo tambayoyi...",
  allDifficulties: "Dukan Matakan Wahala",
  easy: "Sauki",
  medium: "Matsakaici",
  hard: "Wahala",
  allStatus: "Dukan Hali",
  published: "An Buga",
  draft: "Dirafti",
  rejected: "An Ki",
  viewDetails: "Duba",
  publish: "Buga",
  userGrowth: "Bunkasar Masu Amfani",
  quizPerformance: "Aikin Jarabawa",
  userRetention: "Rikon Masu Amfani",
  geographicDistribution: "Rarraba Yanki",
  topUsers: "Manyan Masu Amfani ta XP",
  last7Days: "Kwanaki 7 da Suka Wuce",
  last30Days: "Kwanaki 30 da Suka Wuce",
  allTime: "Dukan Lokaci",

  // Settings
  language: "Harshe",
  notifications: "Sanarwa",
  privacy: "Sirri",
  about: "Game da",
  help: "Taimako",
  feedback: "Ra'ayi",

  // Auth
  signIn: "Shiga",
  signUp: "Yi Rijista",
  email: "Imel",
  password: "Kalmar Sirri",
  forgotPassword: "Ka Manta Kalmar Sirri?",
  dontHaveAccount: "Ba ka da asusu?",
  alreadyHaveAccount: "Kana da asusu?",
  orContinueWith: "Ko ci gaba da",
}

// French translations
const frTranslations: Translations = {
  // Common
  welcome: "Bienvenue",
  welcomeBack: "Content de vous revoir",
  loading: "Chargement...",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  close: "Fermer",
  back: "Retour",
  next: "Suivant",
  continue: "Continuer",
  confirm: "Confirmer",
  success: "Succès",
  error: "Erreur",

  // Navigation
  home: "Accueil",
  learning: "Apprentissage",
  rankings: "Classements",
  shop: "Boutique",
  profile: "Profil",
  settings: "Paramètres",
  logout: "Déconnexion",

  // Home Dashboard
  todayProgress: "Progrès du jour",
  xpGained: "XP gagnés",
  focusLevel: "Niveau de concentration",
  inProgress: "En cours",
  lessonOf: "Leçon {current} sur {total}",
  minsRemaining: "{mins} min restantes",
  complete: "{percent} % terminé",
  completedLabel: "Terminé",
  prayerTimes: "Heures de prière",
  dailyMission: "Mission quotidienne",
  continueButton: "CONTINUER",

  // Quiz
  question: "Question",
  of: "sur",
  timeRemaining: "Temps restant",
  submit: "Valider",
  nextQuestion: "Question suivante",
  correct: "Correct !",
  incorrect: "Incorrect",
  explanation: "Explication",
  pointsEarned: "+{points} XP",
  quizComplete: "Quiz terminé !",
  score: "Score",
  accuracy: "Précision",
  tryAgain: "Réessayer",
  questionsBeingPrepared: "Les questions de la cat\u00e9gorie \u00ab\u00a0{category}\u00a0\u00bb sont en pr\u00e9paration.",
  backToCategories: "Retour aux cat\u00e9gories",
  xpThisRound: "XP de cette manche",
  coinsWord: "Pi\u00e8ces",
  bestTotal: "Meilleur total",
  playAgain: "Rejouer",
  couldNotLoadQuestion: "Impossible de charger la question",
  exitQuiz: "Quitter le quiz",
  streakWord: "s\u00e9rie",
  roundXp: "XP de la manche",
  whyItsRight: "Pourquoi c'est correct",
  sourceLabel: "Source",
  streakBonus: "Bonus de s\u00e9rie {multiplier}\u00d7",
  lifelineFiftyFifty: "50/50",
  lifelineFiftyFiftyDesc: "Retirer deux mauvaises r\u00e9ponses",
  lifelineAskImam: "Demander \u00e0 l'imam",
  lifelineAskImamDesc: "Obtenir un indice utile",
  lifelineSkip: "Passer",
  lifelineSkipDesc: "Passer \u00e0 la question suivante",
  lifelineDoublePoints: "Points x2",
  lifelineDoublePointsDesc: "Doubler les points pour cette question",
  lifelineTimeBoost: "Temps+",
  lifelineTimeBoostDesc: "Ajouter 15 secondes",

  // Categories
  knowledgeCategories: "Catégories de connaissances",
  categories: "Catégories",
  questionsAvailable: "questions disponibles",
  questionsAnswered: "questions répondues",
  progress: "Progression",
  startQuiz: "Commencer le quiz",
  comingSoon: "Bientôt disponible",

  // Leaderboard
  communityLeaderboard: "Classement de la communauté",
  seeWhoIsLeading: "Découvrez qui mène la quête du savoir",
  yourRanking: "Votre classement",
  keepLearning: "Continuez à apprendre pour monter plus haut !",
  weeklyRankings: "Classement hebdomadaire",
  dailyRankings: "Classement quotidien",
  monthlyRankings: "Classement mensuel",
  allTimeRankings: "Classement général",

  // Profile
  overview: "Aperçu",
  achievements: "Succès",
  statistics: "Statistiques",
  activity: "Activité",
  totalXp: "XP total",
  dayStreak: "Série de jours",
  globalRank: "Classement mondial",
  progressTo: "Progression vers le niveau {level}",
  learningProgress: "Progrès d'apprentissage",
  recentAchievements: "Succès récents",
  categoryPerformance: "Performance par catégorie",
  learningStreaks: "Séries d'apprentissage",
  currentStreak: "Série actuelle",
  longestStreak: "Plus longue série",
  totalActiveDays: "Jours actifs au total",
  recentActivity: "Activité récente",

  // Store
  ilmStore: "Boutique ILM",
  enhanceLearning: "Améliorez votre parcours d'apprentissage",
  lifelines: "Aides",
  powerups: "Bonus",
  cosmetics: "Cosmétiques",
  bundles: "Packs",
  chests: "Coffres",
  buy: "Acheter",
  owned: "Possédé",
  specialOffer: "Offre spéciale : pièces x2 !",
  limitedTime: "DURÉE LIMITÉE",

  // Achievements
  achievementsAndChallenges: "Succès et défis",
  trackProgress: "Suivez votre progression et gagnez des récompenses",
  unlocked: "DÉBLOQUÉS",
  xpEarned: "XP GAGNÉS",
  activeChallenges: "DÉFIS ACTIFS",
  weeklyChallenge: "Défi hebdomadaire",
  monthMaster: "Maître du mois",
  quizMarathon: "Marathon de quiz",
  daysLeft: "{days} jours restants",

  // Community
  communityHub: "Espace communauté",
  connectLearnGrow: "Connectez-vous, apprenez et progressez ensemble",
  studyGroups: "Groupes d'étude",
  forum: "Forum",
  challenges: "Défis",
  mentorship: "Mentorat",
  activeLearners: "APPRENANTS ACTIFS",
  studyGroupsCount: "GROUPES D'ÉTUDE",
  forumPosts: "MESSAGES DU FORUM",
  activeChallengesCount: "DÉFIS ACTIFS",
  startDiscussion: "Démarrer une discussion",
  joinGroup: "Rejoindre le groupe",
  viewDiscussions: "Voir les discussions",
  becomeAMentor: "Devenir mentor",
  findAMENTor: "Trouver un mentor",
  applyToBe: "Postuler comme mentor",
  browseMentors: "Parcourir les mentors",

  // Multiplayer
  multiplayerQuiz: "Quiz multijoueur",
  competeWithFriends: "Affrontez vos amis en temps réel",
  createRoom: "Créer une salle",
  joinRoom: "Rejoindre une salle",
  enterRoomCode: "Entrez le code de la salle",
  hostQuiz: "Organisez un quiz pour vos amis",
  shareCode: "Partagez ce code avec vos amis pour qu'ils rejoignent",
  waitingForPlayers: "En attente de joueurs...",
  readyUp: "Prêt",
  notReady: "Pas prêt",
  startQuizButton: "Démarrer le quiz",
  needPlayers: "Il faut 2 joueurs ou plus",
  leaveRoom: "Quitter la salle",
  roomCode: "Code de la salle",
  players: "Joueurs",
  liveLeaderboard: "CLASSEMENT EN DIRECT",
  questionNumber: "Question {current}/{total}",
  getReady: "Préparez-vous...",

  // Rewards
  rewardsCenter: "Centre de récompenses",
  claimRewards: "Réclamez vos récompenses et tentez votre chance",
  tryYourLuck: "Tentez votre chance",
  dailyLoginRewards: "Récompenses de connexion quotidienne",
  spinTheWheel: "Tourner la roue",
  spinForFree: "Tournez gratuitement !",
  nextFreeSpin: "Prochain tour gratuit dans {hours} heures",
  mysteryChests: "Coffres mystères",
  openChests: "Ouvrez des coffres pour gagner des pièces, de l'XP et des objets exclusifs !",
  buyMoreChests: "Acheter plus de coffres",
  weeklyChallengeProgress: "Progression du défi hebdomadaire",

  // Admin
  adminDashboard: "Tableau de bord admin",
  categoryManagement: "Gestion des catégories",
  userManagement: "Gestion des utilisateurs",
  questionBank: "Banque de questions",
  reviewQueue: "File de révision",
  analyticsDashboard: "Tableau de bord analytique",
  totalUsers: "Utilisateurs au total",
  activeToday: "Actifs aujourd'hui",
  questions: "Questions",
  quizzesTaken: "Quiz réalisés",
  quickActions: "Actions rapides",
  generateQuestions: "Générer des questions",
  manageCategories: "Gérer les catégories",
  recentActivityAdmin: "Activité récente",
  topCategories: "Catégories principales",
  systemStatus: "État du système",
  operational: "Opérationnel",
  searchUsers: "Rechercher des utilisateurs...",
  allRoles: "Tous les rôles",
  admin: "Admin",
  reviewer: "Réviseur",
  user: "Utilisateur",
  active: "Actif",
  suspended: "Suspendu",
  pending: "En attente",
  suspend: "Suspendre",
  activate: "Activer",
  searchQuestions: "Rechercher des questions...",
  allDifficulties: "Toutes les difficultés",
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  allStatus: "Tous les statuts",
  published: "Publié",
  draft: "Brouillon",
  rejected: "Rejeté",
  viewDetails: "Voir",
  publish: "Publier",
  userGrowth: "Croissance des utilisateurs",
  quizPerformance: "Performance des quiz",
  userRetention: "Rétention des utilisateurs",
  geographicDistribution: "Répartition géographique",
  topUsers: "Meilleurs utilisateurs par XP",
  last7Days: "7 derniers jours",
  last30Days: "30 derniers jours",
  allTime: "Depuis toujours",

  // Settings
  language: "Langue",
  notifications: "Notifications",
  privacy: "Confidentialité",
  about: "À propos",
  help: "Aide",
  feedback: "Commentaires",

  // Auth
  signIn: "Se connecter",
  signUp: "S'inscrire",
  email: "E-mail",
  password: "Mot de passe",
  forgotPassword: "Mot de passe oublié ?",
  dontHaveAccount: "Pas de compte ?",
  alreadyHaveAccount: "Déjà un compte ?",
  orContinueWith: "Ou continuer avec",
}

// Arabic translations (RTL)
const arTranslations: Translations = {
  // Common
  welcome: "مرحباً",
  welcomeBack: "أهلاً بعودتك",
  loading: "جارٍ التحميل...",
  save: "حفظ",
  cancel: "إلغاء",
  delete: "حذف",
  edit: "تعديل",
  close: "إغلاق",
  back: "رجوع",
  next: "التالي",
  continue: "متابعة",
  confirm: "تأكيد",
  success: "نجاح",
  error: "خطأ",

  // Navigation
  home: "الرئيسية",
  learning: "التعلّم",
  rankings: "الترتيب",
  shop: "المتجر",
  profile: "الملف الشخصي",
  settings: "الإعدادات",
  logout: "تسجيل الخروج",

  // Home Dashboard
  todayProgress: "تقدّم اليوم",
  xpGained: "نقاط الخبرة المكتسبة",
  focusLevel: "مستوى التركيز",
  inProgress: "قيد التقدم",
  lessonOf: "الدرس {current} من {total}",
  minsRemaining: "بقي {mins} دقيقة",
  complete: "اكتمل بنسبة {percent}%",
  completedLabel: "مكتمل",
  prayerTimes: "مواقيت الصلاة",
  dailyMission: "المهمة اليومية",
  continueButton: "متابعة",

  // Quiz
  question: "سؤال",
  of: "من",
  timeRemaining: "الوقت المتبقي",
  submit: "إرسال",
  nextQuestion: "السؤال التالي",
  correct: "إجابة صحيحة!",
  incorrect: "إجابة خاطئة",
  explanation: "التوضيح",
  pointsEarned: "+{points} نقطة خبرة",
  quizComplete: "اكتمل الاختبار!",
  score: "النتيجة",
  accuracy: "الدقة",
  tryAgain: "حاول مرة أخرى",
  questionsBeingPrepared: "يتم إعداد أسئلة فئة \u201c{category}\u201d.",
  backToCategories: "العودة إلى الفئات",
  xpThisRound: "نقاط الخبرة لهذه الجولة",
  coinsWord: "العملات",
  bestTotal: "أفضل مجموع",
  playAgain: "العب مرة أخرى",
  couldNotLoadQuestion: "تعذّر تحميل السؤال",
  exitQuiz: "الخروج من الاختبار",
  streakWord: "سلسلة",
  roundXp: "نقاط خبرة الجولة",
  whyItsRight: "لماذا هذا صحيح",
  sourceLabel: "المصدر",
  streakBonus: "مكافأة سلسلة {multiplier}\u00d7",
  lifelineFiftyFifty: "50/50",
  lifelineFiftyFiftyDesc: "إزالة إجابتين خاطئتين",
  lifelineAskImam: "اسأل الإمام",
  lifelineAskImamDesc: "احصل على تلميح مفيد",
  lifelineSkip: "تخطي",
  lifelineSkipDesc: "الانتقال إلى السؤال التالي",
  lifelineDoublePoints: "مضاعفة النقاط",
  lifelineDoublePointsDesc: "مضاعفة النقاط لهذا السؤال",
  lifelineTimeBoost: "وقت إضافي",
  lifelineTimeBoostDesc: "أضف 15 ثانية",

  // Categories
  knowledgeCategories: "فئات المعرفة",
  categories: "الفئات",
  questionsAvailable: "أسئلة متاحة",
  questionsAnswered: "أسئلة تمت الإجابة عنها",
  progress: "التقدم",
  startQuiz: "ابدأ الاختبار",
  comingSoon: "قريباً",

  // Leaderboard
  communityLeaderboard: "لوحة صدارة المجتمع",
  seeWhoIsLeading: "تعرّف على من يتصدر رحلة طلب العلم",
  yourRanking: "ترتيبك",
  keepLearning: "واصل التعلم لترتقي أعلى!",
  weeklyRankings: "الترتيب الأسبوعي",
  dailyRankings: "الترتيب اليومي",
  monthlyRankings: "الترتيب الشهري",
  allTimeRankings: "الترتيب العام",

  // Profile
  overview: "نظرة عامة",
  achievements: "الإنجازات",
  statistics: "الإحصائيات",
  activity: "النشاط",
  totalXp: "إجمالي نقاط الخبرة",
  dayStreak: "أيام متتالية",
  globalRank: "الترتيب العالمي",
  progressTo: "التقدم نحو المستوى {level}",
  learningProgress: "تقدّم التعلم",
  recentAchievements: "الإنجازات الأخيرة",
  categoryPerformance: "أداء الفئات",
  learningStreaks: "سلاسل التعلم",
  currentStreak: "السلسلة الحالية",
  longestStreak: "أطول سلسلة",
  totalActiveDays: "إجمالي أيام النشاط",
  recentActivity: "النشاط الأخير",

  // Store
  ilmStore: "متجر علم",
  enhanceLearning: "طوّر رحلتك التعليمية",
  lifelines: "وسائل المساعدة",
  powerups: "التعزيزات",
  cosmetics: "عناصر تزيينية",
  bundles: "الحزم",
  chests: "الصناديق",
  buy: "شراء",
  owned: "مملوك",
  specialOffer: "عرض خاص: ضعف العملات!",
  limitedTime: "لوقت محدود",

  // Achievements
  achievementsAndChallenges: "الإنجازات والتحديات",
  trackProgress: "تابع تقدّمك واكسب المكافآت",
  unlocked: "مفتوحة",
  xpEarned: "نقاط الخبرة المكتسبة",
  activeChallenges: "التحديات النشطة",
  weeklyChallenge: "التحدي الأسبوعي",
  monthMaster: "بطل الشهر",
  quizMarathon: "ماراثون الاختبارات",
  daysLeft: "تبقّى {days} أيام",

  // Community
  communityHub: "مركز المجتمع",
  connectLearnGrow: "تواصل، وتعلّم، وانمُ معاً",
  studyGroups: "مجموعات الدراسة",
  forum: "المنتدى",
  challenges: "التحديات",
  mentorship: "الإرشاد",
  activeLearners: "متعلمون نشطون",
  studyGroupsCount: "مجموعات الدراسة",
  forumPosts: "منشورات المنتدى",
  activeChallengesCount: "التحديات النشطة",
  startDiscussion: "ابدأ نقاشاً",
  joinGroup: "انضم إلى المجموعة",
  viewDiscussions: "عرض النقاشات",
  becomeAMentor: "كن مرشداً",
  findAMENTor: "ابحث عن مرشد",
  applyToBe: "قدّم طلباً لتكون مرشداً",
  browseMentors: "تصفح المرشدين",

  // Multiplayer
  multiplayerQuiz: "اختبار جماعي",
  competeWithFriends: "نافس أصدقاءك مباشرةً",
  createRoom: "إنشاء غرفة",
  joinRoom: "الانضمام إلى غرفة",
  enterRoomCode: "أدخل رمز الغرفة",
  hostQuiz: "استضف اختباراً لأصدقائك",
  shareCode: "شارك هذا الرمز مع أصدقائك للانضمام",
  waitingForPlayers: "بانتظار اللاعبين...",
  readyUp: "جاهز",
  notReady: "غير جاهز",
  startQuizButton: "ابدأ الاختبار",
  needPlayers: "يلزم لاعبان أو أكثر",
  leaveRoom: "مغادرة الغرفة",
  roomCode: "رمز الغرفة",
  players: "اللاعبون",
  liveLeaderboard: "لوحة الصدارة المباشرة",
  questionNumber: "السؤال {current}/{total}",
  getReady: "استعدّ...",

  // Rewards
  rewardsCenter: "مركز المكافآت",
  claimRewards: "احصل على مكافآتك وجرّب حظك",
  tryYourLuck: "جرّب حظك",
  dailyLoginRewards: "مكافآت الدخول اليومي",
  spinTheWheel: "أدر العجلة",
  spinForFree: "أدرها مجاناً!",
  nextFreeSpin: "الدورة المجانية التالية بعد {hours} ساعة",
  mysteryChests: "صناديق الغموض",
  openChests: "افتح الصناديق لتكسب العملات ونقاط الخبرة وعناصر حصرية!",
  buyMoreChests: "شراء المزيد من الصناديق",
  weeklyChallengeProgress: "تقدّم التحدي الأسبوعي",

  // Admin
  adminDashboard: "لوحة تحكم المشرف",
  categoryManagement: "إدارة الفئات",
  userManagement: "إدارة المستخدمين",
  questionBank: "بنك الأسئلة",
  reviewQueue: "قائمة المراجعة",
  analyticsDashboard: "لوحة التحليلات",
  totalUsers: "إجمالي المستخدمين",
  activeToday: "نشط اليوم",
  questions: "الأسئلة",
  quizzesTaken: "الاختبارات المُجراة",
  quickActions: "إجراءات سريعة",
  generateQuestions: "توليد أسئلة",
  manageCategories: "إدارة الفئات",
  recentActivityAdmin: "النشاط الأخير",
  topCategories: "أفضل الفئات",
  systemStatus: "حالة النظام",
  operational: "يعمل بكفاءة",
  searchUsers: "ابحث عن مستخدمين...",
  allRoles: "جميع الأدوار",
  admin: "مشرف",
  reviewer: "مراجع",
  user: "مستخدم",
  active: "نشط",
  suspended: "موقوف",
  pending: "قيد الانتظار",
  suspend: "إيقاف",
  activate: "تفعيل",
  searchQuestions: "ابحث عن أسئلة...",
  allDifficulties: "جميع المستويات",
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
  allStatus: "جميع الحالات",
  published: "منشور",
  draft: "مسودة",
  rejected: "مرفوض",
  viewDetails: "عرض",
  publish: "نشر",
  userGrowth: "نمو المستخدمين",
  quizPerformance: "أداء الاختبارات",
  userRetention: "الاحتفاظ بالمستخدمين",
  geographicDistribution: "التوزيع الجغرافي",
  topUsers: "أفضل المستخدمين حسب نقاط الخبرة",
  last7Days: "آخر 7 أيام",
  last30Days: "آخر 30 يوماً",
  allTime: "كل الأوقات",

  // Settings
  language: "اللغة",
  notifications: "الإشعارات",
  privacy: "الخصوصية",
  about: "حول",
  help: "المساعدة",
  feedback: "ملاحظات",

  // Auth
  signIn: "تسجيل الدخول",
  signUp: "إنشاء حساب",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  forgotPassword: "هل نسيت كلمة المرور؟",
  dontHaveAccount: "ليس لديك حساب؟",
  alreadyHaveAccount: "لديك حساب بالفعل؟",
  orContinueWith: "أو تابع باستخدام",
}

/**
 * Translation status:
 * - en (English): Complete
 * - ms (Bahasa Malaysia): Complete
 * - id (Bahasa Indonesia): Complete
 * - ha (Hausa): Complete
 * - fr (French): Complete
 * - ar (Arabic): Complete - RTL, applied via LanguageContext's `dir`
 */
export const translations: Record<Locale, Translations> = {
  en: enTranslations,
  ha: haTranslations,
  fr: frTranslations,
  ar: arTranslations,
  ms: msTranslations,
  id: idTranslations,
}

// Translation function with interpolation
export function t(key: keyof Translations, locale: Locale, params?: Record<string, string | number>): string {
  const translation = translations[locale]?.[key] || translations.en[key] || key

  if (!params) return translation

  return Object.entries(params).reduce(
    (result, [param, value]) => result.replace(new RegExp(`\\{${param}\\}`, "g"), String(value)),
    translation
  )
}
