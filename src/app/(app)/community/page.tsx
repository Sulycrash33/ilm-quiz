"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DIFFICULTY_STYLES } from "@/lib/design-tokens"
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Trophy,
  Crown,
  Star,
  Heart,
  Share2,
  Plus,
  Search,
  Filter,
  Send,
  ThumbsUp,
  Reply,
  BookOpen,
  Target,
} from "lucide-react"

const STUDY_GROUPS = [
  {
    id: 1,
    name: "Quran Study Circle",
    description: "Daily Quran reading and discussion group",
    members: 127,
    category: "Quran",
    level: "All Levels",
    isJoined: true,
    lastActivity: "2 hours ago",
    avatar: "🕌",
  },
  {
    id: 2,
    name: "Hadith Scholars",
    description: "Deep dive into authentic Hadith collections",
    members: 89,
    category: "Hadith",
    level: "Advanced",
    isJoined: false,
    lastActivity: "5 hours ago",
    avatar: "📜",
  },
  {
    id: 3,
    name: "New Muslims Support",
    description: "Welcoming community for new converts",
    members: 234,
    category: "General",
    level: "Beginner",
    isJoined: true,
    lastActivity: "1 hour ago",
    avatar: "🤝",
  },
  {
    id: 4,
    name: "Islamic History Buffs",
    description: "Exploring the rich history of Islam",
    members: 156,
    category: "History",
    level: "Intermediate",
    isJoined: false,
    lastActivity: "3 hours ago",
    avatar: "🏛️",
  },
    {
    id: 5,
    name: "Fiqh Fundamentals",
    description: "Discussing the basics of Islamic jurisprudence.",
    members: 78,
    category: "Fiqh",
    level: "Beginner",
    isJoined: false,
    lastActivity: "1 day ago",
    avatar: "⚖️",
  },
  {
    id: 6,
    name: "Arabic Language Learners",
    description: "Practice Arabic with fellow students.",
    members: 182,
    category: "Language",
    level: "All Levels",
    isJoined: true,
    lastActivity: "Just now",
    avatar: "🔤",
  },
]

const FORUM_POSTS = [
  {
    id: 1,
    title: "Best strategies for memorizing Quran?",
    author: "Aisha_92",
    authorRank: "Hafiz",
    category: "Quran",
    replies: 23,
    likes: 45,
    timeAgo: "2 hours ago",
    content: "I'm struggling with memorization techniques. What methods have worked best for you?",
    isAnswered: true,
  },
  {
    id: 2,
    title: "Understanding the concept of Tawheed",
    author: "Omar_Scholar",
    authorRank: "Shaykh",
    category: "Aqeedah",
    replies: 18,
    likes: 67,
    timeAgo: "4 hours ago",
    content: "Can someone explain the different aspects of Tawheed in simple terms?",
    isAnswered: true,
  },
  {
    id: 3,
    title: "Ramadan preparation tips",
    author: "Fatima_H",
    authorRank: "Talib",
    category: "Worship",
    replies: 31,
    likes: 89,
    timeAgo: "6 hours ago",
    content: "What are your favorite ways to prepare spiritually for Ramadan?",
    isAnswered: false,
  },
  {
    id: 4,
    title: "Islamic finance vs conventional banking",
    author: "Abdullah_Finance",
    authorRank: "Faqih",
    category: "Finance",
    replies: 42,
    likes: 156,
    timeAgo: "8 hours ago",
    content: "Detailed comparison of Islamic banking principles with conventional systems.",
    isAnswered: true,
  },
  {
    id: 5,
    title: "Question about the validity of a hadith",
    author: "StudentOfKnowledge",
    authorRank: "Mubtadi",
    category: "Hadith",
    replies: 5,
    likes: 12,
    timeAgo: "1 day ago",
    content: "I came across a hadith and I'm not sure about its authenticity. Can anyone help?",
    isAnswered: false,
  },
]

