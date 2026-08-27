"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useToast } from "@/hooks/use-toast"
import { deleteUser, type AdminUser } from "@/app/(app)/admin/users/actions"

interface UsersPageClientProps {
  users: AdminUser[]
}

function shortDate(iso: string | null): string {
  if (!iso) return "never"
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

/**
 * The register, with one destructive action on it.
 *
 * Removing a player is irreversible and takes their attempts, runs, XP and
 * league standing with it, so a single tap must not be able to do it: the
 * button only arms a confirmation that names the account, and the
 * confirmation is what calls the action. Same shape as the reset card on the
 * profile page, for the same reason.
 *
 * Admin pages are outside the i18n bundle by convention — the guard in
 * `npm run test:i18n` exempts this directory — so the copy here is English.
 */
export function UsersPageClient({ users }: UsersPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const reduce = useReducedMotion()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.displayName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  async function handleDelete(user: AdminUser) {
    if (busyId) return
    setBusyId(user.id)
    const result = await deleteUser(user.id)
    setBusyId(null)
    setConfirmingId(null)

    if (!result.ok) {
      toast({ variant: "destructive", title: "Could not remove that account", description: result.error })
      return
    }

    toast({ title: `Removed ${result.email}` })
    // The list is server-rendered, so pull it fresh rather than leaving a row
    // on screen for an account that no longer exists.
    router.refresh()
  }

  return (
    <div className="min-h-[100dvh] px-5 py-6 max-w-7xl mx-auto">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">
          User Management
        </h1>
        <p className="text-on-surface-variant">
          {users.length} {users.length === 1 ? "account" : "accounts"}
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
          aria-label="Filter by role"
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
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumCard className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">
                        {(user.displayName ?? "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-on-surface truncate">
                        {user.displayName ?? "Unknown"}
                        {user.isSelf && (
                          <span className="ml-2 text-xs font-normal text-on-surface-variant">(you)</span>
                        )}
                      </h3>
                      <p className="text-sm text-on-surface-variant truncate">{user.email ?? "No email"}</p>
                      <p className="text-xs text-on-surface-variant/70">
                        Joined {shortDate(user.createdAt)} · Last seen {shortDate(user.lastSignInAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.totalXp} XP</p>
                      <p className="text-sm text-on-surface-variant">
                        {user.attempts} answered · {user.streakCount} day streak
                      </p>
                    </div>
                    <PremiumBadge variant={user.role === "admin" ? "primary" : "secondary"}>
                      {user.role}
                    </PremiumBadge>

                    {/* You cannot remove yourself. The database refuses it too;
                        hiding the button means never offering what will fail. */}
                    {!user.isSelf && (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(user.id)}
                        disabled={busyId !== null}
                        aria-label={`Remove ${user.displayName ?? user.email ?? "this account"}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-error/40 px-3 py-2 text-sm font-semibold text-error transition-colors hover:bg-error/15 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {confirmingId === user.id && (
                  <div className="mt-4 space-y-3 rounded-lg border border-error/40 bg-error/5 p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-error shrink-0" aria-hidden="true" />
                      <p className="font-semibold text-on-surface">
                        Remove {user.email ?? user.displayName ?? "this account"}?
                      </p>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      This deletes the sign-in and everything attached to it — {user.attempts} answered{" "}
                      {user.attempts === 1 ? "question" : "questions"}, every run, {user.totalXp} XP,
                      achievements and league standing. It cannot be undone.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={busyId !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {busyId === user.id && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        {busyId === user.id ? "Removing..." : "Remove permanently"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={busyId !== null}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-white/5 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
