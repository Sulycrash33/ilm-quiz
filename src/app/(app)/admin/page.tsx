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

  // Fetch real stats
  const [
    { count: totalUsers },
    { count: totalQuestions },
    { count: totalAttempts },
    { data: recentAttempts },
    { data: topCategories },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('attempts').select('*', { count: 'exact', head: true }),
    supabase.from('attempts')
      .select('created_at, is_correct, questions(category_id, categories(name))')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('categories')
      .select('id, name, questions(count)')
      .order('name'),
  ])

  // Get active today (users who attempted today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: activeToday } = await supabase
    .from('attempts')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // What is waiting on a moderator right now, for the badge on the Moderation
  // card. Returns zeros for anyone who is not one, so no role branch is needed.
  const alerts = await getModerationAlertCounts()

  return (
    <AdminDashboardClient
      stats={{
        totalUsers: totalUsers ?? 0,
        activeToday: activeToday ?? 0,
        totalQuestions: totalQuestions ?? 0,
        totalAttempts: totalAttempts ?? 0,
      }}
      recentAttempts={recentAttempts ?? []}
      topCategories={topCategories ?? []}
      alerts={alerts}
    />
  )
}
