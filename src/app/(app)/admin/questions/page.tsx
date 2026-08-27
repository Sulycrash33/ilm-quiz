import { createClient } from '@/lib/supabase/server'
import { QuestionsPageClient } from '@/components/admin/QuestionsPageClient'
import { listQuestions, getQuestionSummary } from './actions'

/**
 * The question console.
 *
 * This page used to select all 5,220 questions with no limit and no
 * pagination, and PostgREST returned the first 1,000 without saying so. It
 * now pages through `admin_list_questions`, which counts and slices in the
 * database.
 */
export default async function QuestionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Please sign in to access admin.</p></div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-[100dvh]"><p>Access denied. Admin only.</p></div>
  }

  const [first, summary] = await Promise.all([
    listQuestions({ limit: 25, offset: 0 }),
    getQuestionSummary(),
  ])

  if (!first.ok) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] px-6">
        <p className="text-center text-error">Could not load questions: {first.error}</p>
      </div>
    )
  }

  return (
    <QuestionsPageClient
      initialQuestions={first.questions}
      initialTotal={first.total}
      summary={summary.ok ? summary.summary : null}
    />
  )
}
