"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, Users, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { RANKS } from "@/lib/constants"

export default function FeatureShowcase() {
  const [hoveredRank, setHoveredRank] = useState<string | null>(null)

  const categories = [
    "Quran & Tafsir",
    "Hadith & Sunnah",
    "Fiqh & Jurisprudence",
    "Islamic History",
    "Aqeedah & Theology",
    "Seerah",
    "Arabic Language",
    "Islamic Ethics",
    "Contemporary Issues",
    "Comparative Religion",
    "Islamic Finance",
    "Family & Society",
  ]

  const features = [
    {
      title: "Comprehensive Learning",
      description: "Master 25 categories of Islamic knowledge with thousands of carefully curated questions",
      icon: BookOpen,
      progress: 68,
      gradient: "from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Gamified Experience",
      description: "Earn coins, maintain streaks, and unlock achievements as you progress through your journey",
      icon: Trophy,
      stats: [
        { value: "1,247", label: "Coins", color: "text-accent" },
        { value: "15", label: "Day Streak", color: "text-orange-600" },
        { value: "23", label: "Badges", color: "text-purple-600" },
      ],
      gradient: "from-yellow-50 to-yellow-100/50",
      border: "border-yellow-200",
      iconBg: "bg-yellow-500",
    },
    {
      title: "Community Learning",
      description: "Join study groups, compete in challenges, and learn alongside fellow Muslims worldwide",
      icon: Users,
      community: "+2.4k active learners",
      gradient: "from-blue-50 to-blue-100/50",
      border: "border-blue-200",
      iconBg: "bg-blue-500",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Scholarly Progression */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Your Scholarly Progression
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
          Advance through nine levels of Islamic scholarship, each representing deeper knowledge and understanding
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 max-w-6xl mx-auto">
          {RANKS.map((rank, index) => (
            <motion.div
              key={rank.title}
              className="text-center relative"
              onMouseEnter={() => setHoveredRank(rank.title)}
              onMouseLeave={() => setHoveredRank(null)}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className={`w-16 h-16 rounded-full ${rank.theme.replace('text-', 'bg-').replace('-500', '-100')} flex items-center justify-center mb-2 mx-auto relative transition-all duration-300 shadow-md hover:shadow-lg`}
                aria-label={`Rank ${rank.title} - Level ${rank.level}`}
              >
                <span className={`font-bold text-lg ${rank.theme}`}>{rank.level}</span>
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">{rank.title}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className={`bg-gradient-to-br ${feature.gradient} ${feature.border} hover:shadow-xl transition-shadow duration-300`}>
              <CardHeader>
                <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {feature.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                  </div>
                )}
                {feature.stats && (
                  <div className="flex items-center gap-4">
                    {feature.stats.map((stat) => (
                      <div key={stat.label} className="text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {feature.community && (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{feature.community}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Knowledge Categories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
          Explore 25 Knowledge Categories
        </h3>
        <p className="text-muted-foreground mb-8 text-lg">
          Dive into diverse aspects of Islamic knowledge, from classical texts to contemporary issues
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Badge
                variant="secondary"
                className="p-3 text-center justify-center bg-card/80 hover:bg-emerald-100 border-emerald-200 text-secondary-foreground transition-colors duration-300 cursor-pointer text-sm w-full"
              >
                {category}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
