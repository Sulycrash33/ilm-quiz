
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Star, Clock, Target, Lock, Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const KNOWLEDGE_CATEGORIES = [
  {
    id: 1,
    slug: "allah-names",
    name: "Allah's Names & Attributes",
    icon: "✨",
    description: "Learn the 99 beautiful names of Allah (Asma ul-Husna) with their meanings and context",
    difficulty: "Beginner",
    questions: 150,
    completed: 67,
    mastery: 45,
    unlocked: true,
    estimatedTime: "2-3 hours",
    xpReward: 500,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    topics: ["Asma ul-Husna", "Divine Attributes", "Names in Quran", "Practical Application"],
  },
  {
    id: 2,
    slug: "holy-quran",
    name: "Holy Quran",
    icon: "📖",
    description: "Surahs, verses, themes, memorization, and understanding of the Holy Quran",
    difficulty: "All Levels",
    questions: 300,
    completed: 123,
    mastery: 41,
    unlocked: true,
    estimatedTime: "5-7 hours",
    xpReward: 1000,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    topics: ["Surahs", "Verses", "Themes", "Memorization", "Tafsir", "Revelation Context"],
  },
  {
    id: 3,
    slug: "hadith-sciences",
    name: "Hadith Sciences",
    icon: "📜",
    description: "Prophetic sayings, their authenticity, classification, and practical applications",
    difficulty: "Intermediate",
    questions: 200,
    completed: 45,
    mastery: 23,
    unlocked: true,
    estimatedTime: "4-5 hours",
    xpReward: 750,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    topics: ["Sahih Hadith", "Classification", "Narrators", "Practical Application"],
  },
  {
    id: 4,
    slug: "prophetic-biography",
    name: "Prophetic Biography",
    icon: "⭐",
    description: "Comprehensive life story of Prophet Muhammad (PBUH) with timeline and lessons",
    difficulty: "Beginner",
    questions: 180,
    completed: 134,
    mastery: 74,
    unlocked: true,
    estimatedTime: "3-4 hours",
    xpReward: 600,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    topics: ["Early Life", "Prophethood", "Hijra", "Battles", "Final Years", "Character"],
  },
  {
    id: 5,
    slug: "ahl-al-bayt",
    name: "Ahl al-Bayt",
    icon: "👑",
    description: "Family of the Prophet with respect, reverence, and historical significance",
    difficulty: "Intermediate",
    questions: 120,
    completed: 23,
    mastery: 19,
    unlocked: true,
    estimatedTime: "2-3 hours",
    xpReward: 450,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    topics: ["Family Members", "Historical Role", "Respect & Reverence", "Contributions"],
  },
  {
    id: 6,
    slug: "other-prophets",
    name: "Other Prophets",
    icon: "🌟",
    description: "Stories of all messengers mentioned in Islam with moral lessons and wisdom",
    difficulty: "Beginner",
    questions: 160,
    completed: 89,
    mastery: 56,
    unlocked: true,
    estimatedTime: "3-4 hours",
    xpReward: 550,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    topics: ["Adam", "Noah", "Abraham", "Moses", "Jesus", "Other Messengers"],
  },
  {
    id: 7,
    slug: "companions",
    name: "Companions (Sahaba)",
    icon: "🤝",
    description: "Lives and contributions of the Prophet's companions and their sacrifices",
    difficulty: "Intermediate",
    questions: 140,
    completed: 67,
    mastery: 48,
    unlocked: true,
    estimatedTime: "3-4 hours",
    xpReward: 500,
    color: "bg-green-100 text-green-700 border-green-200",
    topics: ["Four Caliphs", "Ten Promised Paradise", "Women Companions", "Contributions"],
  },
  {
    id: 8,
    slug: "islamic-law",
    name: "Islamic Law (Fiqh)",
    icon: "⚖️",
    description: "Practical religious rulings, jurisprudence, and applications in daily life",
    difficulty: "Advanced",
    questions: 250,
    completed: 34,
    mastery: 14,
    unlocked: true,
    estimatedTime: "6-8 hours",
    xpReward: 900,
    color: "bg-red-100 text-red-700 border-red-200",
    topics: ["Worship", "Transactions", "Family Law", "Criminal Law", "Contemporary Issues"],
  },
  {
    id: 9,
    slug: "creed",
    name: "Creed (Aqeedah)",
    icon: "💎",
    description: "Core beliefs, theological concepts, and fundamental principles of Islamic faith",
    difficulty: "Intermediate",
    questions: 180,
    completed: 56,
    mastery: 31,
    unlocked: true,
    estimatedTime: "4-5 hours",
    xpReward: 650,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    topics: ["Belief in Allah", "Angels", "Books", "Prophets", "Day of Judgment", "Divine Decree"],
  },
  {
    id: 10,
    slug: "five-pillars",
    name: "Five Pillars",
    icon: "🕌",
    description: "Detailed practice and understanding of the fundamental obligations of Islam",
    difficulty: "Beginner",
    questions: 120,
    completed: 107,
    mastery: 89,
    unlocked: true,
    estimatedTime: "2-3 hours",
    xpReward: 400,
    color: "bg-teal-100 text-teal-700 border-teal-200",
    topics: ["Shahada", "Salah", "Zakat", "Sawm", "Hajj"],
  },
  {
    id: 11,
    slug: "afterlife",
    name: "Afterlife (Akhirah)",
    icon: "🌅",
    description: "Death, judgment, paradise, hell, and the eternal life after this world",
    difficulty: "Intermediate",
    questions: 160,
    completed: 23,
    mastery: 14,
    unlocked: true,
    estimatedTime: "3-4 hours",
    xpReward: 600,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    topics: ["Death", "Grave", "Day of Judgment", "Paradise", "Hell", "Resurrection"],
  },
  {
    id: 12,
    slug: "islamic-ethics",
    name: "Islamic Ethics (Akhlaq)",
    icon: "❤️",
    description: "Character development, moral behavior, and ethical principles in Islam",
    difficulty: "Beginner",
    questions: 140,
    completed: 78,
    mastery: 56,
    unlocked: true,
    estimatedTime: "3-4 hours",
    xpReward: 500,
    color: "bg-rose-100 text-rose-700 border-rose-200",
    topics: ["Good Character", "Social Ethics", "Business Ethics", "Family Values"],
  },
]

