"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Star,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Target,
  BookOpen,
  Award,
  TrendingUp,
  Settings,
  Edit3,
  Share2,
  Crown,
} from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from 'react-use'
import { SettingsDialog } from "@/components/game/SettingsDialog"

const ACHIEVEMENTS = [
  { name: "First Steps", description: "Completed first quiz", icon: "🌱", earned: true, date: "2024-01-15" },
  { name: "Streak Master", description: "7-day learning streak", icon: "🔥", earned: true, date: "2024-01-20" },
  { name: "Quran Scholar", description: "100 Quran questions correct", icon: "📖", earned: true, date: "2024-01-25" },
  { name: "Community Helper", description: "Helped 10 fellow learners", icon: "🤝", earned: false, date: null },
  { name: "Perfect Score", description: "100% accuracy in a quiz", icon: "💯", earned: true, date: "2024-01-18" },
  { name: "Knowledge Seeker", description: "Completed 5 categories", icon: "🎯", earned: false, date: null },
]

const STATS = [
  { label: "Total Questions", value: "1,247", icon: Target, color: "text-lapis" },
  { label: "Correct Answers", value: "1,084", icon: Trophy, color: "text-jade" },
  { label: "Study Time", value: "42h 15m", icon: Clock, color: "text-amethyst" },
  { label: "Categories Mastered", value: "3/12", icon: BookOpen, color: "text-henna" },
]

const RECENT_ACTIVITY = [
  { action: "Completed Hadith Sciences quiz", points: "+150", time: "2 hours ago", category: "Hadith" },
  { action: "Achieved 7-day streak", points: "+100", time: "1 day ago", category: "Achievement" },
  { action: "Joined Quran Study Circle", points: "+50", time: "2 days ago", category: "Community" },
  { action: "Completed Five Pillars category", points: "+300", time: "3 days ago", category: "Category" },
]

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [showCelebration, setShowCelebration] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Zainab Zawu",
    email: "zainab@ilmhunt.com",
    location: "Maiduguri, Nigeria",
    joinDate: "Jan 2024",
    avatar: "https://picsum.photos/seed/zainab/200",
  })
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showCelebration])

  const handleEditProfile = () => {
    const newName = prompt("Enter new name:", userData.name)
    if (newName) {
      setUserData((prev) => ({ ...prev, name: newName }))
    }
  }

  const handleShareProfile = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    alert("Profile link copied to clipboard!")
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {showCelebration && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} gravity={0.1} />}
        
        <header className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild>
            <Link href="/home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareProfile}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
            <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </header>

        <Card className="mb-8 border-2 border-primary/20 shadow-xl bg-gradient-to-r from-primary/5 to-accent/5 transition-all duration-300 hover:shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-accent">
                  <AvatarImage src={userData.avatar} alt="User avatar" />
                  <AvatarFallback className="text-4xl font-bold bg-secondary text-secondary-foreground">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {showCelebration && (
                  <div className="absolute -top-2 -right-2">
                    <Star className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Talib
                  </Badge>
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl font-bold font-headline text-primary">{userData.name}</h1>
                  <Button size="sm" variant="ghost" onClick={handleEditProfile}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 justify-center md:justify-start mb-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userData.location} 🇳🇬</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {userData.joinDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">8,420</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-henna">7</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amethyst">47</div>
                    <div className="text-sm text-muted-foreground">Global Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-lapis">87%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Hafiz</span>
                    <span className="font-semibold">750/1000 XP</span>
                  </div>
                  <Progress value={75} className="h-3 bg-secondary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-lapis/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-lapis">
                    <TrendingUp className="h-5 w-5" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {STATS.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-lapis-soft p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        <span className="text-card-foreground">{stat.label}</span>
                      </div>
                      <span className="font-bold text-card-foreground">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-primary">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ACHIEVEMENTS.filter((a) => a.earned)
                      .slice(0, 3)
                      .map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-card-foreground">{achievement.name}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {achievement.date}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ACHIEVEMENTS.map((achievement, index) => (
                <Card
                  key={index}
                  className={`border-2 shadow-lg transition-all duration-300 hover:scale-105 ${
                    achievement.earned
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold text-card-foreground mb-2">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                    {achievement.earned ? (
                      <Badge className="bg-jade-soft text-jade">Earned {achievement.date}</Badge>
                    ) : (
                      <Badge variant="outline">Not Earned</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-primary">Category Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Holy Quran", progress: 85, questions: 156 },
                    { name: "Hadith Sciences", progress: 72, questions: 98 },
                    { name: "Five Pillars", progress: 100, questions: 45 },
                    { name: "Islamic History", progress: 45, questions: 67 },
                  ].map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span>{category.questions} questions</span>
                      </div>
                      <Progress value={category.progress} className="h-2 bg-secondary" />
                      <div className="text-xs text-muted-foreground text-right">{category.progress}% mastery</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Learning Streaks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">7</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded ${i < 7 ? "bg-primary/60 hover:bg-primary/80" : "bg-muted"} transition-colors`}
                      />
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Longest Streak</span>
                      <span className="font-semibold">12 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Active Days</span>
                      <span className="font-semibold">28 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-2 border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-jade">{activity.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        userData={userData}
        onUserDataChange={(update) => setUserData((prev) => ({ ...prev, ...update }))}
      />
    </>
  )
}
