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

@
/**
 * Translation status:
 * - en (English): Complete
 * - ms (Bahasa Malaysia): Complete
 * - id (Bahasa Indonesia): Complete
 * - ha (Hausa): Falls back to English - needs translation
 * - fr (French): Falls back to English - needs translation
 * - ar (Arabic): Falls back to English - needs translation + RTL support
 */
export const translations: Record<Locale, Translations> = {
  en: enTranslations,
  ha: enTranslations, // Will be translated later
  fr: enTranslations, // Will be translated later
  ar: enTranslations, // Will be translated later
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
