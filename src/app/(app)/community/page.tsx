"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { StudyCircle } from "@/components/game/StudyCircle"
import { ActivityFeed } from "@/components/game/ActivityFeed"

type CommunityTab = "groups" | "forum" | "challenges" | "mentorship"

const studyGroups = [
  {
    id: "1",
    name: "Quran Study Circle",
    description: "Daily Quran reading and discussion group",
    members: [
      { id: "1", name: "Ahmed", avatar: "https://picsum.photos/seed/ahmed/100" },
      { id: "2", name: "Fatima", avatar: "https://picsum.photos/seed/fatima/100" },
      { id: "3", name: "Omar", avatar: "https://picsum.photos/seed/omar/100" },
    ],
    maxMembers: 20,
    currentTopic: "Surah Al-Baqarah - Verse 255",
    isActive: true,
  },
  {
    id: "2",
    name: "Hadith Scholars",
    description: "Deep dive into authentic Hadith collections",
    members: [
      { id: "4", name: "Aisha", avatar: "https://picsum.photos/seed/aisha/100" },
      { id: "5", name: "Ali", avatar: "https://picsum.photos/seed/ali/100" },
    ],
    maxMembers: 15,
    currentTopic: "Sahih Bukhari - Book of Faith",
    isActive: false,
  },
  {
    id: "3",
    name: "Islamic History Buffs",
    description: "Exploring the rich history of Islam",
    members: [
      { id: "6", name: "Yusuf", avatar: "https://picsum.photos/seed/yusuf/100" },
      { id: "7", name: "Maryam", avatar: "https://picsum.photos/seed/maryam/100" },
      { id: "8", name: "Ibrahim", avatar: "https://picsum.photos/seed/ibrahim/100" },
      { id: "9", name: "Khadija", avatar: "https://picsum.photos/seed/khadija/100" },
    ],
    maxMembers: 25,
    currentTopic: "The Golden Age of Islam",
    isActive: true,
  },
]

const forumPosts = [
  {
    id: "1",
    title: "Best strategies for memorizing Quran?",
    author: "Aisha_92",
    authorRank: "Hafiz",
    category: "Quran",
    replies: 23,
    likes: 45,
    timeAgo: "2 hours ago",
    isAnswered: true,
  },
  {
    id: "2",
    title: "Understanding the concept of Tawheed",
    author: "Omar_Scholar",
    authorRank: "Shaykh",
    category: "Aqeedah",
    replies: 18,
    likes: 67,
    timeAgo: "4 hours ago",
    isAnswered: true,
  },
  {
    id: "3",
    title: "Ramadan preparation tips",
    author: "Fatima_H",
    authorRank: "Talib",
    category: "Worship",
    replies: 31,
    likes: 89,
    timeAgo: "6 hours ago",
    isAnswered: false,
  },
]

const challenges = [
  {
    id: "1",
    title: "Quran Verse Challenge",
    description: "Challenge your friends to identify Quranic verses",
    participants: 1247,
    timeLeft: "2d 14h",
    reward: "500 coins",
    difficulty: "medium" as const,
    isActive: true,
  },
  {
    id: "2",
    title: "Hadith Authentication",
    description: "Test knowledge of Hadith authenticity",
    participants: 892,
    timeLeft: "5d 8h",
    reward: "750 coins + Badge",
    difficulty: "hard" as const,
    isActive: false,
  },
  {
    id: "3",
    title: "Islamic History Timeline",
    description: "Arrange historical events in correct order",
    participants: 2156,
    timeLeft: "1d 6h",
    reward: "300 coins",
    difficulty: "easy" as const,
    isActive: true,
  },
]

