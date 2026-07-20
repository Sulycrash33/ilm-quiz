import { createClient } from '@/lib/supabase/server'
import { QuestionsPageClient } from '@/components/admin/QuestionsPageClient'

export default async function QuestionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><p>Please sign in to access admin.</p></div>
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><p>Access denied. Admin only.</p></div>
  }

  // Fetch real questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, difficulty, review_status, choices, correct_choice_index, explanation, created_at, categories(name)')
    .order('created_at', { ascending: false })

  return <QuestionsPageClient questions={questions ?? []} />
}
