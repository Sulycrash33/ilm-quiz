"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"

interface User {
  id: string
  display_name: string | null
  email: string | null
  role: string
  total_xp: number | null
  streak_count: number | null
  created_at: string
}

interface UsersPageClientProps {
  users: User[]
}

export function UsersPageClient({ users }: UsersPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.display_name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen px-5 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          User Management
        </h1>
        <p className="text-on-surface-variant">
          {users.length} total users
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface placeholder:text-on-surface-variant/50"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 bg-surface-container border border-white/10 rounded-lg text-on-surface"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="reviewer">Reviewer</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <PremiumCard className="p-8 text-center">
            <p className="text-on-surface-variant">No users found.</p>
          </PremiumCard>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {(user.display_name ?? "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">{user.display_name ?? "Unknown"}</h3>
                      <p className="text-sm text-on-surface-variant">{user.email ?? "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.total_xp ?? 0} XP</p>
                      <p className="text-sm text-on-surface-variant">{user.streak_count ?? 0} day streak</p>
                    </div>
                    <PremiumBadge variant={user.role === "admin" ? "primary" : "secondary"}>
                      {user.role}
                    </PremiumBadge>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