const activities = [
  { id: "1", user: { name: "Ahmed", avatar: "https://picsum.photos/seed/ahmed/100" }, action: "joined", target: "Quran Study Circle", timestamp: "2 hours ago", type: "join" as const },
  { id: "2", user: { name: "Fatima", avatar: "https://picsum.photos/seed/fatima/100" }, action: "completed", target: "Hadith Quiz", timestamp: "4 hours ago", type: "quiz" as const },
  { id: "3", user: { name: "Omar", avatar: "https://picsum.photos/seed/omar/100" }, action: "earned", target: "7-day streak", timestamp: "6 hours ago", type: "streak" as const },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>("groups")

  const tabs: { id: CommunityTab; label: string; icon: React.ReactNode }[] = [
    { id: "groups", label: "Study Groups", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg> },
    { id: "forum", label: "Forum", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" /></svg> },
    { id: "challenges", label: "Challenges", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" /></svg> },
    { id: "mentorship", label: "Mentorship", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg> },
  ]

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <Link href="/home">
          <PremiumButton variant="ghost" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </PremiumButton>
        </Link>
        <div className="text-center">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Community Hub
          </h1>
          <p className="text-on-surface-variant">Connect, learn, and grow together</p>
        </div>
        <Link href="/leaderboard">
          <PremiumButton variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
            </svg>
            Rankings
          </PremiumButton>
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="font-bold text-3xl text-primary">12,847</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              ACTIVE LEARNERS
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-secondary">156</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              STUDY GROUPS
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-tertiary">2,341</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              FORUM POSTS
            </p>
          </div>
          <div>
            <p className="font-bold text-3xl text-primary-fixed">45</p>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              ACTIVE CHALLENGES
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              font-label-caps text-label-caps uppercase tracking-widest
              transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "groups" && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {studyGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StudyCircle {...group} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "forum" && (
          <motion.div
            key="forum"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Create Post */}
            <PremiumCard className="p-6">
              <h3 className="font-bold text-on-surface mb-4">Start a Discussion</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="What would you like to discuss?"
                  className="w-full px-4 py-3 bg-surface-container-high rounded-lg border border-white/5 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <PremiumBadge variant="primary" size="sm">Quran</PremiumBadge>
                    <PremiumBadge variant="secondary" size="sm">Hadith</PremiumBadge>
                    <PremiumBadge variant="tertiary" size="sm">General</PremiumBadge>
                  </div>
                  <PremiumButton variant="primary" size="sm">Post</PremiumButton>
                </div>
              </div>
            </PremiumCard>

            {/* Posts */}
            {forumPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumCard className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <PremiumAvatar size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface">{post.author}</span>
                          <PremiumBadge variant="primary" size="sm">{post.authorRank}</PremiumBadge>
                        </div>
                        <p className="text-sm text-on-surface-variant">{post.timeAgo}</p>
                      </div>
                    </div>
                    <PremiumBadge variant="secondary" size="sm">{post.category}</PremiumBadge>
                  </div>
                  <h3 className="font-bold text-on-surface text-lg mb-2">{post.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" /></svg>
                        {post.replies} replies
                      </button>
                    </div>
                    {post.isAnswered && (
                      <PremiumBadge variant="success" size="sm">Answered</PremiumBadge>
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "challenges" && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-on-surface text-lg">{challenge.title}</h3>
                      <PremiumBadge
                        variant={challenge.difficulty === "easy" ? "success" : challenge.difficulty === "medium" ? "warning" : "danger"}
                        size="sm"
                      >
                        {challenge.difficulty}
                      </PremiumBadge>
                    </div>
                    {challenge.isActive && <PremiumBadge variant="success" size="sm">ACTIVE</PremiumBadge>}
                  </div>
                  <p className="text-on-surface-variant mb-4">{challenge.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Participants</span>
                      <span className="font-bold text-on-surface">{challenge.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Time Left</span>
                      <span className="font-bold text-tertiary">{challenge.timeLeft}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Reward</span>
                      <span className="font-bold text-primary">{challenge.reward}</span>
                    </div>
                  </div>
                  <PremiumButton
                    variant={challenge.isActive ? "primary" : "secondary"}
                    fullWidth
                    disabled={!challenge.isActive}
                  >
                    {challenge.isActive ? "Join Challenge" : "Challenge Ended"}
                  </PremiumButton>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "mentorship" && (
          <motion.div
            key="mentorship"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <PremiumCard className="p-6">
              <h3 className="font-bold text-on-surface text-lg mb-4">Become a Mentor</h3>
              <p className="text-on-surface-variant mb-4">Share your knowledge and help guide fellow learners on their Islamic education journey.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-on-surface-variant">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Earn mentor badges and community recognition
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Make a positive impact in the Ummah
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Access exclusive resources and training
                </li>
              </ul>
              <PremiumButton variant="primary" fullWidth>Apply to be a Mentor</PremiumButton>
            </PremiumCard>

            <PremiumCard className="p-6">
              <h3 className="font-bold text-on-surface text-lg mb-4">Find a Mentor</h3>
              <p className="text-on-surface-variant mb-4">Get personalized guidance from experienced scholars and advanced learners.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-on-surface-variant">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Personalized learning paths
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  One-on-one guidance and Q&A sessions
                </li>
                <li className="flex items-center gap-2 text-on-surface-variant">
                  <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Accelerate your learning
                </li>
              </ul>
              <PremiumButton variant="secondary" fullWidth>Browse Mentors</PremiumButton>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Recent Activity</h3>
        <ActivityFeed activities={activities} />
      </motion.div>
    </div>
  )
}
