"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number
    suspendedUsers: number
    activeToday: number
    activeWeek: number
    totalQuestions: number
    scholarApproved: number
    totalAttempts: number
    accuracyPct: number
  }
  recentAttempts: any[]
  alerts?: { reports: number; applications: number }
}

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
  {
    title: "Moderation",
    description: "Reported posts and mentor applications",
    href: "/admin/moderation",
    icon: "🛡️",
    color: "secondary",
  },
  {
    title: "Economy",
    description: "Prices, rewards and XP multipliers",
    href: "/admin/economy",
    icon: "🪙",
    color: "tertiary",
  },
  {
    title: "Translations",
    description: "Automatic translation runs, and fixing what reads wrong",
    href: "/admin/translations",
    icon: "🌍",
    color: "secondary",
  },
  {
    title: "Daily Hadith",
    description: "The narration rotation, and its text in each language",
    href: "/admin/hadiths",
    icon: "📖",
    color: "tertiary",
  },
  {
    title: "Audit Log",
    description: "Every administrative action, with who and when",
    href: "/admin/audit",
    icon: "📜",
    color: "primary",
  },
]

export function AdminDashboardClient({
  stats,
  recentAttempts,
  alerts,
}: AdminDashboardClientProps) {
  // One number on the card: everything waiting on a decision. Splitting reports
  // from applications here would be two badges saying "go to the same page".
  const waiting = (alerts?.reports ?? 0) + (alerts?.applications ?? 0)

  return (
    <div className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          Admin Dashboard
        </h1>
        <p className="text-on-surface-variant">
          Manage your ILM Hunt platform
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: stats.suspendedUsers > 0 ? `Accounts (${stats.suspendedUsers} suspended)` : "Accounts",
            value: stats.totalUsers.toLocaleString(),
            icon: "👥",
          },
          {
            label: "Players today",
            value: stats.activeToday.toLocaleString(),
            icon: "📱",
            hint: `${stats.activeWeek.toLocaleString()} this week`,
          },
          {
            label: "Scholar approved",
            value: `${stats.scholarApproved.toLocaleString()} / ${stats.totalQuestions.toLocaleString()}`,
            icon: "❓",
          },
          {
            label: "Answers given",
            value: stats.totalAttempts.toLocaleString(),
            icon: "📝",
            hint: `${stats.accuracyPct}% correct`,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className="min-w-0">
                  <p className="font-bold text-2xl text-primary">{stat.value}</p>
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                  {"hint" in stat && stat.hint && (
                    <p className="text-xs text-on-surface-variant/70">{stat.hint}</p>
                  )}
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
        className="mb-8"
      >
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <PremiumCard hover className="p-4 h-full relative">
                {action.href === "/admin/moderation" && waiting > 0 && (
                  <span
                    className="absolute right-2 top-2 min-w-6 rounded-full bg-error px-2 py-0.5 text-center text-xs font-bold tabular-nums text-on-error"
                    aria-label={`${waiting} waiting on a moderator`}
                  >
                    {waiting > 99 ? "99+" : waiting}
                  </span>
                )}
                <div className="text-center">
                  <span className="text-3xl mb-2 block">{action.icon}</span>
                  <h3 className="font-semibold text-on-surface">{action.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">{action.description}</p>
                </div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Recent Activity</h2>
        <div className="glass-card p-6">
          {recentAttempts.length === 0 ? (
            <p className="text-on-surface-variant text-center py-4">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-container/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={attempt.is_correct ? "text-success" : "text-danger"}>
                      {attempt.is_correct ? "✓" : "✗"}
                    </span>
                    <span className="text-on-surface">
                      {attempt.questions?.categories?.name ?? "Unknown Category"}
                    </span>
                  </div>
                  <span className="text-sm text-on-surface-variant">
                    {new Date(attempt.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
