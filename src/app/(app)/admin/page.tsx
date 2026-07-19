"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumProgress } from "@/components/ui/premium-progress"

const stats = [
  {
    label: "Total Users",
    value: "12,847",
    change: "+234 this week",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
    color: "primary",
  },
  {
    label: "Active Today",
    value: "2,341",
    change: "+12% vs yesterday",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8l-6-6H6z" />
      </svg>
    ),
    color: "secondary",
  },
  {
    label: "Questions",
    value: "4,521",
    change: "+89 this week",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
      </svg>
    ),
    color: "tertiary",
  },
  {
    label: "Quizzes Taken",
    value: "89,234",
    change: "+1,234 today",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
      </svg>
    ),
    color: "primary",
  },
]

const quickActions = [
  {
    title: "Generate Questions",
    description: "Create new quiz questions using AI",
    href: "/admin/review",
    icon: "🤖",
    color: "primary",
  },
  {
    title: "Manage Categories",
    description: "Create, edit, and organize categories",
    href: "/admin/categories",
    icon: "📚",
    color: "secondary",
  },
  {
    title: "Review Queue",
    description: "Review AI-drafted questions",
    href: "/admin/review",
    icon: "✅",
    color: "tertiary",
  },
  {
    title: "User Management",
    description: "View and manage users",
    href: "/admin/users",
    icon: "👥",
    color: "primary",
  },
]

const recentActivity = [
  { user: "Ahmed", action: "completed", target: "Quran Quiz", time: "2 min ago", type: "quiz" },
  { user: "Fatima", action: "earned", target: "7-day streak", time: "5 min ago", type: "achievement" },
  { user: "Omar", action: "joined", target: "Hadith Group", time: "10 min ago", type: "social" },
  { user: "Aisha", action: "completed", target: "Five Pillars", time: "15 min ago", type: "quiz" },
  { user: "Ali", action: "earned", target: "Perfect Score", time: "20 min ago", type: "achievement" },
]

const topCategories = [
  { name: "Holy Quran", questions: 1247, completions: 23456, accuracy: 87 },
  { name: "Hadith Sciences", questions: 892, completions: 18234, accuracy: 82 },
  { name: "Five Pillars", questions: 456, completions: 34567, accuracy: 91 },
  { name: "Islamic History", questions: 678, completions: 15678, accuracy: 79 },
  { name: "Fiqh", questions: 534, completions: 12345, accuracy: 85 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">
            Admin Dashboard
          </h1>
          <p className="text-on-surface-variant mt-1">
            Welcome back. Here&apos;s what&apos;s happening with ILM Hunt.
          </p>
        </div>
        <PremiumBadge variant="warning" size="md">
          ADMIN
        </PremiumBadge>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-on-surface-variant text-sm">{stat.label}</p>
                  <p className="font-bold text-3xl text-on-surface mt-1">{stat.value}</p>
                  <p className="text-sm text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Link href={action.href}>
                <PremiumCard hover className="p-4 h-full">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center text-2xl`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{action.title}</h3>
                      <p className="text-sm text-on-surface-variant">{action.description}</p>
                    </div>
                  </div>
                </PremiumCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Recent Activity
              </h2>
              <PremiumButton variant="ghost" size="sm">View All</PremiumButton>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      activity.type === "quiz" ? "bg-primary/10 text-primary" :
                      activity.type === "achievement" ? "bg-tertiary/10 text-tertiary" :
                      "bg-secondary/10 text-secondary"
                    }`}>
                      {activity.type === "quiz" ? "📝" : activity.type === "achievement" ? "🏆" : "👥"}
                    </div>
                    <div>
                      <p className="text-sm text-on-surface">
                        <span className="font-bold">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        <span className="text-primary">{activity.target}</span>
                      </p>
                      <p className="text-xs text-on-surface-variant">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Top Categories
              </h2>
              <Link href="/admin/categories">
                <PremiumButton variant="ghost" size="sm">Manage</PremiumButton>
              </Link>
            </div>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface">{category.name}</span>
                    <span className="text-on-surface-variant">{category.questions} questions</span>
                  </div>
                  <PremiumProgress value={category.accuracy} size="sm" />
                  <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                    <span>{category.completions.toLocaleString()} completions</span>
                    <span>{category.accuracy}% accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <PremiumCard className="p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm text-on-surface">Database</p>
              <p className="text-xs text-green-400">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm text-on-surface">AI Service</p>
              <p className="text-xs text-green-400">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm text-on-surface">Auth Service</p>
              <p className="text-xs text-green-400">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2" />
              <p className="text-sm text-on-surface">Storage</p>
              <p className="text-xs text-yellow-400">78% Used</p>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}