const COMING_SOON_CATEGORIES = [
  {
    name: "Islamic History",
    icon: "🏛️",
    description: "Comprehensive Islamic civilization and historical events",
    estimatedRelease: "March 2024",
    difficulty: "Intermediate",
    estimatedQuestions: 200,
  },
  {
    name: "Arabic Language",
    icon: "🔤",
    description: "Learn Quranic Arabic and classical language fundamentals",
    estimatedRelease: "April 2024",
    difficulty: "All Levels",
    estimatedQuestions: 300,
  },
  {
    name: "Islamic Finance",
    icon: "💰",
    description: "Halal banking, investments, and economic principles",
    estimatedRelease: "May 2024",
    difficulty: "Advanced",
    estimatedQuestions: 180,
  },
  {
    name: "Women in Islam",
    icon: "👩",
    description: "Rights, roles, and contributions of women in Islamic history",
    estimatedRelease: "June 2024",
    difficulty: "Intermediate",
    estimatedQuestions: 150,
  },
  {
    name: "Contemporary Issues",
    icon: "🌍",
    description: "Modern challenges and Islamic perspectives on current affairs",
    estimatedRelease: "July 2024",
    difficulty: "Advanced",
    estimatedQuestions: 220,
  },
  {
    name: "Islamic Arts & Culture",
    icon: "🎨",
    description: "Calligraphy, architecture, poetry, and cultural expressions",
    estimatedRelease: "August 2024",
    difficulty: "Beginner",
    estimatedQuestions: 160,
  },
  {
    name: "Science in Islam",
    icon: "🔬",
    description: "Islamic contributions to science, medicine, and mathematics",
    estimatedRelease: "September 2024",
    difficulty: "Intermediate",
    estimatedQuestions: 190,
  },
  {
    name: "Sufism & Spirituality",
    icon: "🌙",
    description: "Islamic mysticism, spiritual practices, and inner purification",
    estimatedRelease: "October 2024",
    difficulty: "Advanced",
    estimatedQuestions: 170,
  },
  {
    name: "Interfaith Relations",
    icon: "🤝",
    description: "Islamic approach to dialogue with other faith communities",
    estimatedRelease: "November 2024",
    difficulty: "Advanced",
    estimatedQuestions: 140,
  },
  {
    name: "Sacred Geography",
    icon: "🗺️",
    description: "Holy sites, pilgrimage routes, and Islamic landmarks",
    estimatedRelease: "December 2024",
    difficulty: "Intermediate",
    estimatedQuestions: 130,
  },
  {
    name: "Quran Commentary",
    icon: "📝",
    description: "Advanced Tafsir studies and interpretation methodologies",
    estimatedRelease: "January 2025",
    difficulty: "Advanced",
    estimatedQuestions: 250,
  },
  {
    name: "Miracles & Signs",
    icon: "✨",
    description: "Prophetic miracles and divine signs in Islamic tradition",
    estimatedRelease: "February 2025",
    difficulty: "Intermediate",
    estimatedQuestions: 120,
  },
]

