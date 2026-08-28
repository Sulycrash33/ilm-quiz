import { createClient } from '@/lib/supabase/server'
import { AnalyticsPageClient } from '@/components/admin/AnalyticsPageClient'

export default async function AnalyticsPage() {
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

  // Accuracy came from the most recent hundred attempts and was labelled as
  // though it covered all of them. It is counted over the whole table now, in
  // the database, alongside the rest of the dashboard numbers.
  const { data: statsJson } = await supabase.rpc('admin_dashboard_stats')
  const s = (statsJson ?? {}) as Record<string, number>

  const { data: categoryStats } = await supabase
    .from('categories')
    .select('id, name, questions(count)')
    .order('sort_order')

  return (
    <AnalyticsPageClient
      stats={{
        totalAttempts: s.total_attempts ?? 0,
        accuracy: s.accuracy_pct ?? 0,
      }}
      categoryStats={categoryStats ?? []}
    />
  )
}
