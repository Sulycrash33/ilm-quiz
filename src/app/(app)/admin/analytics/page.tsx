"use client"

import { motion } from "framer-motion"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumProgress } from "@/components/ui/premium-progress"

const userGrowthData = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 2400 },
  { month: "Mar", users: 3800 },
  { month: "Apr", users: 5200 },
  { month: "May", users: 7100 },
  { month: "Jun", users: 9400 },
  { month: "Jul", users: 12847 },
]

const quizPerformance = [
  { category: "Holy Quran", completions: 23456, accuracy: 87, avgTime: "2.3 min" },
  { category: "Five Pillars", completions: 34567, accuracy: 91, avgTime: "1.8 min" },
  { category: "Hadith Sciences", completions: 18234, accuracy: 82, avgTime: "2.8 min" },
  { category: "Islamic History", completions: 15678, accuracy: 79, avgTime: "3.1 min" },
  { category: "Arabic Language", completions: 12345, accuracy: 85, avgTime: "2.5 min" },
]

const retentionData = [
  { day: "Day 1", retention: 100 },
  { day: "Day 3", retention: 78 },
  { day: "Day 7", retention: 62 },
  { day: "Day 14", retention: 48 },
  { day: "Day 30", retention: 35 },
  { day: "Day 60", retention: 28 },
  { day: "Day 90", retention: 24 },
]

const geographicData = [
  { region: "Nigeria", users: 5423, percentage: 42 },
  { region: "Malaysia", users: 2341, percentage: 18 },
  { region: "Indonesia", users: 1892, percentage: 15 },
  { region: "Pakistan", users: 1234, percentage: 10 },
  { region: "Other", users: 1957, percentage: 15 },
]

export default function AnalyticsPage() {
  const maxUsers = Math.max(...userGrowthData.map(d => d.users))
  const maxCompletions = Math.max(...quizPerformance.map(d => d.completions))

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
            Analytics Dashboard
          </h1>
          <p className="text-on-surface-variant mt-1">
            Insights into user engagement and platform performance
          </p>
        </div>
        <div className="flex gap-2">
          <PremiumButton variant="secondary" size="sm">Last 7 Days</PremiumButton>
          <PremiumButton variant="primary" size="sm">Last 30 Days</PremiumButton>
          <PremiumButton variant="secondary" size="sm">All Time</PremiumButton>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4"
      >
        <PremiumCard className="p-4 text-center">
          <p className="text-sm text-on-surface-variant">Total Users</p>
          <p className="font-bold text-3xl text-primary">12,847</p>
          <p className="text-xs text-green-400">+18.5% vs last month</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="text-sm text-on-surface-variant">Daily Active Users</p>
          <p className="font-bold text-3xl text-secondary">2,341</p>
          <p className="text-xs text-green-400">+12% vs yesterday</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="text-sm text-on-surface-variant">Avg. Session</p>
          <p className="font-bold text-3xl text-tertiary">8.5 min</p>
          <p className="text-xs text-green-400">+2.1 min vs last week</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="text-sm text-on-surface-variant">Quiz Completion</p>
          <p className="font-bold text-3xl text-primary-fixed">87%</p>
          <p className="text-xs text-green-400">+3% vs last month</p>
        </PremiumCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                User Growth
              </h2>
              <PremiumBadge variant="success" size="sm">+18.5%</PremiumBadge>
            </div>
            <div className="flex items-end gap-2 h-48">
              {userGrowthData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.users / maxUsers) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-primary to-primary-container rounded-t-lg"
                  />
                  <p className="text-xs text-on-surface-variant mt-2">{data.month}</p>
                  <p className="text-xs font-bold text-on-surface">{(data.users / 1000).toFixed(1)}k</p>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Quiz Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Quiz Performance
              </h2>
              <PremiumButton variant="ghost" size="sm">View All</PremiumButton>
            </div>
            <div className="space-y-4">
              {quizPerformance.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface">{data.category}</span>
                    <span className="text-on-surface-variant">{data.completions.toLocaleString()} completions</span>
                  </div>
                  <PremiumProgress value={data.accuracy} size="sm" />
                  <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                    <span>{data.accuracy}% accuracy</span>
                    <span>Avg: {data.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Retention Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                User Retention
              </h2>
              <PremiumBadge variant="warning" size="sm">Day 30: 35%</PremiumBadge>
            </div>
            <div className="flex items-end gap-2 h-48">
              {retentionData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${data.retention}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-tertiary to-tertiary-container rounded-t-lg"
                  />
                  <p className="text-xs text-on-surface-variant mt-2">{data.day}</p>
                  <p className="text-xs font-bold text-on-surface">{data.retention}%</p>
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Geographic Distribution
              </h2>
              <PremiumButton variant="ghost" size="sm">Export</PremiumButton>
            </div>
            <div className="space-y-4">
              {geographicData.map((data, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface">{data.region}</span>
                    <span className="text-on-surface-variant">{data.users.toLocaleString()} users ({data.percentage}%)</span>
                  </div>
                  <PremiumProgress value={data.percentage} size="sm" />
                </div>
              ))}
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Top Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <PremiumCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Top Users by XP
            </h2>
            <PremiumButton variant="ghost" size="sm">View All Users</PremiumButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 font-label-caps text-label-caps text-on-surface-variant">RANK</th>
                  <th className="text-left p-3 font-label-caps text-label-caps text-on-surface-variant">USER</th>
                  <th className="text-left p-3 font-label-caps text-label-caps text-on-surface-variant">XP</th>
                  <th className="text-left p-3 font-label-caps text-label-caps text-on-surface-variant">QUIZZES</th>
                  <th className="text-left p-3 font-label-caps text-label-caps text-on-surface-variant">STREAK</th>
                  <th className="text-left p-3 font-label-caps text-label-caps text-on-surface-variant">ACCURACY</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: "Ahmed Al-Rashid", xp: 15420, quizzes: 234, streak: 45, accuracy: 92 },
                  { rank: 2, name: "Fatima Zahra", xp: 14890, quizzes: 198, streak: 38, accuracy: 89 },
                  { rank: 3, name: "Omar Ibn Khattab", xp: 13750, quizzes: 176, streak: 32, accuracy: 87 },
                  { rank: 4, name: "Aisha Bint Abu Bakr", xp: 12340, quizzes: 156, streak: 28, accuracy: 91 },
                  { rank: 5, name: "Ali Ibn Abi Talib", xp: 11890, quizzes: 145, streak: 25, accuracy: 85 },
                ].map((user, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors">
                    <td className="p-3">
                      <span className={`font-bold ${user.rank <= 3 ? "text-tertiary" : "text-on-surface-variant"}`}>
                        #{user.rank}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-on-surface">{user.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-primary">{user.xp.toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-on-surface">{user.quizzes}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-tertiary">🔥 {user.streak}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-400">{user.accuracy}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}