const CHALLENGES = [
  {
    id: 1,
    title: "Quran Verse Challenge",
    description: "Challenge your friends to identify Quranic verses",
    participants: 1247,
    timeLeft: "2d 14h",
    reward: "500 coins",
    difficulty: "Medium",
    isActive: true,
  },
  {
    id: 2,
    title: "Hadith Authentication",
    description: "Test knowledge of Hadith authenticity",
    participants: 892,
    timeLeft: "5d 8h",
    reward: "750 coins + Badge",
    difficulty: "Hard",
    isActive: false,
  },
  {
    id: 3,
    title: "Islamic History Timeline",
    description: "Arrange historical events in correct order",
    participants: 2156,
    timeLeft: "1d 6h",
    reward: "300 coins",
    difficulty: "Easy",
    isActive: true,
  },
  {
    id: 4,
    title: "Fiqh Case Study",
    description: "Solve a real-world Fiqh problem.",
    participants: 543,
    timeLeft: "4d 2h",
    reward: "600 coins",
    difficulty: "Hard",
    isActive: true,
  },
]

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState("groups")
  const [searchTerm, setSearchTerm] = useState("")
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")

  const handleJoinGroup = (groupId: number) => {
    console.log("[v0] Joining group:", groupId)
  }

  const handleCreatePost = () => {
    if (newPostTitle.trim() && newPostContent.trim()) {
      console.log("[v0] Creating post:", { title: newPostTitle, content: newPostContent })
      setNewPostTitle("")
      setNewPostContent("")
    }
  }

  const handleJoinChallenge = (challengeId: number) => {
    console.log("[v0] Joining challenge:", challengeId)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild>
          <Link href="/home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline text-primary">Community Hub</h1>
          <p className="text-muted-foreground">Connect, learn, and grow together</p>
        </div>

        <Button asChild>
            <Link href="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
            </Link>
        </Button>
      </header>

      {/* Community Stats */}
      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold font-headline text-primary mb-1">12,847</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-lapis mb-1">156</div>
              <div className="text-sm text-muted-foreground">Study Groups</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amethyst mb-1">2,341</div>
              <div className="text-sm text-muted-foreground">Forum Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-henna mb-1">45</div>
              <div className="text-sm text-muted-foreground">Active Challenges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search study groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>

          {/* Study Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STUDY_GROUPS.map((group) => (
              <Card
                key={group.id}
                className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{group.avatar}</div>
                      <div>
                        <CardTitle className="text-lg text-primary">{group.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {group.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {group.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {group.isJoined && <Badge className="bg-jade-soft text-jade">Joined</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.members} members
                      </span>
                      <span>Last active: {group.lastActivity}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    {group.isJoined ? (
                      <Button variant="outline" className="w-full bg-transparent">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View Discussions
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinGroup(group.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Join Group
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forum" className="space-y-6">
          {/* Create New Post */}
          <Card className="border-2 border-accent/20 shadow-lg bg-gradient-to-br from-accent/5 to-accent/10">
            <CardHeader>
              <CardTitle className="text-accent-foreground">Start a Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What would you like to discuss?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <Textarea
                placeholder="Share your thoughts, questions, or insights..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="outline">Quran</Badge>
                  <Badge variant="outline">Hadith</Badge>
                  <Badge variant="outline">General</Badge>
                </div>
                <Button onClick={handleCreatePost} variant="secondary">
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Forum Posts */}
          <div className="space-y-4">
            {FORUM_POSTS.map((post) => (
              <Card
                key={post.id}
                className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-card-foreground">{post.author}</span>
                          <Badge variant="secondary" className="text-xs">
                            {post.authorRank}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{post.timeAgo}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-card-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Reply className="h-4 w-4 mr-1" />
                        {post.replies} replies
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    {post.isAnswered && (
                      <Badge className="bg-jade-soft text-jade">
                        <Star className="h-3 w-3 mr-1" />
                        Answered
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Community Challenges</h2>
            <p className="text-muted-foreground">Compete with fellow learners and earn rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHALLENGES.map((challenge) => (
              <Card
                key={challenge.id}
                className="border-2 border-amethyst/30 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-headline text-amethyst">{challenge.title}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${
                          challenge.difficulty === "Easy"
                            ? `${DIFFICULTY_STYLES.easy.border} ${DIFFICULTY_STYLES.easy.text}`
                            : challenge.difficulty === "Medium"
                              ? `${DIFFICULTY_STYLES.medium.border} ${DIFFICULTY_STYLES.medium.text}`
                              : `${DIFFICULTY_STYLES.hard.border} ${DIFFICULTY_STYLES.hard.text}`
                        }`}
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    {challenge.isActive && <Badge className="bg-jade-soft text-jade">Active</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Participants</span>
                      <span className="font-semibold">{challenge.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Left</span>
                      <span className="font-semibold text-henna">{challenge.timeLeft}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Reward</span>
                      <span className="font-semibold text-primary">{challenge.reward}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      variant="secondary"
                      className="w-full"
                      disabled={!challenge.isActive}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      {challenge.isActive ? "Join Challenge" : "Challenge Ended"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentorship" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Mentorship Program</h2>
            <p className="text-muted-foreground">Connect with experienced learners and scholars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Become a Mentor */}
            <Card className="border-2 border-accent/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/20">
                <CardTitle className="flex items-center gap-2 text-accent-foreground">
                  <Crown className="h-6 w-6" />
                  Become a Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Share your knowledge and help guide fellow learners on their Islamic education journey.
                </p>
                <div className="space-y-2 text-sm text-card-foreground">
                  <div className="flex items-start gap-3">
                    <Star className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <span>Earn mentor badges and community recognition for your contributions.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <span>Make a positive and lasting impact in the Ummah.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <span>Access exclusive resources and training materials for mentors.</span>
                  </div>
                </div>
                <Button className="w-full">Apply to be a Mentor</Button>
              </CardContent>
            </Card>

            {/* Find a Mentor */}
            <Card className="border-2 border-secondary-foreground/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-secondary/50 to-secondary/30">
                <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                  <Users className="h-6 w-6" />
                  Find a Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Get personalized guidance from experienced scholars and advanced learners.
                </p>
                <div className="space-y-2 text-sm text-card-foreground">
                   <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 mt-1 text-secondary-foreground shrink-0" />
                    <span>Receive personalized learning paths tailored to your goals.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-4 w-4 mt-1 text-secondary-foreground shrink-0" />
                    <span>Benefit from one-on-one guidance and Q&A sessions.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 mt-1 text-secondary-foreground shrink-0" />
                    <span>Accelerate your learning with goal-oriented support.</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full">Browse Mentors</Button>
              </CardContent>
            </Card>
          </div>

          {/* Featured Mentors */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Featured Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Dr. Amina Hassan", specialty: "Quran & Tafsir", students: 45, rating: 4.9 },
                  { name: "Sheikh Omar Al-Rashid", specialty: "Hadith Sciences", students: 67, rating: 4.8 },
                  { name: "Ustadha Khadija Ali", specialty: "Islamic History", students: 32, rating: 5.0 },
                ].map((mentor, index) => (
                  <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarFallback className="text-lg">
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-card-foreground">{mentor.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{mentor.specialty}</p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span>{mentor.students} students</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" />
                        {mentor.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
