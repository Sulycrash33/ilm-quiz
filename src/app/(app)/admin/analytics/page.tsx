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

  // Fetch real analytics data
  const [
    { count: totalAttempts },
    { data: categoryStats },
    { data: recentAttempts },
  ] = await Promise.all([
    supabase.from('attempts').select('*', { count: 'exact', head: true }),
    supabase.from('categories')
      .select('id, name, questions(count)')
      .order('name'),
    supabase.from('attempts')
      .select('is_correct, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Calculate accuracy
  const correctAttempts = recentAttempts?.filter(a => a.is_correct).length ?? 0
  const accuracy = recentAttempts?.length ? Math.round((correctAttempts / recentAttempts.length) * 100) : 0

  return (
    <AnalyticsPageClient
      stats={{
        totalAttempts: totalAttempts ?? 0,
        accuracy,
      }}
      categoryStats={categoryStats ?? []}
    />
  )
}
