import { createClient } from '@/lib/supabase/server'
import { ExplanationsPageClient } from '@/components/admin/ExplanationsPageClient'
import { listDrafts } from '@/app/(app)/admin/explanations/actions'

export default async function ExplanationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Please sign in to access admin.</p></div>
  }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Access denied. Admin only.</p></div>
  }

  const [{ data: categories }, drafts] = await Promise.all([
    supabase.from('categories').select('id, name').order('sort_order'),
    listDrafts(undefined, 25, 0),
  ])

  // Progress comes from a function because the count cannot be a PostgREST
  // filter: `explanation.lt.300` compares text lexicographically, not by
  // length, and would return a confident meaningless number. See 0043.
  const { data: progressRows } = await supabase.rpc('admin_explanation_progress')
  const p = Array.isArray(progressRows) ? progressRows[0] : progressRows

  return (
    <ExplanationsPageClient
      categories={categories ?? []}
      initialRows={drafts.ok ? drafts.rows : []}
      initialTotal={drafts.ok ? drafts.total : 0}
      loadError={drafts.ok ? null : drafts.error}
      progress={{
        total: p?.o_total ?? 0,
        short: p?.o_short ?? 0,
        rewritten: p?.o_rewritten ?? 0,
        pending: p?.o_pending ?? 0,
        avgChars: p?.o_avg_chars ?? 0,
      }}
    />
  )
}
