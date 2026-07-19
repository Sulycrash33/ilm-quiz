"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumAvatar } from "@/components/ui/premium-avatar"
import { PremiumModal } from "@/components/ui/premium-modal"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "reviewer" | "admin"
  totalXp: number
  streak: number
  quizzesCompleted: number
  joinDate: string
  lastActive: string
  status: "active" | "suspended" | "pending"
}

const initialUsers: User[] = [
  { id: "1", name: "Ahmed Al-Rashid", email: "ahmed@example.com", avatar: "https://picsum.photos/seed/ahmed/100", role: "admin", totalXp: 15420, streak: 45, quizzesCompleted: 234, joinDate: "Jan 2024", lastActive: "2 min ago", status: "active" },
  { id: "2", name: "Fatima Zahra", email: "fatima@example.com", avatar: "https://picsum.photos/seed/fatima/100", role: "reviewer", totalXp: 14890, streak: 38, quizzesCompleted: 198, joinDate: "Jan 2024", lastActive: "5 min ago", status: "active" },
  { id: "3", name: "Omar Ibn Khattab", email: "omar@example.com", avatar: "https://picsum.photos/seed/omar/100", role: "user", totalXp: 13750, streak: 32, quizzesCompleted: 176, joinDate: "Feb 2024", lastActive: "10 min ago", status: "active" },
  { id: "4", name: "Aisha Bint Abu Bakr", email: "aisha@example.com", avatar: "https://picsum.photos/seed/aisha/100", role: "user", totalXp: 12340, streak: 28, quizzesCompleted: 156, joinDate: "Feb 2024", lastActive: "1 hour ago", status: "active" },
  { id: "5", name: "Ali Ibn Abi Talib", email: "ali@example.com", avatar: "https://picsum.photos/seed/ali/100", role: "user", totalXp: 11890, streak: 25, quizzesCompleted: 145, joinDate: "Mar 2024", lastActive: "2 hours ago", status: "active" },
  { id: "6", name: "Khadijah Bint Khuwaylid", email: "khadijah@example.com", avatar: "https://picsum.photos/seed/khadija/100", role: "user", totalXp: 10560, streak: 22, quizzesCompleted: 132, joinDate: "Mar 2024", lastActive: "5 hours ago", status: "active" },
  { id: "7", name: "Yusuf Ibn Muhammad", email: "yusuf@example.com", avatar: "https://picsum.photos/seed/yusuf/100", role: "user", totalXp: 9870, streak: 18, quizzesCompleted: 118, joinDate: "Apr 2024", lastActive: "1 day ago", status: "active" },
  { id: "8", name: "Maryam Bint Imran", email: "maryam@example.com", avatar: "https://picsum.photos/seed/maryam/100", role: "user", totalXp: 9230, streak: 15, quizzesCompleted: 105, joinDate: "Apr 2024", lastActive: "3 days ago", status: "suspended" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleRoleChange = (userId: string, newRole: User["role"]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setIsModalOpen(false)
  }

  const handleStatusChange = (userId: string, newStatus: User["status"]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
  }

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin": return <PremiumBadge variant="warning" size="sm">ADMIN</PremiumBadge>
      case "reviewer": return <PremiumBadge variant="primary" size="sm">REVIEWER</PremiumBadge>
      default: return <PremiumBadge variant="secondary" size="sm">USER</PremiumBadge>
    }
  }

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active": return <PremiumBadge variant="success" size="sm">ACTIVE</PremiumBadge>
      case "suspended": return <PremiumBadge variant="danger" size="sm">SUSPENDED</PremiumBadge>
      case "pending": return <PremiumBadge variant="warning" size="sm">PENDING</PremiumBadge>
    }
  }

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
            User Management
          </h1>
          <p className="text-on-surface-variant mt-1">
            View and manage platform users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg border border-white/5">
            <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-surface-container-high rounded-lg border border-white/5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="reviewer">Reviewer</option>
            <option value="user">User</option>
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4"
      >
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-primary">{users.length}</p>
          <p className="text-sm text-on-surface-variant">Total Users</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-green-400">{users.filter(u => u.status === "active").length}</p>
          <p className="text-sm text-on-surface-variant">Active</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-tertiary">{users.filter(u => u.role === "admin").length}</p>
          <p className="text-sm text-on-surface-variant">Admins</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="font-bold text-2xl text-secondary">{users.filter(u => u.role === "reviewer").length}</p>
          <p className="text-sm text-on-surface-variant">Reviewers</p>
        </PremiumCard>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PremiumCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">USER</th>
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">ROLE</th>
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">STATUS</th>
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">XP</th>
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">STREAK</th>
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">LAST ACTIVE</th>
                  <th className="text-left p-4 font-label-caps text-label-caps text-on-surface-variant">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-white/5 hover:bg-surface-container-high/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <PremiumAvatar src={user.avatar} size="sm" />
                        <div>
                          <p className="font-bold text-on-surface">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4">
                      <span className="font-bold text-primary">{user.totalXp.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-tertiary">🔥 {user.streak}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-on-surface-variant text-sm">{user.lastActive}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsModalOpen(true)
                          }}
                        >
                          Edit
                        </PremiumButton>
                        {user.status === "active" ? (
                          <PremiumButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, "suspended")}
                          >
                            <span className="text-error">Suspend</span>
                          </PremiumButton>
                        ) : (
                          <PremiumButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, "active")}
                          >
                            <span className="text-green-400">Activate</span>
                          </PremiumButton>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Edit User Modal */}
      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit User Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-surface-container-high rounded-lg">
              <PremiumAvatar src={selectedUser.avatar} size="lg" />
              <div>
                <p className="font-bold text-on-surface">{selectedUser.name}</p>
                <p className="text-sm text-on-surface-variant">{selectedUser.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(["user", "reviewer", "admin"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedUser.id, role)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedUser.role === role
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-surface-container-high border-white/5 text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    <p className="font-bold capitalize">{role}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <PremiumButton variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>
                Close
              </PremiumButton>
            </div>
          </div>
        )}
      </PremiumModal>
    </div>
  )
}
