import { createClient } from '@/lib/supabase/server'
import { QuestionsPageClient } from '@/components/admin/QuestionsPageClient'

export default async function QuestionsPage() {
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

  // Fetch real questions
  const { data: rawQuestions } = await supabase
    .from('questions')
    .select('id, question_text, difficulty, review_status, choices, correct_choice_index, explanation, created_at, categories(name)')
    .order('created_at', { ascending: false })

  // Supabase's untyped client infers embedded foreign-key relations as
  // arrays even though `category_id` is a to-one relation - normalize to a
  // single object (or null) to match what QuestionsPageClient expects.
  const questions = (rawQuestions ?? []).map((q) => ({
    ...q,
    categories: Array.isArray(q.categories) ? (q.categories[0] ?? null) : q.categories,
  }))

  return <QuestionsPageClient questions={questions} />
}
