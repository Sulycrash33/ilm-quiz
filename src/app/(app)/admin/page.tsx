import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'
import { getModerationAlertCounts } from '@/app/(app)/community/forum-actions'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Please sign in to access admin.</p></div>
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Access denied. Admin only.</p></div>
  }

  // One call, counted in the database.
  //
  // Two of these numbers used to be wrong. "Active Today" ran
  // `.select('user_id', { count: 'exact', head: true })` with a date filter,
  // which counts attempt *rows* — one player answering eighty questions read
  // as eighty active users. And an unbounded select is capped at 1,000 rows by
  // PostgREST, so anything tallied in JavaScript from a full-table fetch was
  // going to be wrong the moment the table grew. `admin_dashboard_stats()`
  // (migrations 0032 and 0033) counts distinct users over the whole table.
  const { data: statsJson } = await supabase.rpc('admin_dashboard_stats')
  const s = (statsJson ?? {}) as Record<string, number>

  const { data: recentAttempts } = await supabase
    .from('attempts')
    .select('created_at, is_correct, questions(category_id, categories(name))')
    .order('created_at', { ascending: false })
    .limit(10)

  // What is waiting on a moderator right now, for the badge on the Moderation
  // card. Returns zeros for anyone who is not one, so no role branch is needed.
  const alerts = await getModerationAlertCounts()

  return (
    <AdminDashboardClient
      stats={{
        totalUsers: s.total_users ?? 0,
        suspendedUsers: s.suspended_users ?? 0,
        activeToday: s.active_today ?? 0,
        activeWeek: s.active_week ?? 0,
        totalQuestions: s.total_questions ?? 0,
        scholarApproved: s.scholar_approved ?? 0,
        totalAttempts: s.total_attempts ?? 0,
        accuracyPct: s.accuracy_pct ?? 0,
      }}
      recentAttempts={recentAttempts ?? []}
      alerts={alerts}
    />
  )
}