export default function KnowledgeCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const router = useRouter();


  const filteredCategories = KNOWLEDGE_CATEGORIES.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty =
      selectedDifficulty === "all" || category.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
    return matchesSearch && matchesDifficulty
  })

  const handleCategorySelect = (slug: string, unlocked: boolean) => {
    if (!unlocked) return;
    router.push(`/quiz/${slug}`)
  }

  const totalQuestions = KNOWLEDGE_CATEGORIES.reduce((sum, cat) => sum + cat.questions, 0)
  const totalCompleted = KNOWLEDGE_CATEGORIES.reduce((sum, cat) => sum + cat.completed, 0)
  const unlockedCount = KNOWLEDGE_CATEGORIES.filter((cat) => cat.unlocked).length

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild>
          <Link href="/home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Knowledge Categories</h1>
          <p className="text-muted-foreground">Explore 25 areas of Islamic knowledge</p>
        </div>

        <div className="w-40" />
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{unlockedCount}</div>
              <div className="text-sm text-muted-foreground">Categories Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalCompleted}</div>
              <div className="text-sm text-muted-foreground">Questions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {Math.round((totalCompleted / totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {KNOWLEDGE_CATEGORIES.filter((cat) => cat.mastery >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Mastered Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {["all", "beginner", "intermediate", "advanced"].map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              !category.unlocked ? "opacity-60" : "cursor-pointer"
            }`}
            onClick={() => handleCategorySelect(category.slug, category.unlocked)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg leading-tight">{category.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {category.difficulty}
                      </Badge>
                      {category.mastery >= 80 && (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Mastered
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {!category.unlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {category.completed}/{category.questions}
                  </span>
                </div>
                <Progress value={(category.completed / category.questions) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mastery</span>
                  <span className="font-semibold">{category.mastery}%</span>
                </div>
                <Progress value={category.mastery} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {category.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {category.xpReward} XP
                  </span>
                </div>

                {category.unlocked ? (
                  <Button size="sm">
                    <Target className="h-3 w-3 mr-1" />
                    Study
                  </Button>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>

              {/* Topics Preview */}
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">Topics covered:</div>
                <div className="flex flex-wrap gap-1">
                  {category.topics.slice(0, 3).map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {topic}
                    </Badge>
                  ))}
                  {category.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{category.topics.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Categories */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">Exciting new categories in development</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMING_SOON_CATEGORIES.map((category, index) => (
            <Card
              key={index}
              className="border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 opacity-75"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-card-foreground mb-1">{category.name}</h3>
                    <Badge variant="outline" className="text-xs mb-2">
                      {category.difficulty}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{category.description}</p>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Estimated Questions:</span>
                    <span className="font-semibold">{category.estimatedQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Release:</span>
                    <span className="font-semibold text-primary">{category.estimatedRelease}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Badge className="bg-secondary text-secondary-foreground w-full justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

    